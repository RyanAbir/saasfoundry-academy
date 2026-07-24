import Script from "next/script";

// Privacy-friendly page-view analytics. Only loads if you set
// NEXT_PUBLIC_PLAUSIBLE_DOMAIN (e.g. "academy.saasfoundry.xyz"). Point it at
// plausible.io or a self-hosted instance. No cookies, no personal data.
export function Analytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const src =
    process.env.NEXT_PUBLIC_PLAUSIBLE_SRC ?? "https://plausible.io/js/script.js";
  if (!domain) return null;

  return <Script defer data-domain={domain} src={src} strategy="afterInteractive" />;
}
