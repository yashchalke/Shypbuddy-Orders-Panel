"use client";
import React, { useEffect, useState,useRef } from "react";
import { useRouter } from "next/navigation";

type FormProps = {
  value: {
    addressId: number | null;
    rtoAddressId: number | null;
  };
  onChange: (data: {
    addressId: number | null;
    rtoAddressId: number | null;
  }) => void;
};

const Pickupform = ({ value,onChange }: FormProps) => {
  const router = useRouter();
  const isEditMode = value.addressId !== null && value.rtoAddressId !== null;


  const [rtochecked, setrtochecked] = useState(true);

  // Search Inputs
  const [query, setQuery] = useState("");
  const [rtoQuery, setRtoQuery] = useState("");

  // Search Results
  const [results, setResults] = useState<any[]>([]);
  const [rtoResults, setRtoResults] = useState<any[]>([]);

  // Selected Objects
  const [selectedPickup, setSelectedPickup] = useState<any>(null);
  const [selectedRTO, setSelectedRTO] = useState<any>(null);

  // Visibility Controls
  const [showPickup, setShowPickup] = useState(false);
  const [showRto, setShowRto] = useState(false);

  //for update syncing
  const isSyncing = useRef(false);

  // Fetch logic
  const fetchAddresses = async (searchTerm: string, type: "pickup" | "rto") => {
    try {
      const res = await fetch(`/api/address/search?query=${searchTerm}`);
      const data = await res.json();
      if (type === "pickup") setResults(data);
      else setRtoResults(data);
    } catch (error) {
      console.error(error);
    }
  };

  // Debounce Effect for Pickup
  useEffect(() => {
    if (!showPickup) return;
    const t = setTimeout(() => fetchAddresses(query, "pickup"), 400);
    return () => clearTimeout(t);
  }, [query, showPickup]);

  // Debounce Effect for RTO
  useEffect(() => {
    if (!showRto || rtochecked) return;
    const t = setTimeout(() => fetchAddresses(rtoQuery, "rto"), 400);
    return () => clearTimeout(t);
  }, [rtoQuery, showRto, rtochecked]);

useEffect(() => {
  if (!isEditMode) return; 

  isSyncing.current = true;

  const load = async () => {
    if (value.addressId) {
      const p = await fetch(`/api/address/search?id=${value.addressId}`).then(r => r.json());
      setSelectedPickup(p);
      setQuery(p.tag || "");
    }

    if (value.rtoAddressId) {
      const r = await fetch(`/api/address/search?id=${value.rtoAddressId}`).then(r => r.json());
      setSelectedRTO(r);
      setRtoQuery(r.tag || "");
    }

    setrtochecked(value.addressId === value.rtoAddressId);

    isSyncing.current = false;
  };

  load();
}, [value.addressId, value.rtoAddressId]);



  return (
    <div>
      <h1 className="font-bold text-lg">Pick up Form</h1>

      {/* --- PICKUP ADDRESS SECTION --- */}
      <div className="relative md:w-[50%]">
        <input
          value={query}
          placeholder="Search pickup address"
          className="w-full border py-2 px-3 rounded-lg mt-2 bg-[#1a222c] border-[#3b4f68]"
          onChange={(e) => setQuery(e.target.value)}
          
          // 1. Show on focus
          onFocus={() => {
            setShowPickup(true);
            fetchAddresses(query, "pickup");
          }}
          
          // 2. Hide on blur (click away)
          onBlur={() => setShowPickup(false)}
        />

        {showPickup && results.length > 0 && (
          <div className="absolute z-20 w-full bg-[#1a222c] border border-[#3b4f68] rounded-lg mt-1 max-h-60 overflow-y-auto shadow-xl">
            {results.map((addr) => (
              <div
                key={addr.id}
                // 3. USE onMouseDown INSTEAD OF onClick
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevents input blur, ensuring this runs first!
                  
                  setSelectedPickup(addr);
                  setQuery(addr.tag || ""); // Update input text
                  setShowPickup(false); // Close dropdown
                  
                  // Trigger parent update
                  if (!isSyncing.current)
                  onChange({
                    addressId: addr.id,
                    rtoAddressId: rtochecked ? addr.id : selectedRTO?.id || null,
                  });
                }}
                className="p-2 hover:bg-[#2c3a4b] cursor-pointer text-sm border-b border-[#2c3a4b]"
              >
                <p className="font-semibold">{addr.tag}</p>
                <p className="text-xs text-gray-400">
                  {addr.tag}, {addr.address}, {addr.city}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- CHECKBOX --- */}
      <div className="flex gap-2 mt-4 items-center">
        <input
          type="checkbox"
          checked={rtochecked}
          onChange={() => {
            const v = !rtochecked;
            setrtochecked(v);

            if (!isSyncing.current)
              onChange({
                addressId: selectedPickup?.id || null,
                rtoAddressId: v ? selectedPickup?.id || null : selectedRTO?.id || null,
              });
          }}
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

      {/* --- RTO ADDRESS SECTION --- */}
      {!rtochecked && (
        <div className="relative md:w-[50%] mt-3">
          <input
            value={rtoQuery}
            placeholder="Search RTO address"
            className="w-full border py-2 px-3 rounded-lg bg-[#1a222c] border-[#3b4f68]"
            onChange={(e) => setRtoQuery(e.target.value)}
            onFocus={() => {
              setShowRto(true);
              fetchAddresses(rtoQuery, "rto");
            }}
            onBlur={() => setShowRto(false)}
          />

          {showRto && rtoResults.length > 0 && (
            <div className="absolute z-20 w-full bg-[#1a222c] border border-[#3b4f68] rounded-lg mt-1 max-h-60 overflow-y-auto shadow-xl">
              {rtoResults.map((addr) => (
                <div
                  key={addr.id}
                  onMouseDown={(e) => {
                    e.preventDefault(); // Critical for selection to work
                    
                    setSelectedRTO(addr);
                    setRtoQuery(addr.tag || "");
                    setShowRto(false);
                    
                    if (!isSyncing.current)
                    onChange({
                      addressId: selectedPickup?.id || null,
                      rtoAddressId: addr.id,
                    });
                  }}
                  className="p-2 hover:bg-[#2c3a4b] cursor-pointer text-sm border-b border-[#2c3a4b]"
                >
                  <b>{addr.tag}</b>
                  <p className="text-xs text-gray-400">
                  {addr.tag}, {addr.address}, {addr.city}
                </p>
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