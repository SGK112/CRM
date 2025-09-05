"use client";

import React from 'react';

type Coordinates = { lat: number; lng: number };

interface MapEmbedProps {
  address?: string;
  coordinates?: Coordinates;
  height?: number | string;
  zoom?: number;
  rounded?: boolean;
  className?: string;
}

/**
 * MapEmbed renders a Google Maps embedded map for a given address or coordinates.
 * Uses NEXT_PUBLIC_GOOGLE_MAPS_API_KEY when available, and falls back to a simple
 * Google Maps link if not configured.
 */
export default function MapEmbed({
  address,
  coordinates,
  height = 260,
  zoom = 14,
  rounded = true,
  className = ''
}: MapEmbedProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const hasCoords = !!coordinates && typeof coordinates.lat === 'number' && typeof coordinates.lng === 'number';
  const hasAddress = !!address && address.trim().length > 0;

  // If we have neither, render empty state
  if (!hasCoords && !hasAddress) {
    return (
      <div
        className={`flex items-center justify-center bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-dim)] ${
          rounded ? 'rounded-lg' : ''
        } ${className}`}
        style={{ height }}
      >
        Location not available
      </div>
    );
  }

  const style: React.CSSProperties = { height, width: '100%', border: 0 };

  // Prefer Embed API if key is present
  if (apiKey) {
    let src = '';
    if (hasCoords) {
      const { lat, lng } = coordinates as Coordinates;
      // Using Google Maps Embed API - View mode
      src = `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${lat},${lng}&zoom=${zoom}&maptype=roadmap`;
    } else if (hasAddress) {
      src = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(address as string)}&zoom=${zoom}`;
    }

    return (
      <iframe
        title="Location Map"
        src={src}
        loading="lazy"
        allowFullScreen
        className={`${rounded ? 'rounded-lg' : ''} ${className}`}
        style={style}
      />
    );
  }

  // Fallback: clickable static container that opens Maps in a new tab
  const mapsUrl = hasCoords
    ? `https://maps.google.com/?q=${(coordinates as Coordinates).lat},${(coordinates as Coordinates).lng}`
    : `https://maps.google.com/?q=${encodeURIComponent(address as string)}`;

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noreferrer"
      className={`block bg-[var(--surface-2)] border border-[var(--border)] hover:bg-[var(--surface)] transition-colors ${
        rounded ? 'rounded-lg' : ''
      } ${className}`}
      style={{ height }}
      aria-label="Open location in Google Maps"
    >
      <div className="h-full w-full flex items-center justify-center text-[var(--text-dim)]">
        Open in Google Maps
      </div>
    </a>
  );
}
