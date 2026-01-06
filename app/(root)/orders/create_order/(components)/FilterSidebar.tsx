"use client";
import { useState } from "react";
import { Filter, X } from "lucide-react";
import DateRangePicker from "./DateRangePicker";

type Props = {
  onApply: (range: { from: string | null; to: string | null }) => void;
  sortOrder: "asc" | "desc" | null;
  setSortOrder: React.Dispatch<React.SetStateAction<"asc" | "desc" | null>>;
};

export default function FilterSidebar({ onApply,sortOrder, setSortOrder }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-white text-black px-4 py-2 rounded-lg flex items-center gap-x-2"
      >
        <Filter size={15} /> Filter
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-72 bg-[#1f2b3a] text-white z-50 transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between p-4 border-b border-[#38495e]">
          <h1>Filters</h1>
          <button onClick={() => setOpen(false)}>
            <X />
          </button>
        </div>

        <div className="p-4 space-y-4">

  <DateRangePicker
    onApply={(range) => {
      onApply(range);
      setOpen(false);
    }}
  />

  {/* Sort Filter */}
  <div className="bg-[#1f2b3a] rounded-lg border border-[#38495e] overflow-hidden">
    <h1 className="p-4">Sort by</h1>
    <label className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-[#2b394b]">
      <input
        type="checkbox"
        checked={sortOrder === "asc"}
        onChange={() =>
          setSortOrder((prev) => (prev === "asc" ? null : "asc"))
        }
      />
      <span>Date Ascending</span>
    </label>

    <label className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-[#2b394b]">
      <input
        type="checkbox"
        checked={sortOrder === "desc"}
        onChange={() =>
          setSortOrder((prev) => (prev === "desc" ? null : "desc"))
        }
      />
      <span>Date Descending</span>
    </label>
  </div>
</div>

      </div>
    </>
  );
}
