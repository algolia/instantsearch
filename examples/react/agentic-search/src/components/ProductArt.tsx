import React from 'react';

const COLORS: Record<string, string> = {
  Blue: '#3b6fd8',
  Black: '#2b2b31',
  White: '#f3f2ee',
  Red: '#d3473d',
  Brown: '#8d5b3c',
  Green: '#3f8f5c',
  Grey: '#8c9099',
};

export function colorValue(color: string) {
  return COLORS[color] ?? '#999';
}

const SOLE = 'M14 72h128a6 6 0 0 1 0 12H20a6 6 0 0 1-6-6z';

function Shape({ category }: { category: string }) {
  switch (category) {
    case 'Running shoes':
      return (
        <>
          <path d={SOLE} className="art-sole" />
          <path
            d="M18 72c0-14 8-26 22-30l20-8c10 10 26 14 42 16 20 2 36 8 40 22z"
            className="art-fill"
          />
          <path
            d="M52 64l28-16M66 66l28-14M80 68l24-12"
            className="art-detail"
          />
        </>
      );
    case 'Boots':
      return (
        <>
          <path
            d="M30 72h112a6 6 0 0 1 0 12H36a6 6 0 0 1-6-6z"
            className="art-sole"
          />
          <path
            d="M42 14h34v38c22 3 52 8 64 20H34c0-22 4-40 8-58z"
            className="art-fill"
          />
          <path d="M76 26h-14M76 36h-14M76 46h-14" className="art-detail" />
        </>
      );
    case 'Loafers':
      return (
        <>
          <path
            d="M18 74h126a4 4 0 0 1 0 8H22a4 4 0 0 1-4-4z"
            className="art-sole"
          />
          <path
            d="M22 74c2-12 18-20 38-20 24 0 50 2 68 8 10 3 14 8 14 12z"
            className="art-fill"
          />
          <path d="M84 56c6 6 20 8 30 6" className="art-detail" />
        </>
      );
    case 'Sandals':
      return (
        <>
          <path
            d="M16 74h128a5 5 0 0 1 0 10H21a5 5 0 0 1-5-5z"
            className="art-fill"
          />
          <path
            d="M40 74c4-18 24-18 28 0M92 74c4-22 32-22 36 0"
            className="art-strap"
          />
        </>
      );
    case 'Bags':
      return (
        <>
          <path
            d="M60 38v-8a6 6 0 0 1 6-6h28a6 6 0 0 1 6 6v8"
            className="art-strap"
          />
          <rect
            x="32"
            y="38"
            width="96"
            height="50"
            rx="9"
            className="art-fill"
          />
          <path d="M32 54h96" className="art-detail" />
        </>
      );
    case 'Socks':
      return (
        <>
          <path
            d="M64 10h30v48c0 6 4 9 10 11 16 5 20 13 15 21-4 6-13 6-24 2L66 80c-9-4-12-11-12-19V10z"
            className="art-fill"
          />
          <path d="M64 22h30" className="art-detail" />
        </>
      );
    case 'Jackets':
      return (
        <>
          <path
            d="M58 14l22 7 22-7 28 14 8 42-16 2-2-18v38H40V54l-2 18-16-2 8-42z"
            className="art-fill"
          />
          <path d="M80 21v71M58 14l22 22 22-22" className="art-detail" />
        </>
      );
    default:
      return (
        <>
          <path d={SOLE} className="art-sole" />
          <path
            d="M18 72c0-16 8-28 22-32l22-6c8 10 22 14 36 16 22 2 40 8 44 22z"
            className="art-fill"
          />
          <path d="M60 46l8 8M68 42l8 8M76 40l8 8" className="art-detail" />
        </>
      );
  }
}

export function ProductArt({
  category,
  color,
  material,
}: {
  category: string;
  color: string;
  material: string;
}) {
  return (
    <div
      className="art"
      data-material={material.toLowerCase()}
      style={{ '--product-color': colorValue(color) } as React.CSSProperties}
    >
      <svg viewBox="0 0 160 100" aria-hidden="true" focusable="false">
        <Shape category={category} />
      </svg>
    </div>
  );
}
