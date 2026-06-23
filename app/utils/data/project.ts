export interface Project {
  number: string;
  title: string;
  category: string;
  year: string;
  description: string;
  tech: string[];
  image: string;
  /** Optional muted/looping clip (mp4/webm). Falls back to `image` when absent. */
  video?: string;
  link: string;
}

export const projects: Project[] = [
  {
    number: "01",
    title: "Skew",
    category: "Frontend Engineering",
    year: "2026",
    description:
      "Skew is a live 3D volatility-surface trading terminal for DeepBook Predict on Sui. Instead of a flat list of yes/no markets, it renders the actual SVI volatility surface the protocol prices against — strike × expiry × implied vol, streamed live from on-chain events, and lets users click any point to mint a binary or range bet in a single transaction, with chain-authoritative quotes, gasless zkLogin onboarding, and two custom Move contracts deployed on testnet.",
    tech: [
      "Next.js",
      "TypeScript",
      "React Three Fiber",
      "Sui Move",
      "dapp-kit",
      "Enoki zkLogin",
    ],
    image: "/images/projects/skew.png",
    link: "https://tryskew.xyz",
  },

  {
    number: "02",
    title: "Pandabox",
    category: "Frontend Engineering · Blockchain",
    year: "2026",
    description:
      "Pandabox is a programmable, fully on-chain funding launchpad on the Sui Network, Juicebox reimagined for Sui. Creators deploy projects that raise SUI, issue tokens via configurable bonding curves, mint tiered NFT supporter passes, and run on locked funding cycles with on-chain payout splits and treasury cash-outs. Every parameter is on-chain and every action is a Sui programmable transaction block, wrapped in a light-mode-first, engineered-minimal interface.",
    tech: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Sui / Move",
      "@mysten/dapp-kit",
      "GSAP",
    ],
    image: "/images/projects/pandabox.png",
    link: "https://pandabox.money",
  },

  {
    number: "03",
    title: "FlexBoat",
    category: "Frontend Engineering",
    year: "2026",
    description:
      "A marketing landing page for FlexBoat, a boat rental marketplace within the Flex Super App ecosystem. The page targets boat owners, walking them through the value proposition, vendor onboarding flow, and key platform features,including verified user matching, smart booking management, and flexible earning controls. Includes animated preloader, responsive layout, and CTAs linking to the vendor dashboard and mobile app download",
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "Gsap"],
    image: "/images/projects/flex-boat.png",
    link: "https://flex-boat-landing-page.vercel.app/",
  },

  {
    number: "04",
    title: "Sui Studio",
    category: "Frontend Engineering",
    year: "2026",
    description:
      "The PFP studio for every Sui NFT collection. A free, browser-based identity forge where holders connect their Sui wallet and dress up their NFT with custom backgrounds, frames, badges and tier-gated overlays, then export a finished avatar or a 1500×500 Twitter/X cover. Wallet tiers (Mythic Whale, Whale, Collector, Holder) are derived live from on-chain Random Panda holdings to unlock rarer assets, and the whole landing is a cinematic WebGL 'forge' experience built with React Three Fiber. No signup, no fees, instant download.",
    tech: [
      "Next.js",
      "TypeScript",
      "React Three Fiber",
      "Sui dApp Kit",
      "Tailwind CSS",
    ],
    image: "/images/projects/sui-studio.png",
    link: "https://sui-studio.xyz/",
  },

  {
    number: "05",
    title: "Conekt",
    category: "Frontend Engineering",
    year: "2025",
    description:
      "Conekt is a Web3-native messaging platform built on Solana combining familiar chat features with on-chain identity, end-to-end encryption, and a chat-to-earn reward engine. I built the marketing landing page to communicate a complex Web3 product to both crypto-native users and mainstream audiences, balancing technical credibility with an approachable, energetic visual identity. Built with Next.js and TailwindCSS.",
    tech: ["Next.js", "Typescript", "Tailwind Css", "Gsap"],
    image: "/images/projects/conektapp.png",
    link: "https://conekt-landing-page-v2.vercel.app/",
  },
];
