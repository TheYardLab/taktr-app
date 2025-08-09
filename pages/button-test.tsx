// pages/button-test.tsx
import React from "react";
import { Button } from "@/components/ui/button";

export default function ButtonTestPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Button Variants Test</h1>

      <div className="space-y-4">
        <h2 className="font-semibold">Variants</h2>
        <div className="flex gap-4 flex-wrap">
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold">Sizes</h2>
        <div className="flex gap-4 flex-wrap">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">🔍</Button>
        </div>
      </div>
    </div>
  );
}