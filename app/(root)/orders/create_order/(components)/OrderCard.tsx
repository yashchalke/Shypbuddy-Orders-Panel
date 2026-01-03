// components/OrderCard.tsx
type Props = {
  order: any;
};

const OrderCard = ({ order }: Props) => {
  return (
    <div className="w-full bg-[#334458] rounded-lg grid grid-cols-9 gap-4 p-4 items-center text-sm">
      {/* Order ID */}
      <div className="col-span-1">
        <span className="text-gray-400 text-xs block mb-1">Order ID</span>
        <span className="text-white font-medium">#{order.id}</span>
      </div>

      {/* Products */}
      {/* <div className="col-span-1">
        <span className="text-gray-400 text-xs block mb-1">Products</span>
        <span className="text-white truncate block" title={order.products.map((p: any) => p.product.name).join(", ")}>
          {order.products.map((p: any) => p.product.name).join(", ")}
        </span>
      </div> */}

      {/* Buyer */}
      <div className="col-span-1">
        <span className="text-gray-400 text-xs block mb-1">Buyer</span>
        <span className="text-white">{order.buyer.name}</span>
      </div>

      {/* Payment Method */}
      <div className="col-span-1">
        <span className="text-gray-400 text-xs block mb-1">Payment</span>
        <span className="text-white">{order.paymentMethod}</span>
      </div>

      {/* Dimensions */}
      <div className="col-span-1">
        <span className="text-gray-400 text-xs block mb-1">Dimensions</span>
        <span className="text-white">
          {order.length}x{order.breadth}x{order.height}
        </span>
        <span className="text-gray-400 text-xs ml-1">({order.applicableWeight}kg)</span>
      </div>

      {/* Delivery Address */}
      <div className="col-span-1">
        <span className="text-gray-400 text-xs block mb-1">Delivery</span>
        <span className="text-white">{order.address.city}</span>
        <span className="text-gray-400 text-xs ml-1">({order.address.tag})</span>
      </div>

      {/* RTO Address */}
      <div className="col-span-1">
        <span className="text-gray-400 text-xs block mb-1">RTO</span>
        <span className="text-white">{order.rtoAddress.city}</span>
      </div>

      {/* Status */}
      <div className="col-span-1">
        <span className="text-gray-400 text-xs block mb-1">Status</span>
        <span className={`font-medium ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </div>

      <div className="col-span-1">
  <span className="text-gray-400 text-xs block mb-1">Date</span>
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

      {/* Action Button */}
      <div className="col-span-1 flex ">
        <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 transition-colors rounded-lg text-white font-medium">
          Ship
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