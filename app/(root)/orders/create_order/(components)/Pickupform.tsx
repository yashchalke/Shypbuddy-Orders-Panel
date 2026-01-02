"use client";
import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

type FormProps = {
  onChange: (data: {
    addressId: number | null;
    rtoAddressId: number | null;
  }) => void;
};

const Pickupform = ({ onChange }: FormProps) => {
  const router = useRouter();

  const [rtochecked, setrtochecked] = useState(true);

  const [query, setQuery] = useState("");
  const [rtoQuery, setRtoQuery] = useState("");

  const [results, setResults] = useState<any[]>([]);
  const [rtoResults, setRtoResults] = useState<any[]>([]);

  const [selectedPickup, setSelectedPickup] = useState<any>(null);
  const [selectedRTO, setSelectedRTO] = useState<any>(null);

  useEffect(() => {
    if (!query.trim()) return setResults([]);

    const t = setTimeout(async () => {
      const res = await fetch(`/api/address/search?query=${query}`);
      const data = await res.json();
      setResults(data);
    }, 400);

    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!rtoQuery.trim()) return setRtoResults([]);

    const t = setTimeout(async () => {
      const res = await fetch(`/api/address/search?query=${rtoQuery}`);
      const data = await res.json();
      setRtoResults(data);
    }, 400);

    return () => clearTimeout(t);
  }, [rtoQuery]);

  // 📤 Send only IDs to parent
  //   useEffect(() => {
  //     onChange({
  //       addressId: selectedPickup?.id || null,
  //       rtoAddressId: rtochecked
  //         ? selectedPickup?.id || null
  //         : selectedRTO?.id || null,
  //     });
  //   }, [selectedPickup, selectedRTO, rtochecked]);

  return (
    <div>
      <h1 className="font-bold text-lg">Pick up Form</h1>

      <div className="relative md:w-[50%]">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search pickup address"
          className="w-full border py-2 px-3 rounded-lg mt-2 bg-[#1a222c] border-[#3b4f68]"
        />

        {results.map((addr) => (
          <div
            key={addr.id}
            onClick={() => {
              setSelectedPickup(addr);

              setResults([]);
              setQuery(addr.tag || "");
              onChange({
                addressId: addr.id,
                rtoAddressId: rtochecked ? addr.id : selectedRTO?.id || null,
              });
            }}
            className="p-2 hover:bg-[#2c3a4b] cursor-pointer text-sm"
          >
            <p className="font-semibold">{addr.tagName}</p>
            <p className="text-xs text-gray-400">
              {addr.tag}, {addr.address}, {addr.city}
            </p>
          </div>
        ))}
      </div>

      {/* RTO CHECKBOX */}
      <div className="flex gap-2 mt-4 items-center">
        <input
          type="checkbox"
          checked={rtochecked}
          onChange={() => setrtochecked(!rtochecked)}
        />
        <p>RTO same as Pickup</p>
      </div>

      <button
        type="button"
        onClick={() => router.push("/address/add_address")}
        className="mt-4 px-4 py-2 bg-blue-500 rounded-lg cursor-pointer hover:bg-blue-600"
      >
        + New Pickup Address
      </button>

      {/* RTO SEARCH */}
      {!rtochecked && (
        <div className="relative md:w-[50%] mt-3">
          <input
            value={rtoQuery}
            onChange={(e) => setRtoQuery(e.target.value)}
            placeholder="Search RTO address"
            className="w-full border py-2 px-3 rounded-lg bg-[#1a222c] border-[#3b4f68]"
          />

          {rtoResults.length > 0 && (
            <div className="absolute z-20 w-full bg-[#1a222c] border border-[#3b4f68] rounded-lg mt-1">
              {rtoResults.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => {
                    setSelectedRTO(addr);
                    setRtoQuery(addr.tagName || "");
                    setRtoResults([]);
                  }}
                  className="p-2 hover:bg-[#2c3a4b] cursor-pointer text-sm"
                >
                  <b>{addr.tagName}</b>
                  <p className="text-xs">{addr.address}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Pickupform;
