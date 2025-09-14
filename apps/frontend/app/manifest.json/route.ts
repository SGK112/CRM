import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    name: "Remodely CRM",
    short_name: "Remodely",
    description: "Professional CRM for remodeling contractors",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#d97706",
    orientation: "portrait-primary",
    scope: "/",
    lang: "en-US",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any"
      }
    ]
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}