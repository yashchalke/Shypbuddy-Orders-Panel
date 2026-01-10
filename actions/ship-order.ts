"use server"
import { ensureWarehouseExists } from "./ensureWarehouseExists";
import { createDelhiveryShipment } from "./createDelhiveryShipment";

type ShipOrderResponse = {
  success: boolean;
  message: string;
  order?: {
    id: number;
    awb_number: string;
    status: string;
  };
};


export async function shipOrderFlow(orderId: number) {
  if (!orderId) throw new Error("ORDER_ID_REQUIRED");

  await ensureWarehouseExists(orderId);

  const shipment = await createDelhiveryShipment(orderId);

  return {
    success: true,
    message: "Shipment created successfully",
    order: {
      id: orderId,
      awb_number:shipment.awb,
      status: "READY_TO_SHIP",
      delhivery_partner:"delhivery"
    }
}
}