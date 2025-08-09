// components/Topbar.tsx
import Image from "next/image";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-[#0a0a0a]">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Image
          src="/logo.png"
          alt="TAKTR"
          width={160}   // was small — bump this
          height={48}
          priority
        />
        <h1 className="text-white text-xl font-semibold">Dashboard</h1>
        <div className="ml-auto" />
      </div>
    </header>
  );
}