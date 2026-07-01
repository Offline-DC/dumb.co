import WindowModal from "../WindowModal/WindowModal";
import FlyerContainer from "./FlyerContainer";

type Props = {
  clickBackButton: () => void;
};

export default function DumbphoneOneModal({ clickBackButton }: Props) {
  return (
    <WindowModal
      title="DumbPhoneII.exe"
      content={({ size, isMobile }) => (
        <FlyerContainer
          modalWidth={isMobile ? size.w : 700}
          containerHeight={isMobile ? size.h : undefined}
        />
      )}
      onClose={clickBackButton}
    />
  );
}
