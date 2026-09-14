import { useRef, useState } from "react";
import styles from "./index.module.css";
import { MEMORY_EVENTS, memoryImage, type MemoryEvent } from "./memories_data";

type Selected = { event: number; photo: number };

/**
 * Memories.exe — the events we've done, one header per event with a strip of
 * photos. Clicking a photo opens it with its description, in the same window.
 *
 * Styling follows the site's existing modals (Windows-95 chrome, Cheltenham
 * headers) rather than the 2026 redesign, so it drops into the current site
 * without looking imported.
 */
export default function MemoriesContent() {
  const [selected, setSelected] = useState<Selected | null>(null);
  const rails = useRef<Record<number, HTMLDivElement | null>>({});

  const scrollRail = (i: number, dir: number) => {
    const rail = rails.current[i];
    if (rail) rail.scrollBy({ left: dir * 220, behavior: "smooth" });
  };

  if (selected) {
    const event = MEMORY_EVENTS[selected.event];
    const photo = event.photos[selected.photo];
    const src = memoryImage(photo.file);
    const step = (dir: number) =>
      setSelected({
        event: selected.event,
        photo:
          (selected.photo + dir + event.photos.length) % event.photos.length,
      });

    return (
      <div className={styles.wrap}>
        <div className={styles.detail}>
          <button
            type="button"
            className={styles.back}
            onClick={() => setSelected(null)}
          >
            ‹ all memories
          </button>

          <div className={styles.detailFrame}>
            {src && <img src={src} alt={`${event.name} — ${photo.caption}`} />}
          </div>

          <div className={styles.detailMeta}>
            <h2>{event.name}</h2>
            <p>{photo.caption}</p>
            <div className={styles.detailNav}>
              <button
                type="button"
                className={styles.arrow}
                aria-label="previous photo"
                onClick={() => step(-1)}
              >
                ‹
              </button>
              <button
                type="button"
                className={styles.arrow}
                aria-label="next photo"
                onClick={() => step(1)}
              >
                ›
              </button>
              <span className={styles.counter}>
                {selected.photo + 1} / {event.photos.length} &middot;{" "}
                {event.when}
                {event.where ? ` · ${event.where}` : ""}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <h1>memories</h1>
        <p>the events we've actually done. click any photo to open it up.</p>
      </div>
      <div className={styles.rule} />

      {MEMORY_EVENTS.map((event: MemoryEvent, i: number) => (
        <div className={styles.event} key={event.name}>
          <div className={styles.eventHead}>
            <h2>{event.name}</h2>
            <span className={styles.when}>{event.when}</span>
            {event.where && <span className={styles.where}>{event.where}</span>}
          </div>

          {event.blurb && <p className={styles.blurb}>{event.blurb}</p>}

          {event.photos.length === 0 ? (
            <div className={styles.pending}>photos coming soon</div>
          ) : (
            <div className={styles.strip}>
              <div
                className={styles.rail}
                ref={(el) => {
                  rails.current[i] = el;
                }}
              >
                {event.photos.map((photo, p) => {
                  const src = memoryImage(photo.file);
                  if (!src) return null;
                  return (
                    <button
                      type="button"
                      className={styles.tile}
                      key={photo.file}
                      onClick={() => setSelected({ event: i, photo: p })}
                    >
                      <img
                        src={src}
                        alt={`${event.name} — ${photo.caption}`}
                        loading="lazy"
                      />
                      <span className={styles.tileCap}>{photo.caption}</span>
                    </button>
                  );
                })}
              </div>

              {event.photos.length > 2 && (
                <div className={styles.arrows}>
                  <button
                    type="button"
                    className={styles.arrow}
                    aria-label={`scroll ${event.name} left`}
                    onClick={() => scrollRail(i, -1)}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className={styles.arrow}
                    aria-label={`scroll ${event.name} right`}
                    onClick={() => scrollRail(i, 1)}
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
