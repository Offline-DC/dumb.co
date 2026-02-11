import WindowModal from "../WindowModal/WindowModal";
import FlyerContainer from "./FlyerContainer";

type Props = {
  clickBackButton: () => void;
};

export default function DumbphoneOneModal({ clickBackButton }: Props) {
  return (
    <WindowModal
      title="DumbPhoneI.exe"
      content={({ isMobile }) => <FlyerContainer isMobile={isMobile} />}
      onClose={clickBackButton}
    />
  );
}
