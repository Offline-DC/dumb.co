import WindowModal from "../WindowModal/WindowModal";
import FAQContent from "../FAQContent";

type Props = {
  clickBackButton: () => void;
};

export default function FAQModal({ clickBackButton }: Props) {
  return (
    <WindowModal
      title="FAQ.exe"
      content={() => <FAQContent compact />}
      onClose={clickBackButton}
      autoHeight
    />
  );
}
