"use client";
import { useState } from "react";
import { Filter, X } from "lucide-react";
import DateRangePicker from "./DateRangePicker";

type Props = {
  onApply: (range: { from: string | null; to: string | null }) => void;

  sortOrder: "asc" | "desc" | null;
  setSortOrder: React.Dispatch<React.SetStateAction<"asc" | "desc" | null>>;

  draftPaymentType: { prepaid: boolean; cod: boolean };
  setDraftPaymentType: React.Dispatch<
    React.SetStateAction<{ prepaid: boolean; cod: boolean }>
  >;

  draftFilters: { tag: string; hsn: string; sku: string };
  setDraftFilters: React.Dispatch<
    React.SetStateAction<{ tag: string; hsn: string; sku: string }>
  >;
};

export default function FilterSidebar({
  onApply,
  sortOrder,
  setSortOrder,
  draftPaymentType,
  setDraftPaymentType,
  draftFilters,
  setDraftFilters,
}: Props) {
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

        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-80px)]">
          <DateRangePicker
            onApply={(range) => {
              onApply(range);
              setOpen(false);
            }}
          />

          {/* Sort */}
          <div className="border border-[#38495e] rounded-lg">
            <h1 className="p-4">Sort by</h1>
            <label className="flex items-center gap-2 px-4 py-2">
              <input
                type="checkbox"
                checked={sortOrder === "asc"}
                onChange={() =>
                  setSortOrder((p) => (p === "asc" ? null : "asc"))
                }
              />
              Date Ascending
            </label>
            <label className="flex items-center gap-2 px-4 py-2">
              <input
                type="checkbox"
                checked={sortOrder === "desc"}
                onChange={() =>
                  setSortOrder((p) => (p === "desc" ? null : "desc"))
                }
              />
              Date Descending
            </label>
          </div>

          {/* Payment */}
          <div>
            <h2 className="text-sm mb-2">Payment Type</h2>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={draftPaymentType.prepaid}
                onChange={(e) =>
                  setDraftPaymentType((p) => ({
                    ...p,
                    prepaid: e.target.checked,
                  }))
                }
              />
              Prepaid
            </label>

            <label className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={draftPaymentType.cod}
                onChange={(e) =>
                  setDraftPaymentType((p) => ({
                    ...p,
                    cod: e.target.checked,
                  }))
                }
              />
              COD
            </label>
          </div>

          {/* Product Filters */}
          <div>
            <h2 className="text-sm mb-2">Product Filters</h2>

            <input
              placeholder="Tag"
              value={draftFilters.tag}
              onChange={(e) =>
                setDraftFilters((p) => ({ ...p, tag: e.target.value }))
              }
              className="w-full bg-[#2b394b] px-2 py-1 rounded border border-[#3b4f68]"
            />

            <input
              placeholder="HSN"
              value={draftFilters.hsn}
              onChange={(e) =>
                setDraftFilters((p) => ({ ...p, hsn: e.target.value }))
              }
              className="w-full mt-2 bg-[#2b394b] px-2 py-1 rounded border border-[#3b4f68]"
            />

            <input
              placeholder="SKU"
              value={draftFilters.sku}
              onChange={(e) =>
                setDraftFilters((p) => ({ ...p, sku: e.target.value }))
              }
              className="w-full mt-2 bg-[#2b394b] px-2 py-1 rounded border border-[#3b4f68]"
            />
          </div>
          <div className="p-4 space-x-4">
            <button
              onClick={() => {
                onApply({ from: null, to: null }); // dateRange already in parent state
                setOpen(false);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg mt-4"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
