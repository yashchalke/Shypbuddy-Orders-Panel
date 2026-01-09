"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

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

const Pickupform_updated = ({ value, onChange }: FormProps) => {
  const router = useRouter();
  const isEditMode = value.addressId !== null && value.rtoAddressId !== null;

  const [rtochecked, setrtochecked] = useState(true);

  const [query, setQuery] = useState("");
  const [rtoQuery, setRtoQuery] = useState("");

  const [results, setResults] = useState<any[]>([]);
  const [rtoResults, setRtoResults] = useState<any[]>([]);

  const [pickupCache, setPickupCache] = useState<any[]>([]);
  const [rtoCache, setRtoCache] = useState<any[]>([]);

  const [showPickup, setShowPickup] = useState(false);
  const [showRto, setShowRto] = useState(false);

  const [selectedPickup, setSelectedPickup] = useState<any>(null);
  const [selectedRTO, setSelectedRTO] = useState<any>(null);
  const [errors, setErrors] = useState<{ pickup?: string; rto?: string }>({});

  const isSyncing = useRef(false);

  const pickupSchema = z.object({
    pickup: z.string().min(1, "Pickup address is required"),
    rto: z.string().optional(),
  });

  // Fetch addresses only when dropdown opens
  const fetchAddresses = async (type: "pickup" | "rto") => {
    const res = await fetch(`/api/address/search?query=`);
    const data = await res.json();

    if (type === "pickup") {
      setPickupCache(data);
      setResults(data);
    } else {
      setRtoCache(data);
      setRtoResults(data);
    }
  };

  useEffect(() => {
    if (showPickup && pickupCache.length === 0) fetchAddresses("pickup");
  }, [showPickup]);

  useEffect(() => {
    if (showRto && rtoCache.length === 0 && !rtochecked) fetchAddresses("rto");
  }, [showRto, rtochecked]);

  // Local filtering
  useEffect(() => {
    if (!showPickup) return;
    setResults(
      pickupCache.filter((a) =>
        `${a.tag} ${a.phone} ${a.address}`
          .toLowerCase()
          .includes(query.toLowerCase())
      )
    );
  }, [query, pickupCache, showPickup]);

  useEffect(() => {
    if (!showRto || rtochecked) return;
    setRtoResults(
      rtoCache.filter((a) =>
        `${a.tag} ${a.phone} ${a.address}`
          .toLowerCase()
          .includes(rtoQuery.toLowerCase())
      )
    );
  }, [rtoQuery, rtoCache, showRto, rtochecked]);

  // Edit Mode Sync
  useEffect(() => {
    if (!isEditMode) return;

    isSyncing.current = true;

    const load = async () => {
      if (value.addressId) {
        const p = await fetch(`/api/address/search?id=${value.addressId}`).then(
          (r) => r.json()
        );
        setSelectedPickup(p);
        setQuery(p.tag || "");
      }

      if (value.rtoAddressId) {
        const r = await fetch(
          `/api/address/search?id=${value.rtoAddressId}`
        ).then((r) => r.json());
        setSelectedRTO(r);
        setRtoQuery(r.tag || "");
      }

      setrtochecked(value.addressId === value.rtoAddressId);
      isSyncing.current = false;
    };

    load();
  }, [value.addressId, value.rtoAddressId]);

  const validatePickupInput = () => {
    const isValid = pickupCache.some(
      (a) => a.tag?.toLowerCase() === query.toLowerCase()
    );

    const result = pickupSchema.safeParse({ pickup: isValid ? query : "" });

    if (!result.success) {
      setQuery("");
      setSelectedPickup(null);

      setErrors({ pickup: result.error.issues[0].message });

      if (!isSyncing.current)
        onChange({
          addressId: null,
          rtoAddressId: rtochecked ? null : selectedRTO?.id || null,
        });
    } else {
      setErrors((e) => ({ ...e, pickup: undefined }));
    }
  };

  const validateRtoInput = () => {
    const isValid = rtoCache.some(
      (a) => a.tag?.toLowerCase() === rtoQuery.toLowerCase()
    );

    const result = pickupSchema.safeParse({ pickup: isValid ? rtoQuery : "" });

    if (!result.success) {
      setRtoQuery("");
      setSelectedRTO(null);

      setErrors((e) => ({ ...e, rto: result.error.issues[0].message }));

      if (!isSyncing.current)
        onChange({ addressId: selectedPickup?.id || null, rtoAddressId: null });
    } else {
      setErrors((e) => ({ ...e, rto: undefined }));
    }
  };

  return (
    <div>
      <h1 className="font-bold text-lg">Pick up Form</h1>

      {/* Pickup */}
      <div className="relative md:w-[50%]">
        <input
          value={query}
          placeholder="Search pickup address"
          className="w-full border py-2 px-3 rounded-lg mt-2 bg-[#1a222c] border-[#3b4f68]"
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowPickup(true)}
          onBlur={() =>
            setTimeout(() => {
              validatePickupInput();
              setShowPickup(false);
            }, 150)
          }
        />
        {errors.pickup && (
          <p className="text-red-500 text-xs mt-1">{errors.pickup}</p>
        )}

        {showPickup && results.length > 0 && (
          <div className="absolute z-20 w-full bg-[#1a222c] border border-[#3b4f68] rounded-lg mt-1 max-h-60 overflow-y-auto shadow-xl">
            {results.map((addr) => (
              <div
                key={addr.id}
                onMouseDown={(e) => {
                  e.preventDefault();

                  setSelectedPickup(addr);
                  setQuery(addr.tag || "");
                  setShowPickup(false);

                  setErrors((e) => ({ ...e, pickup: undefined }));

                  if (!isSyncing.current)
                    onChange({
                      addressId: addr.id,
                      rtoAddressId: rtochecked
                        ? addr.id
                        : selectedRTO?.id || null,
                    });
                }}
                className="p-2 hover:bg-[#2c3a4b] cursor-pointer text-sm border-b border-[#2c3a4b]"
              >
                <b>{addr.tag}</b>
                <p className="text-xs text-gray-400">
                  {addr.address}, {addr.city}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RTO checkbox */}
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
                rtoAddressId: v
                  ? selectedPickup?.id || null
                  : selectedRTO?.id || null,
              });
          }}
        />
        <p>RTO same as Pickup</p>
      </div>

      {/* RTO */}
      {!rtochecked && (
        <div className="relative md:w-[50%] mt-3">
          <input
            value={rtoQuery}
            placeholder="Search RTO address"
            className="w-full border py-2 px-3 rounded-lg bg-[#1a222c] border-[#3b4f68]"
            onChange={(e) => setRtoQuery(e.target.value)}
            onFocus={() => setShowRto(true)}
            onBlur={() =>
              setTimeout(() => {
                validateRtoInput();
                setShowRto(false);
              }, 150)
            }
          />
          {errors.rto && (
            <p className="text-red-500 text-xs mt-1">{errors.rto}</p>
          )}

          {showRto && rtoResults.length > 0 && (
            <div className="absolute z-20 w-full bg-[#1a222c] border border-[#3b4f68] rounded-lg mt-1 max-h-60 overflow-y-auto shadow-xl">
              {rtoResults.map((addr) => (
                <div
                  key={addr.id}
                  onMouseDown={(e) => {
                    e.preventDefault();

                    setSelectedRTO(addr);
                    setRtoQuery(addr.tag || "");
                    setShowRto(false);

                    setErrors((e) => ({ ...e, rto: undefined }));

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
                    {addr.address}, {addr.city}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => router.push("/address/add_address")}
        className="mt-4 px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600"
      >
        + New Pickup Address
      </button>
    </div>
  );
};

export default Pickupform_updated;
