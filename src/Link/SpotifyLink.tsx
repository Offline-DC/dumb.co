// SpotifyLink.tsx — /link
//
// Completes a Spotify sign-in on behalf of a dumbphone.
//
// Why this page exists: the phone's WebView can't finish Spotify's sign-in. The
// /authorize consent page ships a JS bundle the device's Chromium can't parse
// ("Uncaught SyntaxError: Unexpected token '='"), so it renders as a blank screen
// with nothing to press. A CAPTCHA, if one appears, is worse — an image grid wants
// pointer input a D-pad can't produce on a 240x320 display. So the browser half of
// OAuth happens here instead.
//
// What this page can and cannot do, because it constrains the whole design:
// the app authorizes under librespot's and ncspot's registered client ids, so the
// redirect URI is fixed at http://127.0.0.1:8989/login and cannot be changed to a
// dumb.co URL. (Registering our own Spotify app doesn't rescue it — since Feb 2026
// a Development Mode app is capped at 5 users.) So Spotify will always bounce the
// browser to a loopback address that nothing is listening on, and the user has to
// hand us the resulting address themselves. That's the one piece of friction here,
// and it isn't removable from a web page.
//
// What travels over the network: the phone builds the authorize URLs and keeps
// every PKCE verifier. This page receives those URLs, and sends back the redirect
// URL Spotify produced — which carries an authorization *code*. The phone exchanges
// the codes itself. So neither this page nor the relay ever holds an access token, a
// refresh token, or a verifier, and a code alone redeems nothing.

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "../Android/index.module.css";

// The pairing relay (tools/pair-relay/server.py in the spotify-app repo).
//
// Build-time only, and deliberately NOT a ?relay= query parameter: this page
// navigates the user to a URL it gets from the relay, so letting a link choose
// that endpoint invites exactly the phishing shape we don't want.
//
// offline-dc-backend serves the relay at /spotify-pair
// (offline-dc-twilio/src/routes/spotifyPairRoutes.js) and already allows
// https://dumb.co in its CORS allowlist, so this needs no configuration.
//
// Deliberately a hardcoded constant and NOT a ?relay= query parameter: this page
// navigates the user to a URL it gets from the relay, and letting a link choose
// that endpoint invites exactly the phishing shape we don't want. Must stay https
// — a page on https://dumb.co cannot fetch plain http (mixed content).
const RELAY_BASE = "https://offline-dc-backend-ba4815b2bcc8.herokuapp.com/spotify-pair";

// The loopback address Spotify is registered to bounce to. Kept in lockstep with
// SpotifyAuth.REDIRECT_URI in the app.
const REDIRECT_PREFIX = "http://127.0.0.1:8989/login";
const AUTHORIZE_PREFIX = "https://accounts.spotify.com/authorize?";

// Headers use Helvetica (overrides the site's default typewriter heading font).
const HELVETICA = '"Helvetica Neue", Helvetica, Arial, sans-serif';

const CODE_LENGTH = 6;

type Step = { label: string; authorize_url: string; done: boolean };
type Plan = { steps: Step[]; expires_in: number };

type Phase =
  | { kind: "entry" }
  | { kind: "loading" }
  | { kind: "working"; plan: Plan; index: number }
  | { kind: "done" }
  | { kind: "error"; message: string };

/** Pull the `state` the phone generated out of an authorize URL, so a user who
 *  only manages to copy the code itself can still be helped. */
function stateOf(authorizeUrl: string): string | null {
  try {
    return new URL(authorizeUrl).searchParams.get("state");
  } catch {
    return null;
  }
}

/**
 * Turn whatever the user pasted into a redirect URL the relay will accept.
 *
 * Generous on purpose. People paste the whole address, sometimes with a trailing
 * space or a stray newline; some browsers show the error page without the query;
 * and a few users will find the `code=` value and paste only that. Anything we can
 * unambiguously interpret is better than making them try again.
 *
 * Returns a string to submit, or an { error } to show.
 */
function normalizePaste(
  raw: string,
  authorizeUrl: string,
): { url: string } | { error: string } {
  const text = raw.trim().replace(/\s+/g, "");
  if (!text) return { error: "Paste the address from the other tab first." };

  if (text.startsWith(REDIRECT_PREFIX)) {
    let parsed: URL;
    try {
      parsed = new URL(text);
    } catch {
      return { error: "That doesn't look like a full web address." };
    }
    const err = parsed.searchParams.get("error");
    if (err) {
      return {
        error:
          err === "access_denied"
            ? "Spotify says the sign-in was declined. Start the step again and choose Agree."
            : `Spotify returned an error: ${err}`,
      };
    }
    if (!parsed.searchParams.get("code")) {
      return {
        error:
          "That address has no sign-in code in it. Make sure you copied the address " +
          "from the tab that failed to load, after signing in.",
      };
    }
    return { url: text };
  }

  // Someone pasted a different URL entirely — most often the authorize page,
  // because they copied before finishing.
  if (/^https?:\/\//i.test(text)) {
    if (text.startsWith("https://accounts.spotify.com")) {
      return {
        error:
          "That's still the Spotify page. Finish signing in first — you'll land on a " +
          "page that won't load, and that's the address we need.",
      };
    }
    return { error: `We need the address starting ${REDIRECT_PREFIX}` };
  }

  // A bare authorization code. We know the state, since the phone put it in the
  // authorize URL, so we can rebuild the address they were looking at.
  if (/^[A-Za-z0-9_-]{16,}$/.test(text)) {
    const state = stateOf(authorizeUrl);
    if (!state) return { error: `We need the whole address, starting ${REDIRECT_PREFIX}` };
    const rebuilt = new URL(REDIRECT_PREFIX);
    rebuilt.searchParams.set("code", text);
    rebuilt.searchParams.set("state", state);
    return { url: rebuilt.toString() };
  }

  return { error: `That doesn't look right. We need the address starting ${REDIRECT_PREFIX}` };
}

