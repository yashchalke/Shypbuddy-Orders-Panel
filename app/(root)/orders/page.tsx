"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import OrderCard from "@/app/(root)/orders/create_order/(components)/OrderCard";
import { Filter, Search } from "lucide-react";
import ReactPaginate from "react-paginate";
import { useRouter, useSearchParams } from "next/navigation";
import DateRangePicker from "./create_order/(components)/DateRangePicker";

const Page = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>("desc");
  const [showFilter, setShowFilter] = useState(false);
  const [orderid, setOrderId] = useState<string>("");
  const [totalPages, setTotalPages] = useState(1);
  const [dateRange, setDateRange] = useState<{
    from: string | null;
    to: string | null;
  }>({
    from: null,
    to: null,
  });

  const router = useRouter();
  const searchParams = useSearchParams();

  const initialPage = Number(searchParams.get("page") || 1);
  const [page, setPage] = useState(initialPage);

  const fetchOrders = async (
    orderid: string = "",
    range = dateRange,
    pageNumber = page
  ) => {
    try {
      const params = new URLSearchParams();

      if (orderid.trim()) params.set("id", orderid);
      params.set("page", String(pageNumber));

      if (range.from) params.set("from", range.from);
      if (range.to) params.set("to", range.to);

      const res = await fetch(`/api/orders/fetch-order?${params.toString()}`, {
        cache: "no-store",
      });

      const data = await res.json();
      setOrders(data.orders || []);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOrder = (orderId: number) => {
    setOrders((prevOrders) =>
      prevOrders.filter((order) => order.id !== orderId)
    );
  };

  const sortedOrders = React.useMemo(() => {
    if (!sortOrder) return orders;

    return [...orders].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
  }, [orders, sortOrder]);

  useEffect(() => {
    const params = new URLSearchParams();

    params.set("page", String(page));
    if (dateRange.from) params.set("from", dateRange.from);
    if (dateRange.to) params.set("to", dateRange.to);
    if (orderid) params.set("id", orderid);

    router.replace(`?${params.toString()}`, { scroll: false });
    fetchOrders(orderid, dateRange, page);
  }, [page, orderid, dateRange.from, dateRange.to]);

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
        <DateRangePicker
          onApply={(range) => {
            setPage(1);
            setDateRange(range);
            fetchOrders(orderid, range, 1); // 🔥 immediate fetch
          }}
        />

        <button
          onClick={() => setShowFilter((p) => !p)}
          className="bg-white text-black px-4 py-2 rounded-lg flex items-center gap-x-2 h-15"
        >
          <Filter size={15} />
          <span>Filter</span>
        </button>

        {showFilter && (
          <div className="absolute top-12 right-0 w-52 bg-[#1f2b3a] text-white rounded-lg shadow-lg border border-[#38495e] overflow-hidden z-10">
            <label className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-[#2b394b]">
              <input
                type="checkbox"
                checked={sortOrder === "asc"}
                onChange={() =>
                  setSortOrder((prev) => (prev === "asc" ? null : "asc"))
                }
              />
              <span>Date Ascending</span>
            </label>

            <label className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-[#2b394b]">
              <input
                type="checkbox"
                checked={sortOrder === "desc"}
                onChange={() =>
                  setSortOrder((prev) => (prev === "desc" ? null : "desc"))
                }
              />
              <span>Date Descending</span>
            </label>
            <div className="p-3 border-t border-[#38495e]">
              <p className="text-xs text-gray-400 mb-2">Filter by date</p>
            </div>
          </div>
        )}
      </div>

      {/* Header Row */}
      <div className="w-full bg-blue-600 text-white rounded-lg grid grid-cols-10 gap-4 p-4 items-center text-sm mt-4 font-medium">
        <div className="col-span-1">Order ID</div>
        <div className="col-span-1">Products</div>
        <div className="col-span-1">Buyer</div>
        <div className="col-span-1">Payment</div>
        <div className="col-span-1">Dimensions</div>
        <div className="col-span-1">Pickup</div>
        <div className="col-span-1">RTO</div>
        <div className="col-span-1">Status</div>
        <div className="col-span-1">Date</div>
        <div className="col-span-1">Action</div>
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
};

export default Page;
