'use client';

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--brand-bg)]">
      <img src="/logo.png" alt="TaktR Logo" className="w-32 h-32 mb-6" />
      <h1 className="text-4xl font-bold text-brand mb-4">Welcome to TaktR</h1>
      <p className="text-lg text-gray-700 mb-6">Lean Project Planning made simple.</p>
      <Link href="/dashboard">
        <button className="px-6 py-2 bg-brand text-white rounded shadow hover:bg-brand-dark">
          Go to Dashboard
        </button>
      </Link>
    </div>
  );
}