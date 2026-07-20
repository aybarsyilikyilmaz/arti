// Artı marka logosu (zeytin dalı) — TEK kaynak. Tanıtım sitesi navbar'ı ve
// müşteri uygulaması header'ı aynı logoyu kullanır ki marka asla ayrışmasın.
import React from 'react';

export default function BrandLogo({ className }) {
  return (
    <svg viewBox="0 0 100 80" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Right branch stem */}
      <path d="M 45 42 Q 65 42 85 25" />
      {/* Right branch leaves */}
      <path d="M 55 40 Q 52 30 63 24 Q 61 35 55 40 Z" />
      <path d="M 68 35 Q 65 24 77 18 Q 75 28 68 35 Z" />
      <path d="M 80 28 Q 80 18 92 18 Q 88 28 80 28 Z" />
      <path d="M 58 41 Q 65 48 72 45 Q 65 38 58 41 Z" />
      <path d="M 70 34 Q 78 40 85 38 Q 77 32 70 34 Z" />
      {/* Right branch berries */}
      <path d="M 62 38 L 65 23" />
      <circle cx="65" cy="23" r="2" fill="currentColor" />
      <path d="M 73 31 L 77 16" />
      <circle cx="77" cy="16" r="2" fill="currentColor" />
      <path d="M 82 27 L 87 12" />
      <circle cx="87" cy="12" r="2" fill="currentColor" />

      {/* Left branch stem */}
      <path d="M 55 40 Q 35 38 15 55" />
      {/* Left branch leaves */}
      <path d="M 45 40 Q 48 50 37 56 Q 39 45 45 40 Z" />
      <path d="M 32 45 Q 35 56 23 62 Q 25 52 32 45 Z" />
      <path d="M 20 52 Q 20 62 8 62 Q 12 52 20 52 Z" />
      <path d="M 42 39 Q 35 32 28 35 Q 35 42 42 39 Z" />
      <path d="M 30 46 Q 22 40 15 42 Q 23 48 30 46 Z" />
      {/* Left branch berries */}
      <path d="M 38 42 L 35 57" />
      <circle cx="35" cy="57" r="2" fill="currentColor" />
      <path d="M 27 49 L 23 64" />
      <circle cx="23" cy="64" r="2" fill="currentColor" />
      <path d="M 18 53 L 13 68" />
      <circle cx="13" cy="68" r="2" fill="currentColor" />
    </svg>
  );
}
