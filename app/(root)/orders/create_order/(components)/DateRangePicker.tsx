"use client";
import React, { useState } from "react";

type Props = {
  onApply: (range: { from: string | null; to: string | null }) => void;
};

export default function DateRangePicker({ onApply }: Props) {
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);

  return (
    <div className="bg-[#1f2b3a] p-4 rounded-lg flex gap-4 items-end border border-[#38495e]">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400">From</label>
        <input
          type="date"
          value={from || ""}
          onChange={(e) => setFrom(e.target.value)}
          className="bg-[#2b394b] border border-[#3b4f68] px-3 py-2 rounded"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400">To</label>
        <input
          type="date"
          value={to || ""}
          onChange={(e) => setTo(e.target.value)}
          className="bg-[#2b394b] border border-[#3b4f68] px-3 py-2 rounded"
        />
      </div>

      <button
        onClick={() => onApply({ from, to })}
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
      >
        Apply
      </button>

      <button
        onClick={() => {
          setFrom(null);
          setTo(null);
          onApply({ from: null, to: null });
        }}
        className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm"
      >
        Clear
      </button>
    </div>
  );
}
