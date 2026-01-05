"use client";
import React, { useState } from "react";
import Pickupform from "./(components)/Pickupform";
import BuyersDetailsForm from "./(components)/BuyersDetailsForm";
import ProductDetailsForm from "./(components)/ProductDetailsForm";
import PackageDetails from "./(components)/PackageDetails";
import LastForm from "./(components)/LastForm";
import toast from "react-hot-toast";
import { z } from "zod";

type ShipmentSection = "pickup" | "buyer" | "product" | "package";

type ShipmentData = {
  pickup: {
    addressId?: number;
    rtoAddressId?: number;
  };
  buyer: Record<string, any>;
  product: any[];
  package: Record<string, any>;
};

// type ValidationErrors = {
//   pickup: string[];
//   buyer: string[];
//   product: string[];
//   package: string[];
// };

const page = () => {
  const [dangerousGoods, setDangerousGoods] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<"PREPAID" | "COD">(
    "PREPAID"
  );
  const [shipmentdata, setshipmentdata] = useState<ShipmentData>({
    pickup: {},
    buyer: {},
    product: [],
    package: {},
  });
  // const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
  //   pickup: [],
  //   buyer: [],
  //   product: [],
  //   package: [],
  // });

  // const buyersSchema = z.object({
  //   buyersname: z.string().min(2, "Buyer's name must be at least 2 characters"),
  //   buyersnumber: z.string().regex(/^\d{10}$/, "Buyer's phone number must be 10 digits"),
  //   alternatenumber: z
  //     .string()
  //     .regex(/^\d{10}$/, "Alternate number must be 10 digits")
  //     .optional()
  //     .or(z.literal("")),
  //   email: z.string().email("Invalid buyer email address"),
  //   orderno: z.string().min(3, "Order number is too short"),
  //   address: z.string().min(5, "Buyer's address is too short"),
  //   pincode: z.string().regex(/^\d{6}$/, "Buyer's pincode must be 6 digits"),
  //   landmark: z.string().min(2, "Landmark is required"),
  //   city: z.string().min(2, "City is required"),
  //   state: z.string().min(2, "State is required"),
  //   country: z.string().min(2, "Country is required"),
  // });

  // const packageSchema = z.object({
  //   length: z
  //     .number()
  //     .gt(0.5, "Length must be greater than 0.5 cm")
  //     .refine((val) => val !== undefined && val !== null, {
  //       message: "Package length is required",
  //     }),
  //   breadth: z
  //     .number()
  //     .gt(0.5, "Breadth must be greater than 0.5 cm")
  //     .refine((val) => val !== undefined && val !== null, {
  //       message: "Package breadth is required",
  //     }),
  //   height: z
  //     .number()
  //     .gt(0.5, "Height must be greater than 0.5 cm")
  //     .refine((val) => val !== undefined && val !== null, {
  //       message: "Package height is required",
  //     }),
  //   weight: z
  //     .number()
  //     .positive("Weight must be positive")
  //     .refine((val) => val !== undefined && val !== null, {
  //       message: "Package weight is required",
  //     }),
  // });

  // const productSchema = z.object({
  //   name: z.string().min(2, "Product name is required"),
  //   category: z.string().min(2, "Product category is required"),
  //   sku: z.string().min(2, "Product SKU is required"),
  //   hsn: z.string().min(4, "HSN code is invalid"),
  //   quantity: z.string().regex(/^\d+$/, "Quantity must be a number"),
  //   price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Enter valid product price"),
  // });

  const updateformdata = (section: ShipmentSection, data: any) => {
    setshipmentdata((prev) => ({
      ...prev,
      [section]: section === "product" ? data : { ...prev[section], ...data },
    }));
    // Clear validation errors for this section when data is updated
    // setValidationErrors((prev) => ({
    //   ...prev,
    //   [section]: [],
    // }));
  };

  // Get all missing fields and validation errors
  // const getMissingFields = (): { errors: ValidationErrors; allErrors: string[] } => {
  //   const errors: ValidationErrors = {
  //     pickup: [],
  //     buyer: [],
  //     product: [],
  //     package: [],
  //   };
  //   const allErrors: string[] = [];

  //   // Validate pickup addresses
  //   if (!shipmentdata.pickup.addressId) {
  //     errors.pickup.push("Pickup address is required");
  //     allErrors.push("Pickup address is required");
  //   }
  //   if (!shipmentdata.pickup.rtoAddressId) {
  //     errors.pickup.push("RTO address is required");
  //     allErrors.push("RTO address is required");
  //   }

  //   // Validate buyer details
  //   if (Object.keys(shipmentdata.buyer).length === 0) {
  //     errors.buyer.push("Buyer details are required");
  //     allErrors.push("Buyer details are required");
  //   } else {
  //     try {
  //       buyersSchema.parse(shipmentdata.buyer);
  //     } catch (error) {
  //       if (error instanceof z.ZodError) {
  //         error.issues.forEach((err) => {
  //           errors.buyer.push(err.message);
  //           allErrors.push(err.message);
  //         });
  //       }
  //     }
  //   }

  //   // Validate products
  //   if (!shipmentdata.product || shipmentdata.product.length === 0) {
  //     errors.product.push("At least one product is required");
  //     allErrors.push("At least one product is required");
  //   } else {
  //     shipmentdata.product.forEach((product, index) => {
  //       try {
  //         productSchema.parse(product);
  //       } catch (error) {
  //         if (error instanceof z.ZodError) {
  //           error.issues.forEach((err) => {
  //             const errorMsg = `Product ${index + 1}: ${err.message}`;
  //             errors.product.push(errorMsg);
  //             allErrors.push(errorMsg);
  //           });
  //         }
  //       }
  //     });
  //   }

  //   // Validate package details
  //   if (Object.keys(shipmentdata.package).length === 0) {
  //     errors.package.push("Package dimensions are required");
  //     allErrors.push("Package dimensions are required");
  //   } else {
  //     try {
  //       packageSchema.parse(shipmentdata.package);
  //     } catch (error) {
  //       if (error instanceof z.ZodError) {
  //         error.issues.forEach((err) => {
  //           errors.package.push(err.message);
  //           allErrors.push(err.message);
  //         });
  //       }
  //     }
  //   }

  //   return { errors, allErrors };
  // };

  // // Show all errors as toasts
  // const showValidationErrors = (allErrors: string[]) => {
  //   // Show first 3 errors to avoid toast spam
  //   const errorsToShow = allErrors.slice(0, 3);
  //   errorsToShow.forEach((error, index) => {
  //     setTimeout(() => {
  //       toast.error(error);
  //     }, index * 300);
  //   });

  //   if (allErrors.length > 3) {
  //     setTimeout(() => {
  //       toast.error(`And ${allErrors.length - 3} more errors...`);
  //     }, 900);
  //   }
  // };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // const { errors, allErrors } = getMissingFields();

    // if (allErrors.length > 0) {
    //   setValidationErrors(errors);
    //   showValidationErrors(allErrors);
    //   return;
    // }

    const payload = {
      buyer: shipmentdata.buyer,
      addressId: shipmentdata.pickup.addressId,
      rtoAddressId: shipmentdata.pickup.rtoAddressId,
      shipment: shipmentdata.package,
      dangerousGoods,
      paymentMethod,
      products: shipmentdata.product,
    };

    console.log("FINAL PAYLOAD", payload);

    try {
      const res = await fetch("/api/orders/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Order failed");

      toast.success("Order Created Successfully");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  console.log(shipmentdata);

  const totalordervalue = shipmentdata.product.reduce(
    (sum, item) => sum + (item.total || 0),
    0
  );

  // Helper component to show section errors
  // const SectionErrors = ({ errors }: { errors: string[] }) => {
  //   if (errors.length === 0) return null;
  //   return (
  //     <div className="mt-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
  //       <ul className="text-red-400 text-sm space-y-1">
  //         {errors.map((error, index) => (
  //           <li key={index} className="flex items-start gap-2">
  //             <span className="text-red-500">•</span>
  //             {error}
  //           </li>
  //         ))}
  //       </ul>
  //     </div>
  //   );
  // };

  return (
    <div className="p-4 md:p-10 font-poppins text-white">
      <div className="border h-full rounded-lg bg-[#24303f] border-[#2c3a4b]">
        <div className="h-18 border-b flex items-center px-6 border-[#38495e] ">
          <h1 className="text-xl font-semibold">Quick Shipment</h1>
        </div>
        <div className="p-6">
          <div>
            <Pickupform
              onChange={(data: any) => updateformdata("pickup", data)}
            />
            {/* <SectionErrors errors={validationErrors.pickup} /> */}
          </div>

          <div>
            <BuyersDetailsForm
              onChange={(data: any) => updateformdata("buyer", data)}
            />
            {/* <SectionErrors errors={validationErrors.buyer} /> */}
          </div>

          <div>
            <ProductDetailsForm
              onChange={(data: any) => updateformdata("product", data)}
            />
            {/* <SectionErrors errors={validationErrors.product} /> */}
          </div>

          <div>
            <PackageDetails
              onChange={(data: any) => updateformdata("package", data)}
            />
            {/* <SectionErrors errors={validationErrors.package} /> */}
          </div>

          <div className="mt-6">
            <form>
              <div>
                <h1 className="font-bold text-lg">Dangerous Goods</h1>
                <p className="text-sm ">
                  Indicate whether the order contains any dangerous goods
                </p>
              </div>
              <div className="mt-4">
                <div className="flex gap-4">
                  <div className="flex gap-2">
                    <input
                      type="radio"
                      name="dangerous"
                      checked={dangerousGoods === true}
                      onChange={() => setDangerousGoods(true)}
                    />
                    <label>Yes</label>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="radio"
                      name="dangerous"
                      checked={dangerousGoods === false}
                      onChange={() => setDangerousGoods(false)}
                    />
                    <label>No</label>
                  </div>
                </div>
              </div>
            </form>
            <div className="border-b mt-10 border-[#38495e]"></div>

            <div className="mt-6">
              <form onSubmit={handleSave}>
                <div>
                  <h1 className="font-bold text-lg">Payment Method</h1>
                  <p className="text-sm ">
                    Select your preferred payment method
                  </p>
                </div>
                <div className="mt-4">
                  <div className="flex gap-4">
                    <div className="flex gap-2 items-center">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "PREPAID"}
                        onChange={() => setPaymentMethod("PREPAID")}
                      />
                      <label>Prepaid</label>
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "COD"}
                        onChange={() => setPaymentMethod("COD")}
                      />
                      <label>Cash On Delivery(COD)</label>
                    </div>
                  </div>
                </div>

                <div className="border w-full text-black p-3 bg-white rounded-lg mt-5 flex justify-between font-semibold">
                  <h1>Total Order Value</h1>
                  <h1>₹{totalordervalue.toFixed(2)}</h1>
                </div>
                <div className="flex gap-4 mt-4 justify-end">
                  <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 cursor-pointer px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;