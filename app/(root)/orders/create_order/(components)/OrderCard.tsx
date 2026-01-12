"use client";
import toast from "react-hot-toast";
import { useState } from "react";
import { useRouter } from "next/navigation";
import DeleteOrderDialog from "./DeleteOrderDialog";
import { cancelShipment } from "@/actions/CancelOrder";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { shipOrderFlow } from "@/actions/ship-order";

type Props = {
  order: any;
  onDelete?: (orderId: number) => void;
  onUpdate: (order: any) => void;
};

const OrderCard = ({ order, onDelete, onUpdate }: Props) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [shippingId, setShippingId] = useState<number | null>(null);
  const canShip = !order.awb_number && order.status === "NEW";

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/orders/delete-order?id=${order.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete order");
      }

      toast.success("Order deleted successfully");
      onDelete?.(order.id);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete order");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelOrder = async () => {
    const res = await cancelShipment(order.id);

    if (res.success != true) {
      toast.error(res.message);
      return;
    }
    onUpdate(res.order);
    toast.success(res.message);
  };

  const handleship = async (id: number) => {
    if (shippingId) return; 

    try {
      setShippingId(id);

      // const res = await fetch("/api/Ship_order", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ orderId: id }),
      // });

      const res = await shipOrderFlow(order.id,order.courier_ref);

      // const data = await res.json();

      // if (!res.ok) throw new Error(data.message || "Failed to create shipment");
      if (res.success != true) {
      toast.error(res.message);
      return;
    }
      toast.success(res.message || "Shipment Created Successfully");
      onUpdate(res.order);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setShippingId(null);
    }
  };

  return (
    <>
      {/* Old code */}
      <div className="hidden xl:grid w-full bg-[#334458] rounded-lg grid-cols-10 gap-4 p-4 items-center text-sm">
        <div className="col-span-1">
          <span>#{order.id}</span>
        </div>

        <div className="col-span-1">
          <span className="text-white font-medium">
            {order.awb_number ? `${order.awb_number}` : `Null`}
          </span>
        </div>

        <div className="col-span-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-white font-medium cursor-pointer underline decoration-dotted">
                package
                <br /> details
              </span>
            </TooltipTrigger>

            <TooltipContent className="bg-[#1f2b3a] border border-[#38495e] text-white p-3 rounded-lg shadow-lg">
              <div className="text-xs space-y-2 min-w-[180px]">
                {order.length}x{order.breadth}x{order.height}
                <span className="text-gray-400 text-xs ml-1">
                  ({order.applicableWeight}kg)
                </span>
                <p className="font-semibold text-sm mb-1">Products</p>
                {order.products.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between gap-4">
                    <span className="truncate max-w-[90px]">
                      {item.product.name}
                    </span>

                    <span>× {item.quantity}</span>
                    <span>₹{item.unitPrice}</span>
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="col-span-1">
          <span className="text-white">{order.buyer.name}</span>
        </div>

        <div className="col-span-1">
          <span className="text-white">{order.paymentMethod}</span>
        </div>

        <div className="col-span-1">
          <span>{order.delhivery_partner || "Delivery Partner not selected"}</span>
        </div>

        <div className="col-span-1">
          <span className="text-white">{order.address.city}</span>
          <span className="text-gray-400 text-xs ml-1">
            ({order.address.tag})
          </span>
        </div>

        <div className="col-span-1">
          <span className="text-white">{order.rtoAddress.city}</span>
        </div>

        <div className="col-span-1">
          <span className={`font-medium ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
          <span className="text-white block">
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
          <span className="text-gray-400 text-xs">
            {new Date(order.createdAt).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <div className="col-span-1 flex gap-x-2">
          {/* <button
            className={`px-3 py-2 rounded-lg text-white text-xs font-medium transition-colors
    ${
      canShip
        ? "bg-purple-500 hover:bg-purple-600"
        : "bg-gray-500 cursor-not-allowed opacity-60"
    }
  `}
            type="button"
            disabled={!canShip}
            onClick={() => handleship(order.id)}
          >
            Ship
          </button> */}

          <button
            className={`px-3 py-2 rounded-lg text-white text-xs font-medium transition-colors
    ${
      canShip && shippingId !== order.id
        ? "bg-purple-500 hover:bg-purple-600"
        : "bg-gray-500 cursor-not-allowed opacity-60"
    }
  `}
            type="button"
            disabled={!canShip || shippingId === order.id}
            onClick={() => handleship(order.id)}
          >
            {shippingId === order.id ? "Shipping..." : "Ship"}
          </button>

          <div className="relative">
            <button
              onClick={() =>
                setOpenMenu(openMenu === order.id ? null : order.id)
              }
              className="p-2 rounded hover:bg-[#2b394b]"
            >
              ⋮
            </button>

            {openMenu === order.id && (
              <div className="absolute right-0 mt-2 w-44 bg-[#1f2b3a] border border-[#38495e] rounded-lg shadow-lg z-50 overflow-hidden">
                {order.awb_number === null ? (
                  <>
                    <button
                      onClick={() => {
                        router.push(`/orders/create_order?orderId=${order.id}`);
                        setOpenMenu(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-[#2b394b]"
                    >
                      ✏️ Edit Order
                    </button>

                    <button
                      onClick={async () => {
                        setIsDeleting(true);
                        await handleDelete();
                        setOpenMenu(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#2b394b]"
                    >
                      🗑 Delete Order
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      handleCancelOrder();
                      setOpenMenu(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#2b394b]"
                  >
                    ❌ Cancel Order
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* medium */}
      <div className="hidden md:block xl:hidden w-full bg-[#334458] rounded-lg p-4 text-sm">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center justify-between col-span-2 lg:col-span-3 border-b border-[#4a5d73] pb-3">
            <div className="flex items-center gap-3">
              <span className="text-white font-bold text-lg">
                {" "}
                {order.awb_number
                  ? `AWB: ${order.awb_number}`
                  : `Order ID: ${order.id}`}
              </span>
              <span
                className={`font-medium px-2 py-1 rounded-full text-xs ${getStatusBgColor(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>
            <div className="text-right">
              <span className="text-white block text-sm">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <span className="text-gray-400 text-xs">
                {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-gray-400 text-xs">Buyer</span>
            <p className="text-white font-medium">{order.buyer.name}</p>
          </div>

          <div className="space-y-1">
            <span className="text-gray-400 text-xs">Payment</span>
            <p className="text-white">{order.paymentMethod}</p>
          </div>

          <div className="space-y-1">
            <span className="text-gray-400 text-xs">Delivery</span>
            <p className="text-white">
              {order.length}x{order.breadth}x{order.height}
              <span className="text-gray-400 text-xs ml-1">
                ({order.applicableWeight}kg)
              </span>
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-gray-400 text-xs">Delivery</span>
            <p className="text-white">
              {order.address.city}
              <span className="text-gray-400 text-xs ml-1">
                ({order.address.tag})
              </span>
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-gray-400 text-xs">RTO Address</span>
            <p className="text-white">{order.rtoAddress.city}</p>
          </div>

          <div className="space-y-1">
            <span className="text-gray-400 text-xs">Package Details</span>
            <button
              onClick={() => setShowProducts(!showProducts)}
              className="text-purple-400 underline decoration-dotted text-sm"
            >
              View Products
            </button>
          </div>

          {/* Products Dropdown */}
          {showProducts && (
            <div className="col-span-2 lg:col-span-3 bg-[#2a3a4a] rounded-lg p-3 mt-2">
              <p className="font-semibold text-sm mb-2 text-white">Products</p>
              {order.products.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex justify-between gap-4 text-xs text-gray-300 py-1"
                >
                  <span className="truncate">{item.product.name}</span>
                  <span>× {item.quantity}</span>
                  <span>₹{item.unitPrice}</span>
                </div>
              ))}
            </div>
          )}

          <div className="col-span-2 lg:col-span-3 flex gap-2 pt-3 border-t border-[#4a5d73] mt-2">
            <button
              className={`px-3 py-2 rounded-lg text-white text-xs font-medium transition-colors
    ${
      canShip
        ? "bg-purple-500 hover:bg-purple-600"
        : "bg-gray-500 cursor-not-allowed opacity-60"
    }
  `}
              type="button"
              disabled={!canShip}
              onClick={() => handleship(order.id)}
            >
              Ship
            </button>

            <div className="relative">
              <button
                onClick={() =>
                  setOpenMenu(openMenu === order.id ? null : order.id)
                }
                className="p-2 rounded hover:bg-[#2b394b]"
              >
                ⋮
              </button>

              {openMenu === order.id && (
                <div className="absolute right-0 mt-2 w-44 bg-[#1f2b3a] border border-[#38495e] rounded-lg shadow-lg z-50 overflow-hidden">
                  {order.awb_number === "" ? (
                    <>
                      <button
                        onClick={() => {
                          router.push(
                            `/orders/create_order?orderId=${order.id}`
                          );
                          setOpenMenu(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-[#2b394b]"
                      >
                        ✏️ Edit Order
                      </button>

                      <button
                        onClick={async () => {
                          setIsDeleting(true);
                          await handleDelete();
                          setOpenMenu(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#2b394b]"
                      >
                        🗑 Delete Order
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        handleCancelOrder();
                        setOpenMenu(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#2b394b]"
                    >
                      ❌ Cancel Order
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden w-full bg-[#334458] rounded-lg p-4 text-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-lg">
              {" "}
              {order.awb_number
                ? `AWB: ${order.awb_number}`
                : `Order ID: ${order.id}`}
            </span>
            <span
              className={`font-medium px-2 py-1 rounded-full text-xs ${getStatusBgColor(
                order.status
              )}`}
            >
              {order.status}
            </span>
          </div>
          <div className="text-right">
            <span className="text-white block text-xs">
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
              })}
            </span>
            <span className="text-gray-400 text-xs">
              {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        <div className="space-y-3 border-t border-[#4a5d73] pt-3">
          <div className="flex justify-between">
            <span className="text-gray-400 text-xs">Buyer</span>
            <span className="text-white font-medium">{order.buyer.name}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400 text-xs">Payment</span>
            <span className="text-white">{order.paymentMethod}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400 text-xs">Dimensions</span>
            <span className="text-white">
              {order.length}x{order.breadth}x{order.height}
              <span className="text-gray-400 text-xs ml-1">
                ({order.applicableWeight}kg)
              </span>
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400 text-xs">Delivery</span>
            <span className="text-white text-right">
              {order.address.city}
              <span className="text-gray-400 text-xs ml-1">
                ({order.address.tag})
              </span>
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400 text-xs">RTO</span>
            <span className="text-white">{order.rtoAddress.city}</span>
          </div>

          <div className="border-t border-[#4a5d73] pt-3">
            <button
              onClick={() => setShowProducts(!showProducts)}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-gray-400 text-xs">Package Details</span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  showProducts ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showProducts && (
              <div className="bg-[#2a3a4a] rounded-lg p-3 mt-2">
                {order.products.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between gap-2 text-xs text-gray-300 py-1"
                  >
                    <span className="truncate flex-1">{item.product.name}</span>
                    <span>× {item.quantity}</span>
                    <span>₹{item.unitPrice}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-4 mt-3 border-t border-[#4a5d73]">
          <button
            className={`px-3 py-2 rounded-lg text-white text-xs font-medium transition-colors
    ${
      canShip
        ? "bg-purple-500 hover:bg-purple-600"
        : "bg-gray-500 cursor-not-allowed opacity-60"
    }
  `}
            type="button"
            disabled={!canShip}
            onClick={() => handleship(order.id)}
          >
            Ship
          </button>
          <div className="relative">
            <button
              onClick={() =>
                setOpenMenu(openMenu === order.id ? null : order.id)
              }
              className="p-2 rounded hover:bg-[#2b394b]"
            >
              ⋮
            </button>

            {openMenu === order.id && (
              <div className="absolute right-0 mt-2 w-44 bg-[#1f2b3a] border border-[#38495e] rounded-lg shadow-lg z-50 overflow-hidden">
                {order.awb_number === "" ? (
                  <>
                    <button
                      onClick={() => {
                        router.push(`/orders/create_order?orderId=${order.id}`);
                        setOpenMenu(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-[#2b394b]"
                    >
                      ✏️ Edit Order
                    </button>

                    <button
                      onClick={async () => {
                        setIsDeleting(true);
                        await handleDelete();
                        setOpenMenu(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#2b394b]"
                    >
                      🗑 Delete Order
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      handleCancelOrder();
                      setOpenMenu(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#2b394b]"
                  >
                    ❌ Cancel Order
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "text-yellow-400";
    case "shipped":
      return "text-blue-400";
    case "delivered":
      return "text-green-400";
    case "cancelled":
      return "text-red-400";
    case "processing":
      return "text-orange-400";
    default:
      return "text-yellow-400";
  }
};

const getStatusBgColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-500/20 text-yellow-400";
    case "shipped":
      return "bg-blue-500/20 text-blue-400";
    case "delivered":
      return "bg-green-500/20 text-green-400";
    case "cancelled":
      return "bg-red-500/20 text-red-400";
    case "processing":
      return "bg-orange-500/20 text-orange-400";
    default:
      return "bg-yellow-500/20 text-yellow-400";
  }
};

export default OrderCard;
