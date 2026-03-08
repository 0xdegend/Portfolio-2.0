"use client";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@300;400&display=swap";

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
