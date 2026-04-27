import WindowModal from "../WindowModal/WindowModal";
import flyer from "../dumb_international.webp";

type DumbInternationalModalProps = {
  clickBackButton: () => void;
};

export default function DumbInternationalModal({
  clickBackButton,
}: DumbInternationalModalProps) {
  return (
    <WindowModal
      title="DumbInternational.exe"
      imageSrc={flyer}
      imageAlt="Dumb International"
      onClose={clickBackButton}
    />
  );
}
