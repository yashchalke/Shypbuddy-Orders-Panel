"use client";
import { redirect, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
// import Pickupform from "./(components)/Pickupform";
import Pickupform_updated from "./(components)/Pickupform_updated";
import BuyersDetailsForm from "./(components)/BuyersDetailsForm";
import ProductDetailsForm from "./(components)/ProductDetailsForm";
import PackageDetails from "./(components)/PackageDetails";
import LastForm from "./(components)/LastForm";
import toast from "react-hot-toast";
import { z } from "zod";
import { useSearchParams } from "next/navigation";

type ShipmentSection = "pickup" | "buyer" | "product" | "package";

type ShipmentData = {
  pickup: {
    addressId: number | null;
    rtoAddressId: number | null;
  };
  buyer: Record<string, any>;
  product: any[];
  package: Record<string, any>;
};

const page = () => {
  const router = useRouter();
  const [dangerousGoods, setDangerousGoods] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<"PREPAID" | "COD">(
    "PREPAID"
  );
  const [isShipping, setIsShipping] = useState(false);

  const [shipmentdata, setshipmentdata] = useState<ShipmentData>({
    pickup: {
      addressId: null,
      rtoAddressId: null,
    },
    buyer: {},
    product: [],
    package: {},
  });
  const searchParams = useSearchParams();
  const editOrderId = searchParams.get("orderId");
  const isEditMode = Boolean(editOrderId);
  const updateformdata = (section: ShipmentSection, data: any) => {
    setshipmentdata((prev) => ({
      ...prev,
      [section]: section === "product" ? data : { ...prev[section], ...data },
    }));
  };

  const fetchOrderById = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/fetch-order?id=${orderId}`, {
        cache: "no-store",
      });

      const json = await res.json();

      const order =
        json?.orders && Array.isArray(json.orders) ? json.orders[0] : null;

      if (!order) {
        console.error("Order not found in response", json);
        return;
      }

      setshipmentdata({
        pickup: {
          addressId: order.addressId,
          rtoAddressId: order.rtoAddressId,
        },

        buyer: {
          name: order.buyer.name,
          phone: order.buyer.phone,
          alternateNumber: order.buyer.alternateNumber || "",
          email: order.buyer.email,
          // orderno: order.orderNo || "",
          address: order.buyer.address,
          pincode: order.buyer.pincode,
          landmark: order.buyer.landmark,
          city: order.buyer.city,
          state: order.buyer.state,
        },

        package: {
          physicalWeight: order.physicalWeight,
          length: order.length,
          breadth: order.breadth,
          height: order.height,
        },

        product: order.products.map((p: any) => ({
          name: p.product.name,
          category: p.product.category,
          SKU: p.product.SKU,
          HSN: p.product.HSN,
          unitPrice: p.unitPrice,
          quantity: p.quantity,
        })),
      });
    } catch (err) {
      console.error("Failed to load order for edit:", err);
    }
  };

  useEffect(() => {
    if (editOrderId) {
      fetchOrderById(editOrderId);
    }
  }, [editOrderId]);

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

    try {
      const res = await fetch(
        isEditMode
          ? `/api/orders/update-order?id=${editOrderId}`
          : "/api/orders/create-order",
        {
          method: isEditMode ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Order failed");

      toast.success(
        isEditMode ? "Order Updated Successfully" : "Order Created Successfully"
      );

      setTimeout(() => {
        redirect("/orders");
      }, 400);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleShip = async () => {
    if (isShipping) return;

    const payload = {
      addressId: shipmentdata.pickup.addressId,
      rtoAddressId: shipmentdata.pickup.rtoAddressId,
      buyer: shipmentdata.buyer,
      shipment: shipmentdata.package,
      products: shipmentdata.product,
      dangerousGoods,
      paymentMethod,
    };
    try {
      setIsShipping(true);
      const res = await fetch("/api/shipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || "Order Saved but failed to ship");
        router.push("/orders");
        return;
      }

      toast.success("Shipment created successfully!");
      router.push("/orders");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
      router.push("/orders");
    }
  };

  const totalordervalue = shipmentdata.product.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  return (
    <div className="p-4 md:p-10 font-poppins text-white">
      <div className="border h-full rounded-lg bg-[#24303f] border-[#2c3a4b]">
        <div className="h-18 border-b flex items-center px-6 border-[#38495e] ">
          <h1 className="text-xl font-semibold">
            {isEditMode ? "Edit Order" : "Quick Shipment"}
          </h1>
        </div>
        <div className="p-6">
          <div>
            <Pickupform_updated
              value={shipmentdata.pickup}
              onChange={(data: any) => updateformdata("pickup", data)}
            />
            {/* <SectionErrors errors={validationErrors.pickup} /> */}
          </div>

          <div>
            <BuyersDetailsForm
              value={shipmentdata.buyer}
              onChange={(data: any) => updateformdata("buyer", data)}
            />
            {/* <SectionErrors errors={validationErrors.buyer} /> */}
          </div>

          <div>
            <ProductDetailsForm
              value={shipmentdata.product}
              onChange={(data: any) => updateformdata("product", data)}
            />
            {/* <SectionErrors errors={validationErrors.product} /> */}
          </div>

          <div>
            <PackageDetails
              value={shipmentdata.package}
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
                  {!isEditMode && (
                    <button
                      type="button"
                      disabled={isShipping}
                      className={`px-4 py-2 rounded-lg transition-colors
    ${
      isShipping
        ? "bg-gray-500 cursor-not-allowed opacity-60"
        : "bg-purple-500 hover:bg-purple-600"
    }
  `}
                      onClick={handleShip}
                    >
                      {isShipping ? "Shipping..." : "Ship"}
                    </button>
                  )}

                  <button
                    type="submit"
                    className="bg-green-500 px-4 py-2 rounded-lg"
                  >
                    {isEditMode ? "Update Order" : "Save Order"}
                  </button>
                  <button
                    type="button"
                    className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600"
                    onClick={() => router.push("/orders")}
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
