"use server";

import { prisma } from "@/lib/prisma";
import { ensureWarehouseExists } from "./ensureWarehouseExists";

export async function createDelhiveryShipment(orderId: number,courier_ref:number) {
  if (!orderId) throw new Error("ORDER_ID_REQUIRED");

  const order = await ensureWarehouseExists(orderId);

  const payload = {
    shipments: [
      {
        name: order!.buyer.name,
        add: order!.buyer.address,
        pin: order!.buyer.pincode,
        city: order!.buyer.city,
        state: order!.buyer.state,
        country: "India",
        phone: order!.buyer.phone,

        order: String(order!.courier_ref ?? order!.id),
        payment_mode: order!.paymentMethod === "COD" ? "COD" : "Prepaid",

        return_pin: order!.rtoAddress.pincode,
        return_city: order!.rtoAddress.city,
        return_phone: order!.rtoAddress.phone,
        return_add: order!.rtoAddress.address,
        return_state: order!.rtoAddress.state,
        return_country: "India",

        products_desc: order!.products.map(p => p.product.name).join(", "),
        cod_amount: order!.paymentMethod === "COD" ? order!.totalOrderValue : 0,
        order_date: new Date().toISOString().split("T")[0],

        total_amount: order!.totalOrderValue,
        quantity: order!.products.reduce((s, p) => s + p.quantity, 0),

        seller_add: order!.address.code,
        seller_name: order!.address.tag,
        seller_inv: String(order!.id),
        seller_inv_date: new Date().toISOString().split("T")[0],

        shipment_width: order!.breadth,
        shipment_height: order!.height,
        shipment_length: order!.length,
        weight: Math.ceil(Number(order!.applicableWeight) * 1000),
      },
    ],
    pickup_location: { name: order!.address.code },
  };

  console.log(payload);

  const body = new URLSearchParams();
  body.append("format", "json");
  body.append("data", JSON.stringify(payload));

  const res = await fetch(
    "https://staging-express.delhivery.com/api/cmu/create.json",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Token ${process.env.DELHIVERY_API_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    }
  );

  const raw = await res.text();
  let data: any;

  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("INVALID_COURIER_RESPONSE");
  }

  if (data?.success === false || data?.packages?.[0]?.status === "Fail") {
    const reason =
      data?.packages?.[0]?.remarks?.[0] ||
      data?.rmk ||
      "Shipment rejected by courier";
    throw new Error(reason);
  }

  const waybill = data?.packages?.[0]?.waybill;
  if (!waybill) throw new Error("WAYBILL_NOT_GENERATED");

  await prisma.order.update({
    where: { id: orderId },
    data: {
      awb_number: waybill,
      status: "READY_TO_SHIP",
      delhivery_partner: "delhivery",
    },
  });

  return {
    success: true,
    orderId,
    awb: waybill,
    status: "READY_TO_SHIP",
  };
}
