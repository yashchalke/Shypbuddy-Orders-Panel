type Props = {
  order: any;
};

const OrderCard = ({ order }: Props) => {
  return (
    <div className="w-full bg-[#334458] rounded-lg flex justify-between p-4 items-center text-sm">
      <h1>#{order.id}</h1>

      <h1>
        {order.products.map((p: any) => p.product.name).join(", ")}
      </h1>

      <h1>{order.buyer.name}</h1>

      <h1>{order.paymentMethod}</h1>

      <h1>
        {order.length}x{order.breadth}x{order.height} – {order.applicableWeight}kg
      </h1>

      <h1>{order.address.city}({order.address.tag})</h1>
      <h1>{order.rtoAddress.city}</h1>

      <h1 className="text-yellow-400">{order.status}</h1>

      <button className="px-4 py-2 bg-purple-500 rounded-lg">
        Ship
      </button>
    </div>
  );
};

export default OrderCard