"use client";
import React, { FormEvent, useState } from "react";
import toast from "react-hot-toast";

import { z } from "zod";

const AddressForm = () => {
  const [tag, settag] = useState("");
  const [phone, setphone] = useState("");
  const [address, setaddress] = useState("");
  const [landmark, setlandmark] = useState("");
  const [pincode, setpincode] = useState("");
  const [city, setcity] = useState("");
  const [state, setstate] = useState("");
  const [country, setcountry] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateSingleField = (key: string, value: string) => {
    const partial = AddressSchema.pick({ [key]: true } as any);
    const result = partial.safeParse({ [key]: value });

    setErrors((prev) => {
      const updated = { ...prev };

      if (!result.success) {
        updated[key] = result.error.issues[0].message;
      } else {
        delete updated[key];
      }

      return updated;
    });
  };

  const AddressSchema = z.object({
    tag: z.string().min(2, "Tag must be atleast 2 characters"),
    phone: z.string().regex(/^[0-9]{10}$/, "Phone must be exactly 10 digits"),
    address: z.string().min(5, "Address too short"),
    pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(1, "Please select state"),
    country: z.string().min(2, "Country is required"),
  });

  function ResetForm() {
    settag("");
    setphone("");
    setaddress("");
    setlandmark("");
    setpincode("");
    setcity("");
    setstate("");
    setcountry("");
  }

  const handlesubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = {
      tag,
      phone,
      address,
      landmark,
      pincode,
      city,
      state,
      country,
    };

    const result = AddressSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    try {
      const res = await fetch("/api/address/add-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Address Added Successfully");
        ResetForm();
      }
      else{
        toast.error(data.error[1]); 
      }
    } catch (err) {
      toast.error("Failed Adding new Address");
    }
  };

  return (
    <div>
      <form onSubmit={handlesubmit}>
        <h1>Tag and Contact Details</h1>
        <div className="flex flex-col gap-y-2 mt-4">
          <label>Tag<span className='text-red-500 ml-1'>*</span></label>
          <input
            type="text"
            value={tag}
            onChange={(e) => {
              settag(e.target.value);
              validateSingleField("tag", e.target.value);
            }}
            placeholder="a unique tag to remember, for ex- home, work"
            className="w-full p-2 border border-[#3b4f68] rounded-lg bg-[#1a222c] "
          />
          {errors.tag && <p className="text-red-400 text-xs">{errors.tag}</p>}
        </div>

        <div className="mt-5 flex gap-4 flex-wrap">
          <div className="flex-col gap-2 flex-1 md:flex-0">
            <label className="text-sm">Phone<span className='text-red-500 ml-1'>*</span></label>
            <input
              type="text"
              value={phone}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              onChange={(e) => {
                setphone(e.target.value.replace(/[^0-9]/g, ""));
                validateSingleField("phone", e.target.value);
              }}
              placeholder="Enter 10 digit number"
              className="bg-[#1a222c] p-2 rounded-lg placeholder:text-sm w-full min-w-60 border-[#3b4f68] border mt-2"
            />
            {errors.phone && (
              <p className="text-red-400 text-xs">{errors.phone}</p>
            )}
          </div>
          <div className="flex-1 flex-col gap-2">
            <label className="text-sm">Address<span className='text-red-500 ml-1'>*</span></label>
            <input
              type="text"
              value={address}
              onChange={(e) => {
                setaddress(e.target.value);
                validateSingleField("address", e.target.value);
              }}
              placeholder="House/Flat No, Block or Street, Locality"
              className="bg-[#1a222c] p-2 rounded-lg placeholder:text-sm w-full min-w-60 border-[#3b4f68] border mt-2"
            />
            {errors.address && (
              <p className="text-red-400 text-xs">{errors.address}</p>
            )}
          </div>
        </div>
        <h1 className="mt-4">Address Details</h1>
        <div>
          <div className="mt-4 grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-5">
            <div className="flex-1 flex-col gap-2">
              <label className="text-sm">Landmark</label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => {
                  setlandmark(e.target.value);
                }}
                placeholder="Enter a nearby landmark"
                className="bg-[#1a222c] p-2 rounded-lg placeholder:text-sm w-full border-[#3b4f68] border mt-2"
              />
            </div>
            <div className="flex-1 flex-col gap-2">
              <label className="text-sm">Pincode<span className='text-red-500 ml-1'>*</span></label>
              <input
                type="text"
                value={pincode}
                inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
                onChange={(e) => {
                  setpincode(e.target.value.replace(/[^0-9]/g, ""));
                  validateSingleField("pincode", e.target.value);
                }}
                placeholder="A valid 6 digit pincode"
                className="bg-[#1a222c] p-2 rounded-lg placeholder:text-sm w-full border-[#3b4f68] border mt-2"
              />
              {errors.pincode && (
                <p className="text-red-400 text-xs">{errors.pincode}</p>
              )}
            </div>
            <div className="flex-1 flex-col gap-2">
              <label className="text-sm">City<span className='text-red-500 ml-1'>*</span></label>
              <input
                type="text"
                value={city}
                onChange={(e) => {
                  setcity(e.target.value);
                  validateSingleField("city", e.target.value);
                }}
                placeholder="Enter City"
                className="bg-[#1a222c] p-2 rounded-lg placeholder:text-sm w-full border-[#3b4f68] border mt-2"
              />
              {errors.city && (
                <p className="text-red-400 text-xs">{errors.city}</p>
              )}
            </div>
            <div className="flex-1 flex-col gap-2">
              <label className="text-sm">State<span className='text-red-500 ml-1'>*</span></label>
              <input
                type="text"
                value={state}
                onChange={(e) => {
                  setstate(e.target.value);
                  validateSingleField("state", e.target.value);
                }}
                placeholder="Enter State"
                className="bg-[#1a222c] p-2 rounded-lg placeholder:text-sm w-full border-[#3b4f68] border mt-2"
              />
              {errors.state && (
                <p className="text-red-400 text-xs">{errors.state}</p>
              )}
            </div>
            <div className="flex-1 flex-col gap-2">
              <label className="text-sm">Country<span className='text-red-500 ml-1'>*</span></label>
              <input
                type="text"
                value={country}
                onChange={(e) => {
                  setcountry(e.target.value);
                  validateSingleField("country", e.target.value);
                }}
                placeholder="Enter Country"
                className="bg-[#1a222c] p-2 rounded-lg placeholder:text-sm w-full border-[#3b4f68] border mt-2"
              />
              {errors.country && (
                <p className="text-red-400 text-xs">{errors.country}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-x-2 mt-5">
          <button
            className="px-6 py-2 bg-blue-400 rounded"
            type="button"
            onClick={ResetForm}
          >
            Reset
          </button>
          <button className="px-6 py-2 bg-blue-400 rounded" type="submit">
            Verify and Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;
