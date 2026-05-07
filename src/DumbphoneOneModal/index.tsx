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
          modalWidth={size.w}
          containerHeight={isMobile ? size.h : undefined}
        />
      )}
      onClose={clickBackButton}
      autoHeight
    />
  );
}
