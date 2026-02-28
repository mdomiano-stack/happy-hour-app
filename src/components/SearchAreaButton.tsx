"use client";

import { RefreshCw } from "lucide-react";

interface SearchAreaButtonProps {
  onClick: () => void;
}

export default function SearchAreaButton({ onClick }: SearchAreaButtonProps) {
  return (
    <button
      onClick={onClick}
      className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-md transition hover:bg-gray-50 active:scale-95"
    >
      <RefreshCw className="h-4 w-4" />
      Search this area
    </button>
  );
}
