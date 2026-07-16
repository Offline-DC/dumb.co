import WindowModal from "../WindowModal/WindowModal";
import flyer from "../dumb_campus_flyer.jpg";

type DumbCampusModalProps = {
  clickBackButton: () => void;
};

export default function DumbCampusModal({
  clickBackButton,
}: DumbCampusModalProps) {
  return (
    <WindowModal
      title="DumbCampus.exe"
      imageSrc={flyer}
      imageAlt="Dumb Campus"
      onClose={clickBackButton}
    />
  );
}
