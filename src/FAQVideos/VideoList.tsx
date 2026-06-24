import rawVideosData from "./videos_data.md?raw";
import { parseVideosMarkdown } from "./parseVideosData";

export const VIDEO_ITEMS = parseVideosMarkdown(rawVideosData);

export default function VideoList() {
  if (VIDEO_ITEMS.length === 0) {
    return (
      <p className="faq-empty-tab" role="status">
        no videos yet — check back soon.
      </p>
    );
  }

  return (
    <div className="faq-videos" role="list">
      {VIDEO_ITEMS.map((video) => (
        <div className="faq-video-item" role="listitem" key={video.id}>
          <h2 className="faq-video-title">{video.title}</h2>
          <div className="faq-video-embed">
            <iframe
              src={video.embedUrl}
              title={video.title}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        </div>
      ))}
    </div>
  );
}
