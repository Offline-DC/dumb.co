import WindowModal from "../WindowModal/WindowModal";
import MemoriesContent from "../Memories/MemoriesContent";

type Props = {
  clickBackButton: () => void;
};

export default function MemoriesModal({ clickBackButton }: Props) {
  return (
    <WindowModal
      title="Memories.exe"
      content={() => <MemoriesContent />}
      onClose={clickBackButton}
      resizable
    />
  );
}
