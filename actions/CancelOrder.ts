"use server";

import { prisma } from "@/lib/prisma";

export async function cancelShipment(orderId: number) {
  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order || !order.awb_number) {
      return { success: false, message: "Shipment not found" };
    }

    const res = await fetch("https://staging-express.delhivery.com/api/p/edit", {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Token ${process.env.DELHIVERY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        waybill: order.awb_number,
        cancellation: "true",
      }),
    });

    const data = await res.json();

    if (data?.status !== true) {
      return { success: false, message: data?.message || "Courier rejected cancellation" };
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { awb_number:null,delhivery_partner:null ,status: "NEW" },
    });

    return { success: true, message:"Shipment Cancelled Successfully", order: updated };
  } catch (err) {
    console.error("Cancel Shipment Error:", err);
    return { success: false, message: "Cancellation failed" };
  }
}
