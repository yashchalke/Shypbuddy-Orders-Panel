import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
    };
    const body = await req.json();

    const result = await prisma.$transaction(async (tx) => {
      const pickup = await tx.address.findFirst({
        where: { id: body.addressId, userId: decoded.userId },
      });
      if (!pickup) throw new Error("Invalid pickup address");

      const rto = await tx.address.findFirst({
        where: { id: body.rtoAddressId, userId: decoded.userId },
      });
      if (!rto) throw new Error("Invalid RTO address");

      const buyer = await tx.buyer.create({
        data: {
          userId: decoded.userId,
          name: body.buyer.name,
          phone: body.buyer.phone,
          alternateNumber: body.buyer.alternateNumber,
          email: body.buyer.email,
          address: body.buyer.address,
          pincode: body.buyer.pincode,
          landmark: body.buyer.landmark || "",
          city: body.buyer.city,
          state: body.buyer.state,
          orderno: body.buyer.orderno || "",
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
          dangerousGoods: body.dangerousGoods,
          paymentMethod: body.paymentMethod,
          totalOrderValue: 0,
        },
      });

      let totalOrderValue = 0;

      for (const item of body.products) {
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

        const totalPrice = item.quantity * item.unitPrice;
        totalOrderValue += totalPrice;

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

      return { buyer, order };
    });

    return NextResponse.json({
      status: 201,
      success: true,
      message: "Order created successfully",
      orderId: result.order.id,
      data: result,
    });
  } catch (err: any) {
    console.error("Create order error:", err.message);
    return NextResponse.json(
      {
        status: 500,
        success: false,
        message: err.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
