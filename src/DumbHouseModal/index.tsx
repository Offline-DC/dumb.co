import WindowModal from "../WindowModal/WindowModal";
import flyer from "./dumbhouseflyer.webp";

type DumbHouseModalProps = {
  clickBackButton: () => void;
};

export default function DumbHouseModal({
  clickBackButton,
}: DumbHouseModalProps) {
  return (
    <WindowModal
      title="DumbHouse.exe"
      imageSrc={flyer}
      imageAlt="Dumb House flyer"
      buttonText="Apply Now"
      buttonHref="https://dumbhouse.dumb.co"
      onClose={clickBackButton}
    />
  );
}
