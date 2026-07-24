"use client";

import { useState } from "react";
import { Play } from "lucide-react";

// Renders a lesson video by provider. Stored as (videoProvider, videoId) so a
// lesson can move from unlisted YouTube/Vimeo to Bunny later with no schema
// change (DATA-MODEL.md §4).
//
// Perf: the real player iframe is heavy — the full YouTube/Vimeo player pulls
// in ~1MB+ across dozens of requests. So we render a lightweight facade (a
// thumbnail + play button) and only load the actual iframe once the visitor
// clicks play.

function embedSrc(
  provider: string,
  videoId: string,
  autoplay: boolean
): string | null {
  switch (provider) {
    case "youtube":
      return `https://www.youtube-nocookie.com/embed/${videoId}${autoplay ? "?autoplay=1" : ""}`;
    case "vimeo":
      return `https://player.vimeo.com/video/${videoId}${autoplay ? "?autoplay=1" : ""}`;
    case "bunny":
      // videoId is expected as "libraryId/guid" for Bunny Stream.
      return `https://iframe.mediadelivery.net/embed/${videoId}${autoplay ? "?autoplay=true" : ""}`;
    default:
      return null;
  }
}

export function VideoEmbed({
  provider,
  videoId,
  title,
}: {
  provider: string;
  videoId: string | null;
  title?: string;
}) {
  const [playing, setPlaying] = useState(false);

  if (!videoId || !embedSrc(provider, videoId, false)) {
    return (
      <div className="grid aspect-video w-full place-items-center rounded-xl border bg-muted text-sm text-muted-foreground">
        Video coming soon.
      </div>
    );
  }

  // Facade — no heavy player is loaded until the user clicks.
  if (!playing) {
    const thumbnail =
      provider === "youtube"
        ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
        : null;
    return (
      <button
        type="button"
        onClick={() => setPlaying(true)}
        aria-label={`Play ${title ?? "video"}`}
        className="group relative aspect-video w-full overflow-hidden rounded-xl border bg-black"
      >
        {thumbnail && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt={title ?? "Lesson video"}
            loading="lazy"
            className="absolute inset-0 size-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
          />
        )}
        <span className="absolute inset-0 grid place-items-center bg-black/30 transition-colors group-hover:bg-black/45">
          <span className="grid size-16 place-items-center rounded-full bg-white/90 shadow-lg transition-transform group-hover:scale-105">
            <Play className="size-7 translate-x-0.5 fill-black text-black" />
          </span>
        </span>
      </button>
    );
  }

  const src = embedSrc(provider, videoId, true) as string;
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-black">
      <iframe
        src={src}
        title={title ?? "Lesson video"}
        className="absolute inset-0 size-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
