import type { Dispatch, SetStateAction } from "react";
import { OFFLINE_PHONE_NUMBER } from "../App";
import PhoneText from "./PhoneText";
import type { navigationItem } from "./Phone";
import screenCopy from "../assets/screenCopy.json"



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
};

function formatPhoneNumberProgressive(input: string): string {
  const digits = input.replace(/\D/g, "");

  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)})-${digits.slice(3)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 3)})-${digits.slice(3, 6)}-${digits.slice(6)}`;

  return `(${digits.slice(0, 3)})-${digits.slice(3, 6)}-${digits.slice(
    6,
    10
  )} x${digits.slice(10)}`;
}

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
  target.setHours(0,0,0,0);
  now.setHours(0,0,0,0);
  const diff = target.getTime() - now.getTime();
  return (Math.ceil(diff / (1000 * 60 * 60 * 24)) - 1);
}

function Screen({ row, setRow, options, setOptions, screen, setScreen, navigationStack, setNavigationStack, keypadNum, setKeypadNum }: Props) {
  let content;
  let display;
  let newOptions: string[] = [];
  if (screen === "Home") {
    newOptions = ["about offline","month offline","hush harbor","dumb superstars","dumb gallery","subscribe"];
  } else if (screen === "month offline") {
    newOptions = ["instructions","Month Offline in Washington D.C.", "Month Offline Across the U.S."];
  } else if (screen === "instructions"){
    const startDate = "09-01-2025";
    const cutOffDate = "08-22-2025";
    display = <div>the next month offline begins in {daysUntil(startDate)} days<br /><br />registration closes in <br /> {daysUntil(cutOffDate)} days<br /><br />press return <br />to choose <br /> your cohort</div>
  } else if (screen === "dumb superstars") {
    display = "Coming Soon";
  } else if (screen === "dumb gallery") {
    display = "Coming Soon";
  } else if (screen === "about offline") {
    newOptions = ["Operator","Team","Contact", "Why?"];
  } else if (screen === "Month Offline In-Person Cohort in Washington, DC") {
    window.location.href = "https://shop.offline.community/products/offline-dumbphone-1";
    setRow(0);
    setScreen("Home");
  } else if (screen === "Operator") {
    display = <div>learn more by calling us at <br />1-844-OFFLINE<br /><br />press the call button to dial</div>
    setKeypadNum("1844OFFLINE");
  } else if (screen === "Team") {
    newOptions = ["Daniel Hogenkamp","Grant Besner","seewunder.studio"];
  } else if (screen === "seewunder.studio") {
    newOptions = ["Aaron Z. Lewis", "Josh Morin"];
  } else if (screen == "FAQ") {
    newOptions = ["What is Offline?", "How do I get a phone?", "How do I get a SIM card?"];
  } else if (screen === "What is Offline?") {
    display = "Less is MO";
  } else if (screen === "Contact") {
    display = "team @ offline • community";
    newOptions = [];
  } else if (screen === "Events"){
    display = "Offline Art Gallery Party. Thurs. Aug. 7 @ 7pm. Temperance Alley Garden. 1931 13th St. Call in to learn more! "
  } else if (screen === "Why?"){
    display = "Less is M.O."
  } else if (screen === "About") {
    display = "Founded Spring 2025 \n in Washington, DC \n by Aaron Z. Lewis. \n Daniel Hogenkamp. \n Grant Besner. & \n Josh Morin."
    newOptions = [];
  } else if (screen === "Aaron Z. Lewis") {
    display = <img src="/img/Aaron.png" alt="Aaron Z. Lewis" style={{ width: "100%", height: "auto" }} />
  } else if (screen === "Daniel Hogenkamp") {
    display = <img src="/img/Danny.png" alt="Grant" style={{ width: "100%", height: "auto" }} />
  } else if (screen === "Grant Besner") {
    display = <img src="/img/Grant.png" alt="Grant" style={{ width: "100%", height: "auto" }} />
  } else if (screen === "Josh Morin") {
    display =<img src="/img/Josh.png" alt="Grant" style={{ width: "100%", height: "auto" }} />
  } else if (screen === "Tali DeGroot") {
    display = <img src="/img/Grant.png" alt="Aaron Z. Lewis" style={{ width: "100%", height: "auto" }} />
  } else if (screen === "Rock Harper") {
    display = <img src="/img/Grant.png" alt="Aaron Z. Lewis" style={{ width: "100%", height: "auto" }} />
  } else if (screen === "Testimonials") {
    display = "to hear, dial: 1-844-OFFLINE press 2, then 3"
  } else if (screen === "subscribe"){
    display = <div>hear about <br />upcoming offline <br />events in DC<br /><br />Press the <br />Call Button<br />to subscribe</div>
    setKeypadNum("1844OFFLINE,4");
  }else if (screen === "Month Offline in Washington D.C.") {
    window.location.href = "https://shop.offline.community/products/month-offline-september-in-dc";
    setRow(0);
    setScreen("Home");
  } else if (screen === "Month Offline Across the U.S.") {
    window.location.href = "https://shop.offline.community/products/month-offline-september-with-friends";
    setRow(0);
    setScreen("Home");
  } else if (screen === "hush harbor") {
    display = "Coming Soon"
  } else if (screen === "setup") {
    window.location.href = "/setup";
    setRow(0);
    setScreen("Home");
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
            fontSize: screen === "Contact" ? "2rem" : "1.3rem",
            color: "#000000"
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
