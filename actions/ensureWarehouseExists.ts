"use server"
import { prisma } from "@/lib/prisma";

export async function ensureWarehouseExists(orderId: number) {
  if (!orderId) throw new Error("ORDER_ID_REQUIRED");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      buyer: true,
      address: true,
      products: { include: { product: true } },
    },
  });

  if (!order) throw new Error("ORDER_NOT_FOUND");

  if (!order.address.code) return;

  const payload = {
    name: order.address.code,
    address: order.address.address,
    city: order.address.city,
    state: order.address.state,
    pin: order.address.pincode,
    phone: order.address.phone,
    return_address: order.address.address,
    return_city: order.address.city,
    return_state: order.address.state,
    return_pin: order.address.pincode,
    return_phone: order.address.phone,
  };

  try {
    await fetch("https://staging-express.delhivery.com/api/backend/clientwarehouse/create/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Token ${process.env.DELHIVERY_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    console.log("Warehouse already exists");
  }

  return order;
}
