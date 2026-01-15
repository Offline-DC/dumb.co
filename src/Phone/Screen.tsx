import type { Dispatch, SetStateAction } from "react";
import PhoneText from "./PhoneText";
import type { navigationItem } from "./Phone";
import Press from "../Press/Press";

type Props = {
  row: number;
  options: string[];
  screen: string;
  navigationStack: navigationItem[];
  setRow: Dispatch<SetStateAction<number>>;
  setOptions: Dispatch<SetStateAction<string[]>>;
  setScreen: Dispatch<SetStateAction<string>>;
  setNavigationStack: Dispatch<SetStateAction<navigationItem[]>>;
  setKeypadNum: Dispatch<SetStateAction<string>>;
  keypadNum: string;
  setAudioFile: Dispatch<SetStateAction<string>>;
};

function arraysEqual(a: string[], b: string[]) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;
  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function daysUntil(dateStr: string): number {
  const [month, day, year] = dateStr.split("-").map(Number);
  const target = new Date(year, month - 1, day);
  const now = new Date();
  // Zero out time for accurate day difference
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) - 1;
}

function Screen({
  row,
  setRow,
  options,
  setOptions,
  screen,
  setScreen,
  setKeypadNum,
  setAudioFile,
}: Props) {
  let content;
  let display;
  let newOptions: string[] = [];
  if (screen === "Home") {
    newOptions = [
      "dumbphone I",
      "Month Offline D.C.",
      "Month Offline NYC",
      "press",
      "contact",
      "about",
    ];
  } else if (screen === "sign up") {
    newOptions = ["Washington D.C.", "Anywhere, U.S.A."];
  } else if (screen === "press") {
    return <Press row={row} setOptions={setOptions} />;
  } else if (screen === "countdown clock") {
    const startDate = "10-30-2025";
    const cutOffDate = "10-24-2025";
    display = (
      <div>
        the next month offline begins in {daysUntil(startDate)} days
        <br />
        <br />
        registration closes in <br /> {daysUntil(cutOffDate)} days
        <br />
        <br />
        press return <br />
        to sign up
      </div>
    );
  } else if (screen === "about") {
    newOptions = ["team", "operator", "subscribe"]; //FAQs coming soon
  } else if (screen === "Month Offline In-Person Cohort in Washington, DC") {
    window.location.href =
      "https://shop.offline.community/products/offline-dumbphone-1";
    setRow(0);
    setScreen("Home");
  } else if (screen === "operator") {
    display = (
      <div>
        learn more by calling us at <br />
        1-844-OFFLINE
        <br />
        <br />
        press the call button to dial
      </div>
    );
    setKeypadNum("1844OFFLINE");
  } else if (screen === "team") {
    newOptions = [
      "Daniel Hogenkamp",
      "Grant Besner",
      "Jack Nugent",
      "Lydia Peabody",
      "seewunder.studio",
    ];
  } else if (screen === "seewunder.studio") {
    newOptions = ["Aaron Z. Lewis", "Josh Morin"];
  } else if (screen == "FAQs") {
    display = "Coming Soon";
    //newOptions = ["Getting around","Socializing","Entertainment","What about work?","I'm unemployed...","I'm a parent","2 Factor Auth"];
  } else if (screen === "Getting around") {
    setAudioFile("example.mp3");
    display = "around";
  } else if (screen === "Socializing") {
    setAudioFile("example2.mp3");
    display = "around";
  } else if (screen === "Entertainment") {
    setAudioFile("example.mp3");
    display = "around";
  } else if (screen === "Listening to music") {
    setAudioFile("example2.mp3");
    display = "music";
  } else if (screen === "What about work?") {
    setAudioFile("example.mp3");
    display = "work";
  } else if (screen === "I'm unemployed...") {
    setAudioFile("example2.mp3");
    display = "unemployed";
  } else if (screen === "I'm a parent") {
    setAudioFile("example.mp3");
    display = "parent";
  } else if (screen === "2 Factor Auth") {
    setAudioFile("example2.mp3");
    display = "auth";
  } else if (screen === "What is Offline?") {
    display = "Less is MO";
  } else if (screen === "contact") {
    display = "hi @ offline • community";
    newOptions = [];
  } else if (screen === "Why?") {
    display = "Less is M.O.";
  } else if (screen === "About") {
    display =
      "Founded Spring 2025 \n in Washington, DC \n by Aaron Z. Lewis. \n Daniel Hogenkamp. \n Grant Besner. & \n Josh Morin.";
    newOptions = [];
  } else if (screen === "Aaron Z. Lewis") {
    display = (
      <img
        src="/img/Aaron.png"
        alt="Aaron Z. Lewis"
        style={{
          boxShadow: "none",
          width: "100%",
          height: "auto",
          transform: "scale(1.05)",
          transformOrigin: "center center",
        }}
      />
    );
  } else if (screen === "Daniel Hogenkamp") {
    display = (
      <img
        src="/img/Danny.png"
        alt="Grant"
        style={{ boxShadow: "none", width: "100%", height: "auto" }}
      />
    );
  } else if (screen === "Grant Besner") {
    display = (
      <img
        src="/img/Grant.png"
        alt="Grant"
        style={{ boxShadow: "none", width: "110%", height: "auto" }}
      />
    );
  } else if (screen === "Josh Morin") {
    display = (
      <img
        src="/img/Josh.png"
        alt="Grant"
        style={{
          boxShadow: "none",
          width: "120%",
          height: "auto",
          transform: "scale(1.15)",
          transformOrigin: "center center",
        }}
      />
    );
  } else if (screen === "Lydia Peabody") {
    display = (
      <img
        src="/img/Lydia.png"
        alt="Lydia Peabody"
        style={{ boxShadow: "none", width: "100%", height: "auto" }}
      />
    );
  } else if (screen === "Rock Harper") {
    display = (
      <img
        src="/img/Grant.png"
        alt="Aaron Z. Lewis"
        style={{ boxShadow: "none", width: "100%", height: "auto" }}
      />
    );
  } else if (screen === "Jack Nugent") {
    display = (
      <img
        src="/img/JackN.png"
        alt="Jack Nugent"
        style={{
          boxShadow: "none",
          width: "100%",
          height: "auto",
          transform: "scale(1.15)",
          transformOrigin: "center center",
        }}
      />
    );
  } else if (screen === "Testimonials") {
    display = "to hear, dial: 1-844-OFFLINE press 2, then 3";
  } else if (screen === "subscribe") {
    display = (
      <div>
        hear about
        <br />
        upcoming offline <br />
        events and more
        <br />
        <br />
        Press the <br />
        Call Button
        <br />
        to subscribe
      </div>
    );
    setKeypadNum("1844OFFLINE,4");
  } else if (screen === "dumbphone I") {
    window.location.href =
      "https://shop.offline.community/products/dumbphone-1";
    setRow(0);
    setScreen("Home");
  } else if (screen === "Month Offline D.C.") {
    window.location.href =
      "https://shop.offline.community/products/month-offline-september-in-dc";
    setRow(0);
    setScreen("Home");
  } else if (screen === "Month Offline NYC") {
    window.location.href =
      "https://shop.offline.community/products/month-offline-nyc";
    setRow(0);
    setScreen("Home");
  } else if (screen === "support") {
    window.location.href = "/support";
    setRow(0);
    setScreen("Home");
  } else if (screen === "setup") {
    window.location.href = "/setup";
    setRow(0);
    setScreen("Home");
  } else if (screen === "snake") {
    display = "snake";
  }

  if (!arraysEqual(options, newOptions)) {
    setOptions(newOptions);
  }

  if (options === undefined || options.length == 0) {
    content = (
      <div
        style={{
          display: "flex",
          paddingTop: "5px",
          margin: "auto",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          width: "100%",
        }}
      >
        <div
          style={{
            textAlign: "right",
            padding: "1rem",
            fontSize: screen === "contact" ? "2rem" : "1.3rem",
            color: "#000000",
          }}
        >
          {display}
        </div>
      </div>
    );
  } else {
    content = options.map((options, i) => (
      <PhoneText key={options} highlight={row === i}>
        {options}
      </PhoneText>
    ));
  }

  return (
    <div
      style={{
        background: "rgb(128, 123, 95)",
        height: "100%",
        borderRadius: "0.25rem",
        boxShadow: "inset 0 0 6px rgba(0, 0, 0, 0.6)",
        border: "1px solid #333",
        padding: "0.125rem",
        fontSize: "1.5rem",
        overflow: "hidden",
      }}
    >
      {content}
    </div>
  );
}

export default Screen;
