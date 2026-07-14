import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./index.module.css";

type ModalSize = { w: number; h: number };

type Props = {
  title?: string;

  // One of these:
  imageSrc?: string;
  imageAlt?: string;
  content?: (ctx: { size: ModalSize; isMobile: boolean }) => ReactNode;

  buttonText?: string;
  buttonHref?: string;

  /** When true the modal shrinks to fit its content instead of using a fixed height */
  autoHeight?: boolean;

  /**
   * When false the modal stays collapsed to content height (loading state).
   * Flip to true once content is ready to lock in a scrollable fixed height.
   * Defaults to true so existing modals are unaffected.
   */
  expanded?: boolean;

  /** When true, shows the resize handle in the bottom-right corner. Defaults to false. */
  resizable?: boolean;

  onClose: () => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

const PADDING = 8;
const TITLE_BAR_H = 32;
const MOBILE_GAP = 4;
const WINDOW_BORDER = 2;
const MOBILE_BODY_OFFSET = TITLE_BAR_H + MOBILE_GAP + WINDOW_BORDER * 2;

export default function WindowModal({
  title = "Window.exe",
  imageSrc,
  imageAlt = "Modal image",
  content,
  buttonText,
  buttonHref,
  autoHeight = false,
  expanded = true,
  resizable = false,
  onClose,
}: Props) {
  const isInteractiveImage = !!content;
  const windowRef = useRef<HTMLDivElement | null>(null);

  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ mouseX: 0, mouseY: 0, w: 0, h: 0 });

  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 700;

  const [position, setPosition] = useState(() => ({
    x: window.innerWidth < 800 ? 0 : 80,
    y: 10,
  }));

  const fullSize = {
    w: isMobile ? window.innerWidth - MOBILE_GAP : Math.min(700, Math.floor(window.innerWidth * 0.98)),
    h: isMobile
      ? window.innerHeight - MOBILE_BODY_OFFSET
      : Math.floor(window.innerHeight * (isInteractiveImage ? 0.98 : 0.85)),
  };

  const [size, setSize] = useState(fullSize);

  // When content signals ready (expanded flips true), lock in the full height
  const prevExpanded = useRef(expanded);
  useEffect(() => {
    if (expanded && !prevExpanded.current) {
      setSize(fullSize);
    }
    prevExpanded.current = expanded;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  useEffect(() => {
    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (scrollBarWidth > 0) {
      body.style.paddingRight = `${scrollBarWidth}px`;
    }
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
    };
  }, []);

  const [maximized, setMaximized] = useState(false);
  const restoreRef = useRef<{
    position: typeof position;
    size: typeof size;
  } | null>(null);

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
      if (window.innerWidth < 700) {
        setSize({
          w: window.innerWidth - MOBILE_GAP,
          h: window.innerHeight - MOBILE_BODY_OFFSET,
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
    if (!dragging || maximized || isMobile) return;
    const handleMouseMove = (e: MouseEvent) => {
      const modalH = windowRef.current?.offsetHeight ?? size.h;
      setPosition({
        x: clamp(e.clientX - dragOffset.current.x, PADDING, window.innerWidth - size.w - PADDING),
        y: clamp(e.clientY - dragOffset.current.y, PADDING, window.innerHeight - modalH - PADDING),
      });
    };
    const handleMouseUp = () => setDragging(false);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, maximized, isMobile, size.w, size.h]);

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

  const renderedContent = isInteractiveImage
    ? content({ size, isMobile })
    : content;

  const windowStyle = isMobile
    ? { left: 0, top: 0, right: MOBILE_GAP, height: `calc(100dvh - ${MOBILE_GAP}px)`, boxSizing: "border-box" as const, zIndex: 999999 }
    : { left: position.x, top: position.y, width: size.w, zIndex: 999999 };

  const maxBodyH = window.innerHeight - position.y - TITLE_BAR_H - PADDING - WINDOW_BORDER * 2;

  // While not expanded: hug content (loading state). Once expanded: fixed scrollable height.
  const bodyStyle = isMobile
    ? { height: `calc(100dvh - ${MOBILE_BODY_OFFSET}px)`, overflowY: "auto" as const }
    : !expanded
      ? { height: "auto", overflowY: "auto" as const }
      : autoHeight
        ? { height: "auto", maxHeight: Math.min(maxBodyH, size.h - TITLE_BAR_H), overflowY: "auto" as const }
        : { height: size.h - TITLE_BAR_H, overflowY: "auto" as const };

  const flyerStyle = isMobile
    ? { flex: "0 0 auto", overflow: "visible" as const }
    : autoHeight || !expanded
      ? { flex: "0 0 auto", overflow: "visible" as const }
      : undefined;

  return (
    <div
      ref={windowRef}
      className={styles.window}
      style={windowStyle}
    >
      <div
        className={styles.titleBar}
        onDoubleClick={isMobile ? undefined : toggleMaximize}
        onMouseDown={(e) => {
          if (isMobile || resizing || maximized) return;
          const rect = (windowRef.current ?? e.currentTarget).getBoundingClientRect();
          dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
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
            onClick={(e) => { e.stopPropagation(); onClose(); }}
          >
            ×
          </button>
        </div>
      </div>

      <div className={styles.body} style={bodyStyle}>
        {content ? (
          <div className={styles.flyer} style={flyerStyle}>
            {renderedContent}
          </div>
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

      {resizable && !isMobile && !maximized && expanded && (
        <div
          className={styles.resizeHandle}
          onMouseDown={(e) => {
            e.stopPropagation();
            resizeStart.current = {
              mouseX: e.clientX,
              mouseY: e.clientY,
              w: size.w,
              h: windowRef.current?.offsetHeight ?? size.h,
            };
            setResizing(true);
          }}
        />
      )}
    </div>
  );
}
