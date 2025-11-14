import type { Dispatch, SetStateAction } from "react";
import NavButton from "./NavButton";
import {
  IconArrowDown,
  IconArrowLeft,
  IconArrowRight,
  IconArrowUp,
  IconArrowBackUp,
  IconCircleFilled,
  IconPhoneRinging,
  IconPhoneEnd,
} from "@tabler/icons-react";

type Props = {
  row: number;
  setRow: Dispatch<SetStateAction<number>>;
  textCount: number;
  onCenterClick: () => void;
  onBackClick: () => void;
  onCallClick: () => void;
};

function Navigation({
  row,
  setRow,
  textCount,
  onCenterClick,
  onBackClick,
  onCallClick,
}: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "2px",
      }}
    >
      <div style={{ aspectRatio: "2" }} />
      <NavButton
        onClick={() => {
          if (row > 0) {
            setRow((row) => (row -= 1));
          }
        }}
      >
        <IconArrowUp size={25} />
      </NavButton>
      <NavButton onClick={onBackClick}>
        <IconArrowBackUp size={25} />
      </NavButton>
      <NavButton>
        <IconArrowLeft size={25} />
      </NavButton>
      <NavButton onClick={onCenterClick}>
        <IconCircleFilled size={15} />
      </NavButton>
      <NavButton>
        <IconArrowRight size={25} />
      </NavButton>
      <NavButton onClick={onCallClick}>
        <IconPhoneRinging size={20} />
      </NavButton>
      <NavButton
        onClick={() => {
          if (row < textCount - 1) {
            setRow((row) => (row += 1));
          }
        }}
      >
        <IconArrowDown size={25} />
      </NavButton>
      <NavButton>
        <IconPhoneEnd size={20} />
      </NavButton>
    </div>
  );
}

export default Navigation;
