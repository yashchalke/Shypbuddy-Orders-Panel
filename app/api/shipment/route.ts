import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { createDelhiveryShipment } from "@/actions/createDelhiveryShipment";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    const body = await req.json();

    if (!body.addressId || !body.rtoAddressId)
      return NextResponse.json({ success: false, message: "Pickup & RTO required" }, { status: 400 });

    const orderId = await prisma.$transaction(async (tx) => {

      const pickup = await tx.address.findFirst({
        where: { id: body.addressId, userId: decoded.userId },
      });
      if (!pickup) throw new Error("INVALID_PICKUP");

      const buyer = await tx.buyer.create({
        data: { userId: decoded.userId, ...body.buyer },
      });

      const volumetricWeight =
        (body.shipment.length * body.shipment.breadth * body.shipment.height) / 5000;

      const applicableWeight = Math.max(body.shipment.physicalWeight, volumetricWeight);

      const order = await tx.order.create({
        data: {
          userId: decoded.userId,
          buyerId: buyer.id,
          addressId: pickup.id,
          rtoAddressId: body.rtoAddressId,
          physicalWeight: body.shipment.physicalWeight,
          length: body.shipment.length,
          breadth: body.shipment.breadth,
          height: body.shipment.height,
          volumetricWeight,
          applicableWeight,
          paymentMethod: body.paymentMethod,
          totalOrderValue: 0,
          status: "NEW",
        },
      });

      let total = 0;

      for (const p of body.products) {
        const price = p.unitPrice * p.quantity;
        total += price;

        let product = await tx.product.findFirst({
          where: { userId: decoded.userId, name: p.name },
        });

        if (!product) {
          product = await tx.product.create({
            data: {
              userId: decoded.userId,
              name: p.name,
              category: p.category,
              SKU: p.SKU,
              HSN: p.HSN,
              unitPrice: p.unitPrice,
            },
          });
        }

        await tx.orderProduct.create({
          data: {
            orderId: order.id,
            productId: product.id,
            quantity: p.quantity,
            unitPrice: p.unitPrice,
            totalPrice: price,
          },
        });
      }

      await tx.order.update({
        where: { id: order.id },
        data: { totalOrderValue: total },
      });

      return order.id;
    });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: true,
        address: true,
        products: { include: { product: true } },
      },
    });

    // const warehousePayload = {
    //   name: order!.address.code,
    //   address: order!.address.address,
    //   city: order!.address.city,
    //   state: order!.address.state,
    //   pin: order!.address.pincode,
    //   phone: order!.address.phone,
    // };

    // await fetch("https://staging-express.delhivery.com/api/backend/clientwarehouse/create/", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `Token ${process.env.DELHIVERY_API_KEY}`,
    //   },
    //   body: JSON.stringify(warehousePayload),
    // }); 

    // const formBody = new URLSearchParams();
    // formBody.append("format", "json");
    // formBody.append("data", JSON.stringify({
    //   shipments: [{
    //     name: order!.buyer.name,
    //     add: order!.buyer.address,
    //     pin: order!.buyer.pincode,
    //     city: order!.buyer.city,
    //     state: order!.buyer.state,
    //     phone: order!.buyer.phone,
    //     order: String(order!.id),
    //     payment_mode: order!.paymentMethod === "COD" ? "COD" : "Prepaid",
    //     products_desc: order!.products.map(p => p.product.name).join(", "),
    //     total_amount: order!.totalOrderValue,
    //     quantity: order!.products.reduce((s,p)=>s+p.quantity,0),
    //     seller_add: order!.address.code,
    //     seller_name: order!.address.tag,
    //     weight: order!.applicableWeight,
    //   },
    // ]
    // }));

    // const shipRes = await fetch("https://staging-express.delhivery.com/api/cmu/create.json", {
    //   method: "POST",
    //   headers: {
    //     Accept: "application/json",
    //     Authorization: `Token ${process.env.DELHIVERY_API_KEY}`,
    //     "Content-Type": "application/x-www-form-urlencoded",
    //   },
    //   body: formBody.toString(),
    // });

    // const shipData = await shipRes.json();
    // const waybill = shipData?.packages?.[0]?.waybill;

    // if (!waybill)
    //   return NextResponse.json({ success:false, message:"Shipment failed"},{status:400});

    // await prisma.order.update({
    //   where: { id: orderId },
    //   data: {
    //     awb_number: waybill,
    //     status: "READY_TO_SHIP",
    //     delhivery_partner: "delhivery",
    //   },
    // });

    const res = await createDelhiveryShipment(orderId);

    return NextResponse.json({
      success: true,
      message: "Order created & shipped successfully",
      awb: res.awb,
    });

  } catch (err:any) {
    console.error(err.message);
    return NextResponse.json({ success:false, message:err.message },{status:400});
  }
}
