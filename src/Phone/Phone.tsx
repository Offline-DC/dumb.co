import { useState, useRef, useEffect } from "react";
import Screen from "./Screen";
import Navigation from "./Navigation";
import Logo from "./Logo"
import Footer from "./Footer";
import { OFFLINE_PHONE_NUMBER } from "../App";
import Keypad from "./Keypad";
import ReactGA from "react-ga4";


export interface navigationItem{
  screen: string;
  row: number;
}


function Phone() {
  const [row, setRow] = useState(0);
  const [callNum] = useState("");
  const [navigationStack, setNavigationStack] = useState<navigationItem[]>([]);
  const [screen, setScreen] = useState("Home");
  const [keypadNum, setKeypadNum] = useState("");
  const [audioFile, setAudioFile] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playSound = () => {
  if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }
  audioRef.current = new Audio(`/audio/${audioFile}`);
  audioRef.current.play();
};

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

const stopSound = () => {
  if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current = null;
  }
};

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
          paddingTop:"5%",
          paddingBottom: "5%",
        }}
      >
        <Navigation
          row={row}
          setRow={setRow}
          textCount={options.length}
          onBackClick={() => {
            ReactGA.event({
              category: "User",
              action: "Clicked Center Button",
              label: "Center Buttom",
            });
            setAudioFile("");
            setScreen(navigationStack[navigationStack.length - 1].screen);
            setRow(navigationStack[navigationStack.length - 1].row);
            setNavigationStack(navigationStack.slice(0, -1));
            setKeypadNum("");
          }}
          onCenterClick={() => {
            const prev: navigationItem = {
              screen: screen,
              row: row
            }
            playSound();
            setNavigationStack([...navigationStack, prev]);
            setRow(0);
            setScreen(options[row]);
          }}
          onCallClick={() => {
              window.location.href = `tel:${keypadNum ? keypadNum : OFFLINE_PHONE_NUMBER}`;
              return;
          }}
        />
        {/*<Keypad setKeypadNum={setKeypadNum} />*/}
        <Footer />
      </div>
    </div>
  );
}

export default Phone;
