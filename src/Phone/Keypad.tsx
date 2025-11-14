import type { Dispatch, SetStateAction } from "react";
import NavButton from "./NavButton";

type Props = {
  setKeypadNum: Dispatch<SetStateAction<string>>;
};

function Keybad({ setKeypadNum }: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "2px",
        paddingTop:"15px"
      }}
    >
      {Array.from({ length: 9 }, (_, i) => i + 1).map((i) => (
        <NavButton
          onClick={() =>
            setKeypadNum((keypadNum) =>
              keypadNum.length === 10 ? keypadNum : (keypadNum += i)
            )
          }
        >
          {i}
        </NavButton>
      ))}
    </div>
  );
}

export default Keybad;
