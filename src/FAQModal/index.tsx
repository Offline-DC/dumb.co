import { useState } from "react";
import WindowModal from "../WindowModal/WindowModal";
import FAQContent from "../FAQContent";

type Props = {
  clickBackButton: () => void;
};

export default function FAQModal({ clickBackButton }: Props) {
  const [contentReady, setContentReady] = useState(false);

  return (
    <WindowModal
      title="FAQ.exe"
      content={() => <FAQContent compact onReady={() => setContentReady(true)} />}
      onClose={clickBackButton}
      expanded={contentReady}
      resizable
    />
  );
}
