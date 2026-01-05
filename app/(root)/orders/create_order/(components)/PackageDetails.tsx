"use client";
import React from "react";
import { useState, useEffect } from "react";
import { z } from "zod";

const numField = z
  .string()
  .refine((val) => !isNaN(Number(val)), "Must be a number")
  .refine((val) => Number(val) > 0.5, "Must be greater than 0.5");

const packageSchema = z.object({
  weight: numField,
  length: numField,
  breadth: numField,
  height: numField,
});

type FormProps = {
  onChange: (data: Record<string, any>) => void;
};

const PackageDetails = ({ onChange }: FormProps) => {
  const [length, setLength] = useState("");
  const [breadth, setBreadth] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setweight] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (key: string, value: string) => {
    const partial = packageSchema.pick({ [key]: true } as any);
    const result = partial.safeParse({ [key]: value });

    setErrors((prev) => {
      const updated = { ...prev };
      if (!result.success) updated[key] = result.error.issues[0].message;
      else delete updated[key];
      return updated;
    });
  };

  const isValid: boolean =
    Number(length) > 0.5 && Number(breadth) > 0.5 && Number(height) > 0.5;
  const volumetricWeight = isValid
    ? ((Number(length) * Number(breadth) * Number(height)) / 5000).toFixed(2)
    : null;

  const applicableWeight = Math.max(Number(weight), Number(volumetricWeight));

  const Packageform = {
    physicalWeight: Number(weight),
    length: Number(length),
    breadth: Number(breadth),
    height: Number(height),
    volumetricWeight,
    applicableWeight,
  };

  useEffect(() => {
    onChange(Packageform);
  }, [length, breadth, height, weight, volumetricWeight, applicableWeight]);

  return (
    <div className="mt-6">
      <form>
        <div>
          <h1 className="font-bold text-lg">Package Details</h1>
          <p className="text-sm ">How much weight does your package contain?</p>
        </div>

        <div className="flex justify-between flex-wrap">
          <div>
            <div className="flex-1 flex-col mt-2 ">
              <label className="text-sm">
                Physical Weight<span className="text-red-500 ml-1">*</span>
              </label>
              <div className="flex items-center mt-2">
                <h1 className="flex h-full px-2 py-2 rounded bg-white text-black">
                  Kg
                </h1>
                <input
                  type="text"
                  placeholder="0.00"
                  min={0}
                  value={weight}
                  onChange={(e) => {
                    setweight(e.target.value);
                    validateField("weight", e.target.value);
                  }}
                  className="bg-[#1a222c] px-2 py-2 rounded-lg placeholder:text-sm w-full min-w-60 border-[#3b4f68] border"
                />
              </div>
              {errors.weight && (
                <p className="text-red-400 text-xs px-12 py-1">
                  {errors.weight}
                </p>
              )}
            </div>
            <div className="m-4">
              <p className="text-xs">(Max 3 digits after the decimal place)</p>
              <p className="text-xs">
                Note: The minimum chargeable weight is 0.50 Kg
              </p>
            </div>
          </div>

          <div className="mt-2">
            <label className="text-sm">
              Enter package dimensions (L*B*H) to calculate volumetric weight
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              <div className="flex-1 items-center mt-2">
                <div className="flex">
                  <h1 className="px-2 py-2 rounded bg-white text-black">CM</h1>
                  <input
                    type="text"
                    placeholder="0.00"
                    value={length}
                    onChange={(e) => {
                      setLength(e.target.value);
                      validateField("length", e.target.value);
                    }}
                    className="bg-[#1a222c] px-2 py-2 rounded-lg placeholder:text-sm w-full min-w-60 border-[#3b4f68] border"
                  />
                </div>
                {errors.length && (
                  <p className="text-red-400 text-xs px-12 py-1">
                    {errors.length}
                  </p>
                )}
              </div>

              <div className="flex-1 items-center mt-2">
                <div className="flex">
                  <h1 className=" px-2 py-2 rounded bg-white text-black">CM</h1>
                  <input
                    type="text"
                    value={breadth}
                    placeholder="0.00"
                    onChange={(e) => {
                      setBreadth(e.target.value);
                      validateField("breadth", e.target.value);
                    }}
                    className="bg-[#1a222c] px-2 py-2 rounded-lg placeholder:text-sm w-full min-w-60 border-[#3b4f68] border"
                  />
                </div>
                {errors.breadth && (
                  <p className="text-red-400 text-xs px-12 py-1">
                    {errors.breadth}
                  </p>
                )}
              </div>

              <div className="flex-1 items-center mt-2">
                <div className="flex">
                  <h1 className=" px-2 py-2 rounded bg-white text-black">CM</h1>
                  <input
                    type="text"
                    placeholder="0.00"
                    value={height}
                    onChange={(e) => {
                      setHeight(e.target.value);
                      validateField("height", e.target.value);
                    }}
                    className="bg-[#1a222c] px-2 py-2 rounded-lg placeholder:text-sm w-full min-w-60 border-[#3b4f68] border"
                  />
                </div>
                {errors.height && (
                  <p className="text-red-400 text-xs px-12 py-1">
                    {errors.height}
                  </p>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs m-4">
                Note: Dimensions should be in centimeters only & values should
                be greater than 0.50 cm
              </p>
            </div>
          </div>
          {isValid && (
            <div className="flex w-full text-center gap-2 flex-wrap">
              <div className="p-2 bg-pink-200 text-black flex-1 rounded-lg w-full min-w-60">
                <h1>Volumetric Weight: {volumetricWeight} kg</h1>
              </div>
              <div className="p-2 bg-green-200 text-black flex-1 rounded-lg w-full min-w-60">
                <h1>Applicable Weight: {applicableWeight} kg</h1>
              </div>
            </div>
          )}
        </div>
      </form>
      <div className="border-b mt-10 border-[#38495e]"></div>
    </div>
  );
};

export default PackageDetails;
