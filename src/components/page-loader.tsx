import Image from "next/image";

// Brand mark with a soft pulse instead of a generic spinner. The mark is
// decorative here, so it carries an empty alt and the label lives in the
// screen-reader-only text.
export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] flex-1 items-center justify-center">
      <Image
        src="/logo-mark.png"
        alt=""
        width={48}
        height={48}
        priority
        className="size-12 animate-pulse object-contain"
      />
      <span className="sr-only">Loading</span>
    </div>
  );
}
