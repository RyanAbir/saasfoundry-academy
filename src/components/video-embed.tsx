// Renders a lesson video by provider. Stored as (videoProvider, videoId) so a
// lesson can move from unlisted YouTube/Vimeo to Bunny later with no schema
// change (DATA-MODEL.md §4).

function embedSrc(provider: string, videoId: string): string | null {
  switch (provider) {
    case "youtube":
      return `https://www.youtube-nocookie.com/embed/${videoId}`;
    case "vimeo":
      return `https://player.vimeo.com/video/${videoId}`;
    case "bunny": {
      // videoId is expected as "libraryId/guid" for Bunny Stream.
      return `https://iframe.mediadelivery.net/embed/${videoId}`;
    }
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
  const src = videoId ? embedSrc(provider, videoId) : null;

  if (!src) {
    return (
      <div className="grid aspect-video w-full place-items-center rounded-xl border bg-muted text-sm text-muted-foreground">
        Video coming soon.
      </div>
    );
  }

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
