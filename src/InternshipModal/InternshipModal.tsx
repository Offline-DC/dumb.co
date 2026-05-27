import WindowModal from "../WindowModal/WindowModal";
import flyer from "./internshipflyer.webp";

type InternshipModalProps = {
  clickBackButton: () => void;
};

export default function InternshipModal({
  clickBackButton,
}: InternshipModalProps) {
  return (
    <WindowModal
      title="Internship.exe"
      imageSrc={flyer}
      imageAlt="Internship flyer"
      buttonText="Apply Now"
      buttonHref="/internship"
      onClose={clickBackButton}
    />
  );
}
