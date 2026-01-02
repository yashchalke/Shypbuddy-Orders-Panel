"use client";
import React, { useState } from "react";
import Pickupform from "./(components)/Pickupform";
import BuyersDetailsForm from "./(components)/BuyersDetailsForm";
import ProductDetailsForm from "./(components)/ProductDetailsForm";
import PackageDetails from "./(components)/PackageDetails";
import LastForm from "./(components)/LastForm";
import toast from "react-hot-toast";

// Edited Part 

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

  const updateformdata = (section: ShipmentSection, data: any) => {
  setshipmentdata((prev) => ({
    ...prev,
    [section]:
      section === "product" ? data : { ...prev[section], ...data },
  }));
};

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();

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

    //

    
  return (
    <div className="p-4 md:p-10 font-poppins text-white">
      <div className="border h-full rounded-lg bg-[#24303f] border-[#2c3a4b]">
        <div className="h-18 border-b flex items-center px-6 border-[#38495e] ">
          <h1 className="text-xl font-semibold">Quick Shipment</h1>
        </div>
        <div className="p-6">
          <Pickupform
            onChange={(data: any) => updateformdata("pickup", data)}
          />
          <BuyersDetailsForm
            onChange={(data: any) => updateformdata("buyer", data)}
          />
          <ProductDetailsForm
            onChange={(data: any) => updateformdata("product", data)}
          />
          <PackageDetails
            onChange={(data: any) => updateformdata("package", data)}
          />
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
                  <h1 className="font-bold text-lg">Dangerous Goods</h1>
                  <p className="text-sm ">
                    Indicate whether the order contains any dangerous goods
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
                  <h1>₹ 0</h1>
                </div>
                <div className="flex gap-4 mt-4 justify-end">
                  <button 
                  type="submit"
                  
                  className="bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600">
                    save
                  </button>
                  <button className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600">
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
