"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import OrderCard from "@/app/(root)/orders/create_order/(components)/OrderCard";
import { Search } from "lucide-react";
import ReactPaginate from "react-paginate";
import { useRouter, useSearchParams } from "next/navigation";
import FilterSidebar from "./create_order/(components)/FilterSidebar";

export default function Page() {
  const [orders, setOrders] = useState<any[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>("desc");
  const [orderid, setOrderId] = useState("");
  const [totalPages, setTotalPages] = useState(1);

  const handleOrderUpdate = (updatedOrder:any) => {
  setOrders(prev =>
    prev.map(order =>
      order.id === updatedOrder.id
        ? { ...order, ...updatedOrder }
        : order
    )
  );
};

  const handleDeleteOrder = (orderId: number) => {
    setOrders((prevOrders) =>
      prevOrders.filter((order) => order.id !== orderId)
    );
  };

  const [paymentType, setPaymentType] = useState({
    prepaid: false,
    cod: false,
  });
  const [filters, setFilters] = useState({ tag: "", hsn: "", sku: "" });

  const [draftPaymentType, setDraftPaymentType] = useState(paymentType);
  const [draftFilters, setDraftFilters] = useState(filters);

  const [dateRange, setDateRange] = useState<{
    from: string | null;
    to: string | null;
  }>({
    from: null,
    to: null,
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(Number(searchParams.get("page") || 1));

  const fetchOrders = async (
    orderid = "",
    activeFilters = filters,
    range = dateRange,
    pageNumber = page,
    activePayment = paymentType
  ) => {
    const params = new URLSearchParams();
    if (orderid) params.set("id", orderid);
    params.set("page", String(pageNumber));
    if (range.from) params.set("from", range.from);
    if (range.to) params.set("to", range.to);

    if (activePayment.prepaid && !activePayment.cod)
      params.set("payment", "prepaid");
    if (!activePayment.prepaid && activePayment.cod)
      params.set("payment", "cod");

    if (activeFilters.tag) params.set("tag", activeFilters.tag);
    if (activeFilters.hsn) params.set("hsn", activeFilters.hsn);
    if (activeFilters.sku) params.set("sku", activeFilters.sku);

    const res = await fetch(`/api/orders/fetch-order?${params.toString()}`, {
      cache: "no-store",
    });
    const data = await res.json();
    setOrders(data.orders || []);
    setTotalPages(data?.pagination?.totalPages || 1);
  };

  useEffect(() => {
    fetchOrders(orderid, filters, dateRange, page, paymentType);
  }, [page, orderid, filters, dateRange.from, dateRange.to, paymentType]);

  const sortedOrders = useMemo(() => {
    if (!sortOrder) return orders;
    return [...orders].sort((a, b) =>
      sortOrder === "asc"
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [orders, sortOrder]);

  return (
    <div className="font-poppins text-white p-4">
      <h1>Orders Page</h1>
      <div className="mt-6">
        <Link
          href={"/orders/create_order"}
          className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
        >
          + New Order
        </Link>
      </div>
      <div className="mt-5 flex justify-center">
        <div className="relative w-full">
          <input
            placeholder="Enter Order no."
            value={orderid}
            onChange={(e) => setOrderId(e.target.value)}
            className="w-full border py-2 pl-3 pr-10 rounded-lg bg-[#2b394b] border-[#3b4f68] focus:outline-none"
          />

          <Search
            size={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      <div className="mt-4 w-full flex justify-end relative gap-x-4">
        <FilterSidebar
          draftFilters={draftFilters}
          setDraftFilters={setDraftFilters}
          draftPaymentType={draftPaymentType}
          setDraftPaymentType={setDraftPaymentType}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          onApply={(range) => {
            setFilters(draftFilters); 
            setPaymentType(draftPaymentType); 
            setPage(1);
            setDateRange(range);
            fetchOrders(orderid, draftFilters, range, 1);
          }}
        />
      </div>

      {/* Header Row */}
      <div className="hidden lg:grid w-full bg-blue-600 text-white rounded-lg  grid-cols-10 gap-4 p-4 items-center text-sm mt-4 font-medium">
        <div className="col-span-1">Order ID</div>
        <div className="col-span-1">AWB</div>
        <div className="col-span-1">Products</div>
        <div className="col-span-1">Buyer</div>
        <div className="col-span-1">Payment</div>
        <div className="col-span-1">Shipment Detials</div>
        <div className="col-span-1">Pickup</div>
        <div className="col-span-1">RTO</div>
        <div className="col-span-1">Status</div>
        <div className="col-span-1">Action</div>
      </div>
      <div className="lg:hidden w-full bg-blue-600 text-white rounded-lg  grid-cols-10 gap-4 p-4 items-center text-sm mt-4 font-medium">
        <h1>Orders</h1>
      </div>

      {/* Orders List */}
      <div className="mt-4">
        {orders.length > 0 ? (
          <div className="flex flex-col gap-y-4">
            {sortedOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onDelete={handleDeleteOrder}
                onUpdate={handleOrderUpdate}
              />
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-center py-8 bg-[#334458] rounded-lg">
            No orders found
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <ReactPaginate
            pageCount={totalPages}
            forcePage={page - 1}
            onPageChange={(e) => setPage(e.selected + 1)}
            containerClassName="flex justify-center mt-8 gap-2"
            pageClassName="px-3 py-1 bg-gray-700 rounded cursor-pointer"
            activeClassName="bg-blue-600"
            previousLabel="Previous"
            nextLabel="Next"
            previousClassName="px-3 py-1 bg-gray-700 rounded"
            nextClassName="px-3 py-1 bg-gray-700 rounded"
            disabledClassName="opacity-40"
            breakLabel="..."
          />
        )}
      </div>
    </div>
  );
}
