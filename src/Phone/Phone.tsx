import { useState, useRef, useEffect } from "react";
import Screen from "./Screen";
import Navigation from "./Navigation";
import Logo from "./Logo";
import Footer from "./Footer";
import { OFFLINE_PHONE_NUMBER } from "../App";
import ReactGA from "react-ga4";
import rawPressData from "../Press/press_data.md?raw";
import { openPressItemAtRow } from "../Press/parsePressData";
import { useNavigate, useLocation } from "react-router-dom";
import type { DirInput } from "./SnakeGame";
import HomeModal from "../HomeModal";

export interface navigationItem {
  screen: string;
  row: number;
}

type Props = {
  initialScreen?: string;
};

const SCREEN_TO_PATH: Record<string, string> = {
  press: "/press",
  "dumbphone 2": "/phone",
  FAQ: "/faq",
};

// Maps a screen reached via direct URL (initialScreen) to the parent menu
// it should "back" into. Anything not in this map backs straight to Home.
const SCREEN_PARENT: Record<string, string> = {
  "dumb international": "get involved",
};

const SNAKE_SEQUENCE = ["up", "up", "down", "down", "left", "right"];

function Phone({ initialScreen }: Props) {
  const [row, setRow] = useState(0);
  // Seed nav stack from initialScreen so a deep-linked URL (e.g. /faq) has
  // a sensible "back" target on its very first render. Mirrors the
  // initialScreen useEffect below — kept in useState so the first render
  // already has the right stack instead of needing a follow-up update.
  const [navigationStack, setNavigationStack] = useState<navigationItem[]>(
    () => {
      if (!initialScreen) return [];
      const stack: navigationItem[] = [{ screen: "Home", row: 0 }];
      const parent = SCREEN_PARENT[initialScreen];
      if (parent) stack.push({ screen: parent, row: 0 });
      return stack;
    },
  );
  // Initialize directly from initialScreen so the URL-sync effect below
  // doesn't briefly see screen="Home" on a deep-link load and `navigate("/")`
  // — which was wiping the `#slug` hash from URLs like /faq#some-question
  // before FAQContent could read it.
  const [screen, setScreen] = useState(initialScreen ?? "Home");
  const [keypadNum, setKeypadNum] = useState("");
  const [audioFile, setAudioFile] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [snakeDirInput, setSnakeDirInput] = useState<DirInput | null>(null);

  // Open the home modal by default when landing on dumb.co ("/") — i.e.
  // when no `initialScreen` is provided. It's a one-shot: once the user
  // clicks × we never re-open it during this mount.
  const [showHomeModal, setShowHomeModal] = useState<boolean>(!initialScreen);

  const navigate = useNavigate();
  const location = useLocation();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sequenceBuffer = useRef<string[]>([]);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    audioRef.current = new Audio(`/audio/${audioFile}`);
    audioRef.current.play();
  };

  // Clear sequence buffer when navigating away from Home
  useEffect(() => {
    if (screen !== "Home") {
      sequenceBuffer.current = [];
    }
  }, [screen]);

  const appendSequence = (dir: string): boolean => {
    sequenceBuffer.current = [...sequenceBuffer.current, dir].slice(
      -SNAKE_SEQUENCE.length,
    );
    return sequenceBuffer.current.join(",") === SNAKE_SEQUENCE.join(",");
  };

  const handleBackButton = () => {
    ReactGA.event({
      category: "User",
      action: "Clicked Back Button",
      label: "Back Button",
    });

    setAudioFile("");
    setKeypadNum("");

    if (screen === "snake") {
      setScreen("Home");
      setRow(0);
      setSnakeDirInput(null);
      return;
    }

    const last = navigationStack[navigationStack.length - 1];
    if (!last) {
      setScreen("Home");
      setRow(0);
      setNavigationStack([]);
      return;
    }

    setScreen(last.screen);
    setRow(last.row);
    setNavigationStack(navigationStack.slice(0, -1));
  };

  const handleCenterClick = () => {
    if (
      screen === "internship" ||
      screen === "dumbphone 2" ||
      screen === "dumb international" ||
      screen === "dumb campus" ||
      screen === "FAQ"
    ) {
      return;
    }
    if (screen === "press") {
      openPressItemAtRow(row, rawPressData);
      return;
    }

    const prev: navigationItem = {
      screen: screen,
      row: row,
    };
    playSound();
    setNavigationStack([...navigationStack, prev]);
    setRow(0);
    setScreen(options[row]);
  };

  const handleUpClick = () => {
    if (screen === "snake") {
      setSnakeDirInput((prev) => ({ dir: "up", n: (prev?.n ?? 0) + 1 }));
      return;
    }
    if (screen === "Home") {
      if (appendSequence("up")) {
        sequenceBuffer.current = [];
        setScreen("snake");
        return;
      }
    }
    if (row > 0) {
      setRow((r) => r - 1);
    }
  };

  const handleDownClick = () => {
    if (screen === "snake") {
      setSnakeDirInput((prev) => ({ dir: "down", n: (prev?.n ?? 0) + 1 }));
      return;
    }
    if (screen === "Home") {
      if (appendSequence("down")) {
        sequenceBuffer.current = [];
        setScreen("snake");
        return;
      }
    }
    if (row < options.length - 1) {
      setRow((r) => r + 1);
    }
  };

  const handleLeftClick = () => {
    if (screen === "snake") {
      setSnakeDirInput((prev) => ({ dir: "left", n: (prev?.n ?? 0) + 1 }));
      return;
    }
    if (screen === "Home") {
      if (appendSequence("left")) {
        sequenceBuffer.current = [];
        setScreen("snake");
        return;
      }
    }
    handleBackButton();
  };

  const handleRightClick = () => {
    if (screen === "snake") {
      setSnakeDirInput((prev) => ({ dir: "right", n: (prev?.n ?? 0) + 1 }));
      return;
    }
    if (screen === "Home") {
      if (appendSequence("right")) {
        sequenceBuffer.current = [];
        setScreen("snake");
        return;
      }
    }
    handleCenterClick();
  };

  const handleSnakeGameEnd = () => {
    setScreen("Home");
    setRow(0);
    setSnakeDirInput(null);
    sequenceBuffer.current = [];
  };

  // ------- START – Supports dedicated /press URL inside of phone ---------
  useEffect(() => {
    if (!initialScreen) return;
    const stack: navigationItem[] = [{ screen: "Home", row: 0 }];
    const parent = SCREEN_PARENT[initialScreen];
    if (parent) {
      stack.push({ screen: parent, row: 0 });
    }
    setNavigationStack(stack);
    setRow(0);
    setScreen(initialScreen);
  }, [initialScreen]);

  useEffect(() => {
    const wantPath = SCREEN_TO_PATH[screen] ?? "/";

    // The FAQ screen owns its own sub-routes (e.g. /faq/videos, managed by
    // FAQContent via history.replaceState). Don't yank a deep-linked
    // /faq/videos back to /faq before FAQContent can read it.
    if (screen === "FAQ" && location.pathname.startsWith("/faq")) return;

    if (location.pathname !== wantPath) {
      navigate(wantPath, { replace: true });
    }
  }, [screen, location.pathname, navigate]);
  // ------- END ---------

  useEffect(() => {
    if (audioFile) {
      playSound();
    }
    // Optionally clean up when audioFile changes or component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [audioFile]);

  return (
    <>
      {showHomeModal && (
        <HomeModal onClose={() => setShowHomeModal(false)} />
      )}
      <div
      style={{
        background: "#333",
        borderRadius: "2rem",
        padding: "2rem",
        paddingBottom: "1rem",
        margin: ".5rem",
        aspectRatio: "9 / 20",
        width: "clamp(250px, 100vw, 275px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "0 6px 12px rgba(0, 0, 0, 0.4)",
        maxHeight: "82vh",
      }}
    >
      <Logo />
      <div
        style={{
          border: "1px solid grey",
          borderRadius: ".25rem",
          display: "flex",
          flexDirection: "column",
          height: "50%",
          overflowY: "hidden",
        }}
      >
        <Screen
          row={row}
          setRow={setRow}
          options={options}
          setOptions={setOptions}
          screen={screen}
          setScreen={setScreen}
          navigationStack={navigationStack}
          setNavigationStack={setNavigationStack}
          keypadNum={keypadNum}
          setKeypadNum={setKeypadNum}
          setAudioFile={setAudioFile}
          clickBackButton={handleBackButton}
          snakeDirInput={snakeDirInput}
          onSnakeGameEnd={handleSnakeGameEnd}
        />
      </div>
      <div
        style={{
          height: "30%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-around",
          paddingTop: "5%",
          paddingBottom: "5%",
        }}
      >
        <Navigation
          onBackClick={handleBackButton}
          onCenterClick={handleCenterClick}
          onDownClick={handleDownClick}
          onUpClick={handleUpClick}
          onLeftClick={handleLeftClick}
          onRightClick={handleRightClick}
          onCallClick={() => {
            window.location.href = `tel:${
              keypadNum ? keypadNum : OFFLINE_PHONE_NUMBER
            }`;
            return;
          }}
        />
        <Footer />
      </div>
    </div>
    </>
  );
}

export default Phone;
