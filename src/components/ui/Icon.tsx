/**
 * Tabler-style outline icons — 1.5px stroke, currentColor, never filled.
 * (Paths adapted from Tabler Icons, MIT.)
 */
import type { SVGProps } from "react";

const paths: Record<string, string> = {
  // ui
  "arrow-up-right": "M17 7l-10 10M8 7h9v9",
  menu: "M4 6h16M4 12h16M4 18h16",
  x: "M6 6l12 12M18 6L6 18",
  check: "M5 12l5 5L20 7",
  point: "M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0",
  layout: "M4 4h16v16H4zM4 9h16M9 9v11",
  language: "M4 5h7M9 3v2c0 4.418-2.239 8-5 8M5 9c0 2.144 2.952 3.908 6.7 4M12 20l4-9 4 9M19.1 18h-6.2",
  // entities / generic
  stack: "M12 4l8 4-8 4-8-4 8-4zM4 12l8 4 8-4M4 16l8 4 8-4",
  building: "M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M9 8h1M9 12h1M14 8h1M14 12h1",
  cpu: "M5 5h14v14H5zM9 9h6v6H9M3 10h2M3 14h2M19 10h2M19 14h2M10 3v2M14 3v2M10 19v2M14 19v2",
  coins: "M9 14c0 1.657 2.686 3 6 3s6-1.343 6-3-2.686-3-6-3-6 1.343-6 3zM9 14v4c0 1.656 2.686 3 6 3s6-1.344 6-3v-4M3 6c0 1.072 1.144 2.062 3 2.598M3 6c0-1.072 1.4-2 4-2.5M3 6v10c0 .888.772 1.45 2 2M3 11c0 .888.772 1.45 2 2",
  world: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3.6 9h16.8M3.6 15h16.8M11.5 3a17 17 0 0 0 0 18M12.5 3a17 17 0 0 1 0 18",
  bolt: "M13 3v7h6l-8 11v-7H5l8-11z",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  // people
  user: "M12 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21v-1a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1",
  users: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20v-1a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1M16 5.2a3 3 0 0 1 0 5.6M21 20v-1a4 4 0 0 0-3-3.8",
  id: "M4 5h16v14H4zM8 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6 16a3 3 0 0 1 6 0M14 9h4M14 12h4M14 15h3",
  search: "M11 11m-7 0a7 7 0 1 0 14 0 7 7 0 1 0-14 0M21 21l-4.3-4.3",
  // comms
  message: "M4 5h16v11H8l-4 4z",
  mail: "M3 7l9 6 9-6M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z",
  video: "M16 10l5-3v10l-5-3zM3 6h12a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z",
  send: "M3 11l18-7-7 18-3-7-8-4z",
  megaphone: "M3 11v2a1 1 0 0 0 1 1h2l4 4V6L6 10H4a1 1 0 0 0-1 1zM14 8a4 4 0 0 1 0 8M18 6a8 8 0 0 1 0 12",
  // content
  "file-text": "M14 3v5h5M6 3h8l5 5v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM9 13h6M9 17h6",
  sparkles: "M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8zM18 14l.9 2.1 2.1.9-2.1.9L18 21l-.9-2.1L15 18l2.1-.9z",
  robot: "M9 6h6a3 3 0 0 1 3 3v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9a3 3 0 0 1 3-3zM12 3v3M9.5 13h.01M14.5 13h.01M10 16h4",
  music: "M9 18a3 3 0 1 0 0-.1M9 18V6l11-2v12M20 16a3 3 0 1 0 0-.1",
  play: "M8 5v14l11-7z",
  glasses: "M4 8h16a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-4l-2-3h-4l-2 3H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z",
  // business
  box: "M3 8l9-5 9 5v8l-9 5-9-5zM3 8l9 5 9-5M12 13v8",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  receipt: "M6 21V4l2 1 2-1 2 1 2-1 2 1 2-1v17l-2-1-2 1-2-1-2 1-2-1zM9 8h6M9 12h6M9 16h4",
  school: "M12 4L2 9l10 5 10-5-10-5zM6 11v5c0 1 3 3 6 3s6-2 6-3v-5",
  home: "M3 11l9-8 9 8M5 9v11h14V9",
  "trending-up": "M3 17l6-6 4 4 8-8M15 7h6v6",
  lifebuoy: "M12 12m-9 0a9 9 0 1 0 18 0 9 9 0 1 0-18 0M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0M6 6l3.5 3.5M14.5 14.5L18 18M18 6l-3.5 3.5M9.5 14.5L6 18",
  settings: "M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1",
  cart: "M6 6h15l-1.5 9h-12zM6 6L5 3H3M9 19a1 1 0 1 0 .01 0M17 19a1 1 0 1 0 .01 0",
  target: "M12 12m-9 0a9 9 0 1 0 18 0 9 9 0 1 0-18 0M12 12m-5 0a5 5 0 1 0 10 0 5 5 0 1 0-10 0M12 12m-1 0a1 1 0 1 0 2 0 1 1 0 1 0-2 0",
  wrench: "M14.5 5.5a3.5 3.5 0 0 0-4.9 4.4L3 16.5V21h4.5l6.6-6.6a3.5 3.5 0 0 0 4.4-4.9l-2.4 2.4-2.5-.5-.5-2.5z",
  database: "M5 6c0-1.7 3.1-3 7-3s7 1.3 7 3-3.1 3-7 3-7-1.3-7-3zM5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6",
  server: "M4 5h16v6H4zM4 13h16v6H4zM8 8h.01M8 16h.01",
  "shopping-bag": "M6 8h12l-1 11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 8zM9 11V6a3 3 0 0 1 6 0v5",
};

export function Icon({ name, size = 20, ...props }: { name: keyof typeof paths | string; size?: number } & SVGProps<SVGSVGElement>) {
  const d = paths[name] ?? paths.point;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {d.split("M").filter(Boolean).map((seg, i) => (
        <path key={i} d={"M" + seg} />
      ))}
    </svg>
  );
}
