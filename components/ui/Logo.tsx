// components/Logo.tsx
import React from 'react';
import Image from 'next/image';

export default function Logo() {
  return (
    <div className="w-48 mx-auto">
      <Image
        src="/logo.png" // ✅ This works because logo.png is in /public
        alt="Taktr Logo"
        width={192}
        height={64}
        priority
      />
    </div>
  );
}