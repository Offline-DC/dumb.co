import { useEffect, useRef, useState } from "react";
import styles from "./index.module.css";
import flyer from "./dumbhouseflyer.webp";

type DumbHouseModalProps = {
  title?: string;
  clickBackButton: () => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

const PADDING = 8;
const TITLE_BAR_H = 32;

function DumbHouseModal({
  title = "DumbHouse.exe",
  clickBackButton,
}: DumbHouseModalProps) {
  const windowRef = useRef<HTMLDivElement | null>(null);

  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ mouseX: 0, mouseY: 0, w: 0, h: 0 });

  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);

  const [position, setPosition] = useState({
    x: window.innerWidth < 600 ? 0 : 80,
    y: 0,
  });

  const [size, setSize] = useState(() => ({
    w: Math.min(640, Math.floor(window.innerWidth * 0.98)),
    h: Math.floor(window.innerHeight * 0.9),
  }));

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

  const toggleMaximize = () => {
    if (maximized) restore();
    else maximize();
  };

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

      setSize((s) => {
        const maxW = window.innerWidth - PADDING * 2;
        const maxH = window.innerHeight - PADDING * 2;
        return {
          w: clamp(s.w, 260, maxW),
          h: clamp(s.h, 220, maxH),
        };
      });

      setPosition((p) => {
        return {
          x: clamp(p.x, PADDING, window.innerWidth - size.w - PADDING),
          y: clamp(p.y, PADDING, window.innerHeight - size.h - PADDING),
        };
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maximized, size.w, size.h]);

  useEffect(() => {
    if (!dragging || maximized) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition(() => ({
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
      }));
    };

    const handleMouseUp = () => setDragging(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, maximized, size.w, size.h]);

  // Resize logic (disable while maximized)
  useEffect(() => {
    if (!resizing || maximized) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - resizeStart.current.mouseX;
      const dy = e.clientY - resizeStart.current.mouseY;

      const nextW = resizeStart.current.w + dx;
      const nextH = resizeStart.current.h + dy;

      const maxW = window.innerWidth - position.x - PADDING;
      const maxH = window.innerHeight - position.y - PADDING;

      setSize({
        w: clamp(nextW, 260, maxW),
        h: clamp(nextH, 220, maxH),
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

  return (
    <div
      ref={windowRef}
      className={styles.window}
      style={{
        left: position.x,
        top: position.y,
        width: size.w,
        zIndex: 999999,
      }}
    >
      <div
        className={styles.titleBar}
        onDoubleClick={toggleMaximize} // nice bonus: double click title bar
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
              clickBackButton();
            }}
            aria-label="Back"
            title="Back"
          >
            _
          </button>

          <button
            className={styles.button}
            onClick={(e) => {
              e.stopPropagation();
              toggleMaximize();
            }}
            aria-label={maximized ? "Restore" : "Maximize"}
            title={maximized ? "Restore" : "Maximize"}
          >
            □
          </button>

          <button
            className={styles.button}
            onClick={(e) => {
              e.stopPropagation();
              clickBackButton();
            }}
            aria-label="Close"
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      <div
        className={styles.body}
        style={{
          height: size.h - TITLE_BAR_H,
        }}
      >
        <img
          className={styles.flyer}
          src={flyer}
          alt="Dumb House flyer"
          draggable={false}
        />

        <div className={styles.applyContainer}>
          <a
            href="https://dumbhouse.dumb.co"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.applyButton}
            onClick={(e) => e.stopPropagation()}
          >
            Apply Now
          </a>
        </div>

        {!maximized && (
          <div
            className={styles.resizeHandle}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              resizeStart.current = {
                mouseX: e.clientX,
                mouseY: e.clientY,
                w: size.w,
                h: size.h,
              };
              setResizing(true);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default DumbHouseModal;
