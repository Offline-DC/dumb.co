import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./index.module.css";

type ModalSize = { w: number; h: number };

type Props = {
  title?: string;

  // One of these:
  imageSrc?: string;
  imageAlt?: string;
  content?:
    | ReactNode
    | ((ctx: { size: ModalSize; isMobile: boolean }) => ReactNode);

  buttonText?: string;
  buttonHref?: string;

  onClose: () => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

const PADDING = 8;
const TITLE_BAR_H = 32;

export default function WindowModal({
  title = "Window.exe",
  imageSrc,
  imageAlt = "Modal image",
  content,
  buttonText,
  buttonHref,
  onClose,
}: Props) {
  const windowRef = useRef<HTMLDivElement | null>(null);

  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ mouseX: 0, mouseY: 0, w: 0, h: 0 });

  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);

  const [position, setPosition] = useState(() => {
    return {
      x: window.innerWidth < 600 ? 0 : 80,
      y: 0,
    };
  });

  const [size, setSize] = useState(() => ({
    w: Math.min(700, Math.floor(window.innerWidth * 0.98)),
    h: Math.floor(window.innerHeight * 0.98),
  }));

  const [maximized, setMaximized] = useState(false);
  const restoreRef = useRef<{
    position: typeof position;
    size: typeof size;
  } | null>(null);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 600;

  const maximize = () => {
    restoreRef.current = { position, size };
    setMaximized(true);
    setDragging(false);
    setResizing(false);
    setPosition({ x: PADDING, y: PADDING });
    setSize({
      w: window.innerWidth - PADDING * 2,
      h: window.innerHeight - PADDING * 2,
    });
  };

  const restore = () => {
    const prev = restoreRef.current;
    setMaximized(false);
    setDragging(false);
    setResizing(false);
    if (prev) {
      setPosition(prev.position);
      setSize(prev.size);
    }
  };

  const toggleMaximize = () => (maximized ? restore() : maximize());

  useEffect(() => {
    const handleResize = () => {
      if (maximized) {
        setPosition({ x: PADDING, y: PADDING });
        setSize({
          w: window.innerWidth - PADDING * 2,
          h: window.innerHeight - PADDING * 2,
        });
        return;
      }

      setSize((s) => ({
        w: clamp(s.w, 260, window.innerWidth - PADDING * 2),
        h: clamp(s.h, 220, window.innerHeight - PADDING * 2),
      }));

      setPosition((p) => ({
        x: clamp(p.x, PADDING, window.innerWidth - size.w - PADDING),
        y: clamp(p.y, PADDING, window.innerHeight - size.h - PADDING),
      }));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [maximized, size.w, size.h]);

  useEffect(() => {
    if (!dragging || maximized) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: clamp(
          e.clientX - dragOffset.current.x,
          PADDING,
          window.innerWidth - size.w - PADDING,
        ),
        y: clamp(
          e.clientY - dragOffset.current.y,
          PADDING,
          window.innerHeight - size.h - PADDING,
        ),
      });
    };

    const handleMouseUp = () => setDragging(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, maximized, size.w, size.h]);

  useEffect(() => {
    if (!resizing || maximized) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - resizeStart.current.mouseX;
      const dy = e.clientY - resizeStart.current.mouseY;

      const maxW = window.innerWidth - position.x - PADDING;
      const maxH = window.innerHeight - position.y - PADDING;

      setSize({
        w: clamp(resizeStart.current.w + dx, 260, maxW),
        h: clamp(resizeStart.current.h + dy, 220, maxH),
      });
    };

    const handleMouseUp = () => setResizing(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizing, maximized, position.x, position.y]);

  const renderedContent =
    typeof content === "function" ? content({ size, isMobile }) : content;

  return (
    <div
      ref={windowRef}
      className={styles.window}
      style={
        isMobile
          ? {
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: "98vw",
              zIndex: 999999,
            }
          : {
              left: position.x,
              top: position.y,
              width: size.w,
              zIndex: 999999,
            }
      }
    >
      <div
        className={styles.titleBar}
        onDoubleClick={toggleMaximize}
        onMouseDown={(e) => {
          if (resizing || maximized) return;
          const rect = (
            windowRef.current ?? e.currentTarget
          ).getBoundingClientRect();
          dragOffset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          };
          setDragging(true);
        }}
      >
        <div className={styles.title}>
          <span className={styles.icon}>▦</span>
          {title}
        </div>

        <div className={styles.controls}>
          <button
            className={styles.button}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            ×
          </button>
        </div>
      </div>

      <div
        className={styles.body}
        style={isMobile ? undefined : { height: size.h - TITLE_BAR_H }}
      >
        {content ? (
          <div className={styles.flyer}>{renderedContent}</div>
        ) : imageSrc ? (
          <div className={styles.flyer}>
            <img src={imageSrc} alt={imageAlt} draggable={false} />
          </div>
        ) : null}

        {buttonText && buttonHref && (
          <div className={styles.applyContainer}>
            <a
              href={buttonHref}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.applyButton}
              onClick={(e) => e.stopPropagation()}
            >
              {buttonText}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
