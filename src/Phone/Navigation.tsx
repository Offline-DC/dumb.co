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
  onCenterClick: () => void;
  onBackClick: () => void;
  onCallClick: () => void;
  onDownClick: () => void;
  onUpClick: () => void;
};

function Navigation({
  onCenterClick,
  onBackClick,
  onCallClick,
  onDownClick,
  onUpClick,
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
      <NavButton onClick={onUpClick}>
        <IconArrowUp size={25} />
      </NavButton>
      <NavButton onClick={onBackClick}>
        <IconArrowBackUp size={25} />
      </NavButton>
      <NavButton onClick={onBackClick}>
        <IconArrowLeft size={25} />
      </NavButton>
      <NavButton onClick={onCenterClick}>
        <IconCircleFilled size={15} />
      </NavButton>
      <NavButton onClick={onCenterClick}>
        <IconArrowRight size={25} />
      </NavButton>
      <NavButton onClick={onCallClick}>
        <IconPhoneRinging size={20} />
      </NavButton>
      <NavButton onClick={onDownClick}>
        <IconArrowDown size={25} />
      </NavButton>
      <NavButton>
        <IconPhoneEnd size={20} />
      </NavButton>
    </div>
  );
}

export default Navigation;
