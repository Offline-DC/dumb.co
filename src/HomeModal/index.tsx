import WindowModal from "../WindowModal/WindowModal";
import HomeModalContent from "./HomeModalContent";

type Props = {
  onClose: () => void;
};

/**
 * Modal shown by default when a user lands on dumb.co (the "/" route).
 *
 * Uses WindowModal with the same config as DumbphoneOneModal:
 *   - `autoHeight` so the desktop modal shrinks to fit short content and
 *     scrolls when content is taller than the viewport
 *   - `content` render-prop receives `size` + `isMobile` so the body can
 *     adapt sizing the same way FlyerContainer does
 *
 * After the user closes it (×), the phone underneath is fully interactive.
 */
export default function HomeModal({ onClose }: Props) {
  return (
    <WindowModal
      title="DumbCo.exe"
      content={({ size, isMobile }) => (
        <HomeModalContent
          modalWidth={size.w}
          containerHeight={isMobile ? size.h : undefined}
        />
      )}
      onClose={onClose}
      autoHeight
    />
  );
}
