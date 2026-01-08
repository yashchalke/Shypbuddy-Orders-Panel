import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
    };
    const body = await req.json();

    /* ---------------- VALIDATIONS ---------------- */

    if (!body.addressId)
      return NextResponse.json(
        { success: false, message: "Pickup address is required" },
        { status: 400 }
      );

    if (!body.rtoAddressId)
      return NextResponse.json(
        { success: false, message: "RTO address is required" },
        { status: 400 }
      );

    if (!body.buyer?.name || !body.buyer?.phone)
      return NextResponse.json(
        { success: false, message: "Buyer name and phone are required" },
        { status: 400 }
      );

    if (!body.products || body.products.length === 0)
      return NextResponse.json(
        { success: false, message: "At least one product is required" },
        { status: 400 }
      );

    if (
      !body.shipment?.length ||
      !body.shipment?.breadth ||
      !body.shipment?.height
    )
      return NextResponse.json(
        { success: false, message: "Package dimensions are required" },
        { status: 400 }
      );

    /* ---------------- TRANSACTION ---------------- */

    const result = await prisma.$transaction(async (tx) => {
      const pickup = await tx.address.findFirst({
        where: { id: body.addressId, userId: decoded.userId },
      });
      if (!pickup) throw new Error("INVALID_PICKUP");

      // Changes Made for Warehouse Creation
      if (pickup.code) {
        const payload = {
          name: pickup.code,
          address: pickup.address,
          city: pickup.city,
          state: pickup.state,
          pin: pickup.pincode,
          phone: pickup.phone,
          registered_name: pickup.tag,
          return_address: pickup.address,
          return_pin: pickup.pincode,
          return_city: pickup.city,
          return_state: pickup.state,
          return_country: pickup.country,
        };
        try {
          const res = await fetch(
            "https://staging-express.delhivery.com/api/backend/clientwarehouse/create/",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Token ${process.env.DELHIVERY_API_KEY}`,
              },
              body: JSON.stringify(payload),
            }
          );

          const data = await res.json();

          // const msg = String(data?.message || "");

          if (data.success === false) {
            console.log("Warehouse Already Exist proceeding with Existing Warehouse Address...");
          }
          else{
            console.log("Warehouse Created....")
          }
        } catch (err) {
          console.error("Warehouse sync failed:", err);
          throw err;
        }
      }

      const rto = await tx.address.findFirst({
        where: { id: body.rtoAddressId, userId: decoded.userId },
      });
      if (!rto) throw new Error("INVALID_RTO");

      const buyer = await tx.buyer.create({
        data: {
          userId: decoded.userId,
          name: body.buyer.name,
          phone: body.buyer.phone,
          alternateNumber: body.buyer.alternateNumber || null,
          email: body.buyer.email || null,
          address: body.buyer.address || null,
          pincode: body.buyer.pincode || null,
          landmark: body.buyer.landmark || null,
          city: body.buyer.city || null,
          state: body.buyer.state || null,
          orderno: body.buyer.orderno || null,
        },
      });

      const volumetricWeight =
        (body.shipment.length * body.shipment.breadth * body.shipment.height) /
        5000;

      const applicableWeight = Math.max(
        Number(body.shipment.physicalWeight),
        Number(volumetricWeight)
      );

      const order = await tx.order.create({
        data: {
          userId: decoded.userId,
          buyerId: buyer.id,
          addressId: pickup.id,
          rtoAddressId: rto.id,
          physicalWeight: body.shipment.physicalWeight,
          length: body.shipment.length,
          breadth: body.shipment.breadth,
          height: body.shipment.height,
          volumetricWeight,
          applicableWeight,
          dangerousGoods: body.dangerousGoods || false,
          paymentMethod: body.paymentMethod || "PREPAID",
          totalOrderValue: 0,
        },
      });

      let totalOrderValue = 0;

      for (const item of body.products) {
        const totalPrice = item.quantity * item.unitPrice;
        totalOrderValue += totalPrice;

        let product = await tx.product.findFirst({
          where: { userId: decoded.userId, name: item.name },
        });

        if (!product) {
          product = await tx.product.create({
            data: {
              userId: decoded.userId,
              name: item.name,
              category: item.category,
              SKU: item.SKU,
              HSN: item.HSN,
              unitPrice: item.unitPrice,
            },
          });
        }

        await tx.orderProduct.create({
          data: {
            orderId: order.id,
            productId: product.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice,
          },
        });
      }

      await tx.order.update({
        where: { id: order.id },
        data: { totalOrderValue },
      });

      return { orderId: order.id };
    });

    return NextResponse.json({
      success: true,
      message: "Order created successfully",
      orderId: result.orderId,
    });
  } catch (err: any) {
    console.error("Create Order Error:", err);

    let message = "Something went wrong. Please check all required fields.";

    if (err.message === "INVALID_PICKUP")
      message = "Please select a valid Pickup Address.";
    if (err.message === "INVALID_RTO")
      message = "Please select a valid RTO Address.";

    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
