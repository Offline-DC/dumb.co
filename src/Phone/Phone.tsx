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

export interface navigationItem {
  screen: string;
  row: number;
}

type Props = {
  initialScreen?: string;
};

function Phone({ initialScreen }: Props) {
  const [row, setRow] = useState(0);
  const [navigationStack, setNavigationStack] = useState<navigationItem[]>([]);
  const [screen, setScreen] = useState("Home");
  const [keypadNum, setKeypadNum] = useState("");
  const [audioFile, setAudioFile] = useState("");
  const [options, setOptions] = useState<string[]>([]);

  const navigate = useNavigate();
  const location = useLocation();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    audioRef.current = new Audio(`/audio/${audioFile}`);
    audioRef.current.play();
  };

  // ------- START – Supports dedicated /press URL inside of phone ---------
  useEffect(() => {
    if (!initialScreen) return;
    setNavigationStack([{ screen: "Home", row: 0 }]);
    setRow(0);
    setScreen(initialScreen);
  }, [initialScreen]);

  useEffect(() => {
    const wantPath = screen === "press" ? "/press" : "/";

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
        maxHeight: "calc(100vh - 20vh)",
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
          onBackClick={() => {
            ReactGA.event({
              category: "User",
              action: "Clicked Back Button",
              label: "Back Button",
            });

            setAudioFile("");
            setKeypadNum("");

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
          }}
          onCenterClick={() => {
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
          }}
          onDownClick={() => {
            if (row < options.length - 1) {
              setRow((row) => (row += 1));
            }
          }}
          onUpClick={() => {
            if (row > 0) {
              setRow((row) => (row -= 1));
            }
          }}
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
  );
}

export default Phone;