export default function SpotifyLink() {
  // Prefilled from ?code= so the phone could one day show a full link instead of
  // asking for typing. Harmless if absent.
  const initialCode = useMemo(() => {
    if (typeof window === "undefined") return "";
    const q = new URLSearchParams(window.location.search).get("code") ?? "";
    return q.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, CODE_LENGTH);
  }, []);

  const [code, setCode] = useState(initialCode);
  const [phase, setPhase] = useState<Phase>({ kind: "entry" });
  const [paste, setPaste] = useState("");
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [opened, setOpened] = useState(false);

  const load = useCallback(async (raw: string) => {
    const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (clean.length !== CODE_LENGTH) {
      setPhase({ kind: "error", message: `That code should be ${CODE_LENGTH} characters.` });
      return;
    }
    setPhase({ kind: "loading" });
    try {
      const r = await fetch(`${RELAY_BASE}/pair/${encodeURIComponent(clean)}`);
      if (r.status === 404 || r.status === 410) {
        setPhase({
          kind: "error",
          message: "That code has expired or was never valid. Get a fresh one on the phone.",
        });
        return;
      }
      if (r.status === 429) {
        setPhase({
          kind: "error",
          message: "Too many wrong codes from this network. Wait a few minutes and try again.",
        });
        return;
      }
      if (!r.ok) {
        setPhase({ kind: "error", message: `The pairing service returned an error (${r.status}).` });
        return;
      }
      const plan: Plan = await r.json();
      if (!plan.steps?.length) {
        setPhase({ kind: "error", message: "There's nothing to do for that code." });
        return;
      }
      // Defence in depth: the relay validates these, but never navigate to a URL
      // from the network without checking it here too.
      const bad = plan.steps.find((s) => !s.authorize_url?.startsWith(AUTHORIZE_PREFIX));
      if (bad) {
        setPhase({
          kind: "error",
          message: "The pairing service sent something that isn't a Spotify sign-in link. Stopping.",
        });
        return;
      }
      const next = plan.steps.findIndex((s) => !s.done);
      if (next === -1) {
        setPhase({ kind: "done" });
        return;
      }
      setCode(clean);
      setPaste("");
      setPasteError(null);
      setOpened(false);
      setPhase({ kind: "working", plan, index: next });
    } catch {
      setPhase({
        kind: "error",
        message: "Couldn't reach the pairing service. Check your connection and try again.",
      });
    }
  }, []);

  // Auto-start when the code arrived in the URL, so a scanned or tapped link
  // doesn't make the user press anything extra.
  useEffect(() => {
    if (initialCode.length === CODE_LENGTH) void load(initialCode);
  }, [initialCode, load]);

  async function submitPaste() {
    if (phase.kind !== "working") return;
    const step = phase.plan.steps[phase.index];
    const parsed = normalizePaste(paste, step.authorize_url);
    if ("error" in parsed) {
      setPasteError(parsed.error);
      return;
    }
    setPasteError(null);
    setBusy(true);
    try {
      const r = await fetch(
        `${RELAY_BASE}/pair/${encodeURIComponent(code)}/step/${phase.index}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ redirect_url: parsed.url }),
        },
      );
      if (r.status === 409) {
        setPasteError("That step was already completed.");
      } else if (r.status === 404 || r.status === 410) {
        setPhase({ kind: "error", message: "The pairing expired. Get a fresh code on the phone." });
        return;
      } else if (!r.ok) {
        setPasteError(`The pairing service rejected that (${r.status}).`);
        setBusy(false);
        return;
      }

      const steps = phase.plan.steps.map((s, i) => (i === phase.index ? { ...s, done: true } : s));
      const next = steps.findIndex((s) => !s.done);
      setPaste("");
      setOpened(false);
      if (next === -1) setPhase({ kind: "done" });
      else setPhase({ kind: "working", plan: { ...phase.plan, steps }, index: next });
    } catch {
      setPasteError("Couldn't reach the pairing service. Try again.");
    } finally {
      setBusy(false);
    }
  }

  // -- render ---------------------------------------------------------------

  const header = (
    <div className={styles.header}>
      <h1 className={styles.h1} style={{ fontFamily: HELVETICA }}>
        Connect Spotify
      </h1>
      <p className={styles.sub}>Finish signing in here, and your phone picks it up.</p>
    </div>
  );

  if (phase.kind === "loading") {
    return (
      <div className={styles.page} style={{ flexDirection: "column", gap: 0 }}>
        {header}
        <div className={styles.card}>
          <p className={styles.markdown}>Checking that code…</p>
        </div>
      </div>
    );
  }

  if (phase.kind === "error") {
    return (
      <div className={styles.page} style={{ flexDirection: "column", gap: 0 }}>
        {header}
        <div className={styles.card}>
          <p className={styles.markdown}>{phase.message}</p>
          <button
            className={styles.button}
            onClick={() => {
              setPhase({ kind: "entry" });
              setPaste("");
              setPasteError(null);
            }}
          >
            Start over
          </button>
        </div>
      </div>
    );
  }

  if (phase.kind === "done") {
    return (
      <div className={styles.page} style={{ flexDirection: "column", gap: 0 }}>
        {header}
        <div className={styles.card}>
          <div style={{ fontSize: 40, color: "#1DB954", textAlign: "center" }}>&#10003;</div>
          <div className={styles.markdown}>
            <h2 style={{ fontFamily: HELVETICA }}>All set</h2>
            <p>
              Look at your phone — it should finish signing in within a few seconds. You can
              close this page.
            </p>
            <p style={{ opacity: 0.7 }}>
              You won't need to do this again. The phone remembers the sign-in and connects on
              its own from now on.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (phase.kind === "entry") {
    return (
      <div className={styles.page} style={{ flexDirection: "column", gap: 0 }}>
        {header}
        <div className={styles.card}>
          <div className={styles.markdown}>
            <p>
              On your phone, choose <strong>Sign in from a computer</strong>. It shows a
              6-character code. Type it here.
            </p>
          </div>
          <input
            value={code}
            onChange={(e) =>
              setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, CODE_LENGTH))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") void load(code);
            }}
            placeholder="ABC234"
            autoFocus
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            inputMode="text"
            aria-label="Pairing code"
            style={{
              width: "100%",
              boxSizing: "border-box",
              fontSize: 28,
              letterSpacing: 6,
              textAlign: "center",
              padding: "12px 8px",
              margin: "8px 0 16px",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          />
          <button
            className={`${styles.button} ${code.length !== CODE_LENGTH ? styles.buttonDisabled : ""}`}
            disabled={code.length !== CODE_LENGTH}
            onClick={() => void load(code)}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // phase.kind === "working"
  const step = phase.plan.steps[phase.index];
  const total = phase.plan.steps.length;

  return (
    <div className={styles.page} style={{ flexDirection: "column", gap: 0 }}>
      {header}
      <div className={styles.card}>
        <div className={styles.badge}>
          Step {phase.index + 1} of {total} · {step.label}
        </div>

        <div className={styles.markdown}>
          <p>
            {total > 1 && phase.index > 0
              ? "One more. Spotify needs to approve this part separately."
              : "Sign in to Spotify in a new tab."}
          </p>
        </div>

        <button
          className={styles.button}
          onClick={() => {
            window.open(step.authorize_url, "_blank", "noopener,noreferrer");
            setOpened(true);
          }}
        >
          {opened ? "Reopen the Spotify tab" : "Sign in with Spotify"}
        </button>

        <div className={styles.markdown} style={{ marginTop: 20 }}>
          <h2 style={{ fontFamily: HELVETICA }}>Then copy the address</h2>
          <p>
            After you approve it, that tab will try to load a page and{" "}
            <strong>fail</strong> — you'll see something like “This site can't be reached”.
            That's expected: the page it's looking for lives on your phone, not on this
            computer.
          </p>
          <p>
            Copy the whole address out of that tab's address bar and paste it below. It starts
            with <code>127.0.0.1</code>.
          </p>
        </div>

        <input
          value={paste}
          onChange={(e) => {
            setPaste(e.target.value);
            setPasteError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") void submitPaste();
          }}
          placeholder="http://127.0.0.1:8989/login?code=…"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Address from the other tab"
          style={{
            width: "100%",
            boxSizing: "border-box",
            fontSize: 14,
            padding: "10px 8px",
            margin: "8px 0 12px",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        />

        {pasteError && (
          <p className={styles.notice} role="alert">
            {pasteError}
          </p>
        )}

        <button
          className={`${styles.button} ${!paste.trim() || busy ? styles.buttonDisabled : ""}`}
          disabled={!paste.trim() || busy}
          onClick={() => void submitPaste()}
        >
          {busy ? "Sending…" : phase.index + 1 < total ? "Next step" : "Finish"}
        </button>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Nothing here can see your Spotify password, and no access token passes through this
            page — only a one-time code your phone redeems itself.
          </p>
        </div>
      </div>
    </div>
  );
}
