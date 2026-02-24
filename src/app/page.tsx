"use client";

import { Beer, Plus, Search, Star } from "lucide-react";
import { useState } from "react";
import MapView from "@/components/MapView";

const SAMPLE_DEALS = [
  {
    id: 1,
    bar: "The Rusty Anchor",
    deal: "$3 drafts & half-off apps",
    hours: "4pm – 7pm",
    rating: 4.5,
    distance: "0.2 mi",
    tags: ["Beer", "Food"],
  },
  {
    id: 2,
    bar: "Neon Lounge",
    deal: "2-for-1 cocktails",
    hours: "5pm – 8pm",
    rating: 4.2,
    distance: "0.5 mi",
    tags: ["Cocktails"],
  },
  {
    id: 3,
    bar: "Barrel & Vine",
    deal: "$5 wine & $4 well drinks",
    hours: "3pm – 6pm",
    rating: 4.8,
    distance: "0.8 mi",
    tags: ["Wine", "Spirits"],
  },
];

export default function Home() {
  const [search, setSearch] = useState("");

  const filtered = SAMPLE_DEALS.filter(
    (d) =>
      d.bar.toLowerCase().includes(search.toLowerCase()) ||
      d.deal.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen flex-col bg-gray-50 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between bg-amber-500 px-4 py-3 shadow-md">
        <div className="flex items-center gap-2">
          <Beer className="h-6 w-6 text-white" />
          <span className="text-xl font-bold tracking-tight text-white">
            HappyHour
          </span>
        </div>
        <button className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-amber-600 shadow transition hover:bg-amber-50 active:scale-95">
          <Plus className="h-4 w-4" />
          Add Deal
        </button>
      </header>

      {/* Search bar */}
      <div className="bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-100 px-4 py-2">
          <Search className="h-4 w-4 shrink-0 text-gray-400" />
          <input
            type="text"
            placeholder="Search bars or deals…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Main content: deals column + map */}
      <div className="flex flex-1 overflow-hidden">
        {/* Deal list - left column */}
        <div className="w-96 flex flex-col border-r border-gray-200 bg-white">
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Deals Near You
            </h2>
            <div className="flex flex-col gap-3">
              {filtered.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-8">
                  No deals match your search.
                </p>
              )}
              {filtered.map((deal) => (
                <div
                  key={deal.id}
                  className="rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">{deal.bar}</h3>
                      <p className="mt-0.5 text-sm text-amber-600">{deal.deal}</p>
                      <p className="mt-1 text-xs text-gray-400">{deal.hours}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1 text-xs text-yellow-500">
                        <Star className="h-3.5 w-3.5 fill-yellow-400" />
                        <span className="font-medium text-gray-700">
                          {deal.rating}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">{deal.distance}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-1.5">
                    {deal.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Google Map - right side */}
        <div className="flex-1 p-4">
          <MapView />
        </div>
      </div>
    </div>
  );
}
