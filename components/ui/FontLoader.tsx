"use client";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap";

export default function FontLoader() {
  return (
    <>
      <link rel="preload" as="style" href={FONT_URL} />
      <link
        rel="stylesheet"
        media="print"
        onLoad={(e) => {
          (e.currentTarget as HTMLLinkElement).media = "all";
        }}
        href={FONT_URL}
      />
      <noscript>
        <link rel="stylesheet" href={FONT_URL} />
      </noscript>
    </>
  );
}
