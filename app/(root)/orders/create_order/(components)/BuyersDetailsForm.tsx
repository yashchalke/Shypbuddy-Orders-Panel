"use client";
import React, { useState, useEffect, useRef } from "react";
import { z } from "zod";

type FormProps = {
  value: any;
  onChange: (data: Record<string, any>) => void;
};

const BuyersDetailsForm = ({ value, onChange }: FormProps) => {
  const states = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ];

  const buyersSchema = z.object({
    buyersname: z.string().min(2, "Name must be at least 2 characters"),
    buyersnumber: z.string().regex(/^\d{10}$/, "Number must be 10 digits"),
    alternatenumber: z
      .string()
      .regex(/^\d{10}$/, "Alternate number must be 10 digits")
      .optional()
      .or(z.literal("")),
    email: z.string().email("Invalid email address"),
    orderno: z.string().min(3, "Order number too short"),
    address: z.string().min(5, "Address is too short"),
    pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
    landmark: z.string().min(2, "Landmark required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    country: z.string().min(2, "Country is required"),
  });

  const [buyersname, setbuyersname] = useState("");
  const [buyersnumber, setbuyersnumber] = useState("");
  const [alternatenumber, setalternatenumber] = useState("");
  const [email, setemail] = useState("");
  const [orderno, setorderno] = useState("");
  const [address, setaddress] = useState("");
  const [pincode, setpincode] = useState("");
  const [landmark, setlandmark] = useState("");
  const [city, setcity] = useState("");
  const [state, setstate] = useState("");
  const [country, setcountry] = useState("India");
  const [open, setOpen] = useState<boolean>(false);
  const [Catopen, setCatOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const CatdropdownRef = useRef<HTMLDivElement>(null);
  const isSyncing = useRef(false);
  const [isFetchingPin, setIsFetchingPin] = useState(false);
  const lastFetchedPin = useRef<string | null>(null);
  const isAutoFilling = useRef(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

const fetchPincodeDetails = async (pin: string) => {
  try {
    isAutoFilling.current = true;
    setIsFetchingPin(true);

    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
    const data = await res.json();

    if (!Array.isArray(data) || !data[0]?.PostOffice?.length) return;

    const po = data[0].PostOffice[0];

    const landmarkVal = po.Name || "";
    const cityVal = po.Region || "";
    const stateVal = po.State || "";

    setlandmark(landmarkVal);
    setcity(cityVal);
    setstate(stateVal);

    onChange({
      landmark: landmarkVal,
      city: cityVal,
      state: stateVal,
    });
  } catch (err) {
    console.error("Pincode fetch failed", err);
  } finally {
    setTimeout(() => {
      isAutoFilling.current = false;
      setIsFetchingPin(false);
    }, 0);
  }
};



  useEffect(() => {
  if (!value || isAutoFilling.current) return;

  const incoming = {
    name: value.name || "",
    phone: value.phone || "",
    alternateNumber: value.alternateNumber || "",
    email: value.email || "",
    orderno: value.orderno || "",
    address: value.address || "",
    pincode: value.pincode || "",
    landmark: value.landmark || "",
    city: value.city || "",
    state: value.state || "",
  };

  const current = {
    name: buyersname,
    phone: buyersnumber,
    alternateNumber: alternatenumber,
    email,
    orderno,
    address,
    pincode,
    landmark,
    city,
    state,
  };

  // 🛑 Stop overwrite loops
  if (JSON.stringify(incoming) === JSON.stringify(current)) return;

  isSyncing.current = true;

  setbuyersname(incoming.name);
  setbuyersnumber(incoming.phone);
  setalternatenumber(incoming.alternateNumber);
  setemail(incoming.email);
  setorderno(incoming.orderno);
  setaddress(incoming.address);
  setpincode(incoming.pincode);
  setlandmark(incoming.landmark);
  setcity(incoming.city);
  setstate(incoming.state);

  setTimeout(() => {
    isSyncing.current = false;
  }, 0);
}, [value]);

  const formData = {
    name: buyersname,
    phone: buyersnumber,
    alternateNumber: alternatenumber || null,
    email,
    orderno,
    address,
    pincode,
    landmark,
    city,
    state,
  };

  useEffect(() => {
    if (isSyncing.current) return;
    onChange(formData);
  }, [
    buyersname,
    buyersnumber,
    alternatenumber,
    email,
    orderno,
    address,
    pincode,
    landmark,
    city,
    state,
  ]);

  const validateField = (key: string, value: string) => {
    const partial = buyersSchema.pick({ [key]: true } as any);
    const result = partial.safeParse({ [key]: value });

    setErrors((prev) => {
      const updated = { ...prev };
      if (!result.success) updated[key] = result.error.issues[0].message;
      else delete updated[key];
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = {
      buyersname,
      buyersnumber,
      alternatenumber,
      email,
      orderno,
      address,
      pincode,
      landmark,
      city,
      state,
    };

    const result = buyersSchema.safeParse(formData);

    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        errs[err.path[0] as string] = err.message;
      });
      setErrors(errs);
      return;
    }

    alert("Buyer Details Validated Successfully");
    console.log("Final Data:", result.data);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectState = (selectedState: string) => {
    setstate(selectedState);
    validateField("state", selectedState);
    setOpen(false);
  };

  return (
    <div className="mt-6">
      <form>
        <div>
          <h1 className="font-bold text-lg">Add Buyer's Details</h1>
          <p className="text-sm">
            To whom is the order being delivered? (Buyer's Info)
          </p>
        </div>

        <div className="mt-4 grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-5">
          <div className="flex-1 flex-col gap-2">
            <label className="text-sm">
              Buyer's Name<span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={buyersname}
              onChange={(e) => {
                setbuyersname(e.target.value);
                validateField("buyersname", e.target.value);
              }}
              placeholder="Enter buyer's name"
              className="bg-[#1a222c] px-2 py-1 rounded-lg placeholder:text-sm w-full border-[#3b4f68] border mt-2"
            />
            {errors.buyersname && (
              <p className="text-red-400 text-xs">{errors.buyersname}</p>
            )}
          </div>
          <div className="flex-1 flex-col gap-2">
            <label className="text-sm">
              Buyer's number<span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={buyersnumber}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              onChange={(e) => {
                setbuyersnumber(e.target.value.replace(/[^0-9]/g, ""));
                validateField("buyersnumber", e.target.value);
              }}
              placeholder="Enter Buyer's number"
              className="bg-[#1a222c] px-2 py-1 rounded-lg placeholder:text-sm w-full border-[#3b4f68] border mt-2"
            />
            {errors.buyersnumber && (
              <p className="text-red-400 text-xs">{errors.buyersnumber}</p>
            )}
          </div>
          <div className="flex-1 flex-col gap-2">
            <label className="text-sm">Alternate number</label>
            <input
              type="text"
              value={alternatenumber}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              onChange={(e) => {
                setalternatenumber(e.target.value.replace(/[^0-9]/g, ""));
              }}
              placeholder="Enter Alternate number"
              className="bg-[#1a222c] px-2 py-1 rounded-lg placeholder:text-sm w-full border-[#3b4f68] border mt-2"
            />
          </div>
          <div className="flex-1 flex-col gap-2">
            <label className="text-sm">
              Email<span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setemail(e.target.value);
                validateField("email", e.target.value);
              }}
              placeholder="Enter buyer's email"
              className="bg-[#1a222c] px-2 py-1 rounded-lg placeholder:text-sm w-full border-[#3b4f68] border mt-2"
            />
            {errors.email && (
              <p className="text-red-400 text-xs">{errors.email}</p>
            )}
          </div>
          <div className="flex-1 flex-col gap-2">
            <label className="text-sm">Custom Order No.</label>
            <input
              type="text"
              value={orderno}
              onChange={(e) => {
                setorderno(e.target.value);
                validateField("orderno", e.target.value);
              }}
              placeholder="Custom Order No."
              className="bg-[#1a222c] px-2 py-1 rounded-lg placeholder:text-sm w-full border-[#3b4f68] border mt-2"
            />
            {errors.orderno && (
              <p className="text-red-400 text-xs">{errors.orderno}</p>
            )}
          </div>
        </div>
        <p className="text-sm mt-5">
          Where is the order being delivered to? (Buyer's Address)
        </p>

        <div className="pt-4 flex flex-col gap-5">
          <div className="flex gap-2 flex-wrap">
            <div className="flex-1 flex-col gap-2">
              <label className="text-sm">
                Complete Address<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => {
                  setaddress(e.target.value);
                  validateField("address", e.target.value);
                }}
                placeholder="House/Floor No, Building name or Street,Locality"
                className="bg-[#1a222c] px-2 py-1 rounded-lg placeholder:text-sm w-full min-w-60 border-[#3b4f68] border mt-2"
              />
              {errors.address && (
                <p className="text-red-400 text-xs">{errors.address}</p>
              )}
            </div>
            <div className="flex-1 flex-col gap-2">
              <label className="text-sm">
                Buyer's Pincode<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={pincode}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                onChange={(e) => {
                  const pin = e.target.value.replace(/[^0-9]/g, "");
                  setpincode(pin);
                  validateField("pincode", pin);
                  onChange({ pincode: pin });

                  if (pin.length === 6 && pin !== lastFetchedPin.current) {
                    lastFetchedPin.current = pin;
                    fetchPincodeDetails(pin);
                  }
                }}
                placeholder="Enter buyer's pincode"
                className="bg-[#1a222c] px-2 py-1 rounded-lg placeholder:text-sm w-full min-w-60 border-[#3b4f68] border mt-2"
              />
              {errors.pincode && (
                <p className="text-red-400 text-xs">{errors.pincode}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="flex-1 flex-col gap-2">
              <label className="text-sm">Landmark</label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => {
                  setlandmark(e.target.value);
                  validateField("landmark", e.target.value);
                }}
                placeholder="Any nearby post office"
                className="bg-[#1a222c] px-2 py-1 rounded-lg placeholder:text-sm w-full min-w-60 border-[#3b4f68] border mt-2"
              />
              {errors.landmark && (
                <p className="text-red-400 text-xs">{errors.landmark}</p>
              )}
            </div>
            <div className="flex-1 flex-col gap-2">
              <label className="text-sm">
                Buyer's City<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => {
                  setcity(e.target.value);
                  validateField("city", e.target.value);
                }}
                placeholder="Enter buyer's city"
                className="bg-[#1a222c] px-2 py-1 rounded-lg placeholder:text-sm w-full min-w-60 border-[#3b4f68] border mt-2"
              />
              {errors.city && (
                <p className="text-red-400 text-xs">{errors.city}</p>
              )}
            </div>
            {/* <div className="flex-1 flex-col gap-2">
              <label className="text-sm">
                Buyer's State<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => {
                  setstate(e.target.value);
                  validateField("state", e.target.value);
                }}
                placeholder="Enter buyer's State"
                className="bg-[#1a222c] px-2 py-1 rounded-lg placeholder:text-sm w-full min-w-60 border-[#3b4f68] border mt-2"
              />
              {errors.state && (
                <p className="text-red-400 text-xs">{errors.state}</p>
              )}
            </div> */}

            <div className="flex-1 flex-col gap-2 " ref={dropdownRef}>
              <label className="text-sm">
                State<span className="text-red-500 ml-1">*</span>
              </label>

              {/* Dropdown Button */}
              <div className="relative mt-2">
                <button
                  type="button"
                  onClick={() => setOpen(!open)}
                  className="bg-[#1a222c] px-2 py-1 rounded-lg placeholder:text-sm w-full border-[#3b4f68] border flex items-center justify-between text-left"
                >
                  <span className={state ? "text-white" : "text-gray-400"}>
                    {state || "Select State"}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      open ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m19 9-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {open && (
                  <div className="absolute top-full left-0 mt-1 z-10 bg-[#1a222c] border border-[#3b4f68] rounded-lg shadow-lg w-full max-h-60 overflow-y-auto">
                    <ul className="p-2 text-sm">
                      {states.map((item) => (
                        <li key={item}>
                          <button
                            type="button"
                            onClick={() => handleSelectState(item)}
                            className={`inline-flex items-center w-full p-2 hover:bg-[#2a3a4c] rounded text-left ${
                              state === item ? "bg-[#2a3a4c] text-blue-400" : ""
                            }`}
                          >
                            {item}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {errors.state && (
                <p className="text-red-400 text-xs mt-1">{errors.state}</p>
              )}

              {/* Display selected value (for testing) */}
              {state && (
                <p className="text-green-400 text-xs mt-2">Selected: {state}</p>
              )}
            </div>

            {/* <div className="flex-1 flex-col gap-2">
              <label className="text-sm">
                Buyer's Country<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => {
                  setcountry(e.target.value);
                  validateField("country", e.target.value);
                }}
                placeholder="Enter buyer's Country"
                className="bg-[#1a222c] px-2 py-1 rounded-lg placeholder:text-sm w-full min-w-60 border-[#3b4f68] border mt-2"
              />
              {errors.country && (
                <p className="text-red-400 text-xs">{errors.country}</p>
              )}
            </div> */}
          </div>
        </div>
      </form>
      <div className="border-b mt-10 border-[#38495e]"></div>
    </div>
  );
};

export default BuyersDetailsForm;
