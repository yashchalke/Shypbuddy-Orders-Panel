"use client"
import toast from "react-hot-toast";
import { useState } from "react";

type Props = {
  order: any;
  onDelete?: (orderId: number) => void; 
};

const OrderCard = ({ order, onDelete }: Props) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete order #${order.id}?`)) {
      return;
    }

    setIsDeleting(true);
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

  return (
    <div className="w-full bg-[#334458] rounded-lg grid grid-cols-9 gap-4 p-4 items-center text-sm">
      {/* Order ID */}
      <div className="col-span-1">
        <span className="text-white font-medium">#{order.id}</span>
      </div>

      {/* Buyer */}
      <div className="col-span-1">
        <span className="text-white">{order.buyer.name}</span>
      </div>

      {/* Payment Method */}
      <div className="col-span-1">
        <span className="text-white">{order.paymentMethod}</span>
      </div>

      {/* Dimensions */}
      <div className="col-span-1">
        <span className="text-white">
          {order.length}x{order.breadth}x{order.height}
        </span>
        <span className="text-gray-400 text-xs ml-1">
          ({order.applicableWeight}kg)
        </span>
      </div>

      {/* Delivery Address */}
      <div className="col-span-1">
        <span className="text-white">{order.address.city}</span>
        <span className="text-gray-400 text-xs ml-1">({order.address.tag})</span>
      </div>

      {/* RTO Address */}
      <div className="col-span-1">
        <span className="text-white">{order.rtoAddress.city}</span>
      </div>

      {/* Status */}
      <div className="col-span-1">
        <span className={`font-medium ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </div>

      {/* Date */}
      <div className="col-span-1">
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

      {/* Action Buttons */}
      <div className="col-span-1 flex gap-x-2">
        <button className="px-3 py-2 bg-purple-500 hover:bg-purple-600 transition-colors rounded-lg text-white text-xs font-medium">
          Ship
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="bg-red-400 px-3 py-2 rounded-lg cursor-pointer hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white text-xs font-medium"
        >
          {isDeleting ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          ) : (
            "X"
          )}
        </button>
      </div>
    </div>
  );
};

// Helper function for status colors
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

export default OrderCard;