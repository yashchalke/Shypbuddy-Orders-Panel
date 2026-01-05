import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    const { searchParams } = new URL(req.url);
    const orderId = Number(searchParams.get("id"));
    if (!orderId)
      return NextResponse.json(
        { message: "Order ID missing" },
        { status: 400 }
      );

    const body = await req.json();

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { products: true },
    });

    if (!existingOrder)
      return NextResponse.json({ message: "Order not found" }, { status: 404 });

    await prisma.$transaction(async (tx) => {
      // 1️⃣ Update Buyer
      await tx.buyer.update({
        where: { id: existingOrder.buyerId },
        data: body.buyer,
      });

      // 2️⃣ Update Addresses
      await tx.order.update({
        where: { id: orderId },
        data: {
          addressId: body.addressId,
          rtoAddressId: body.rtoAddressId,
          physicalWeight: body.shipment.physicalWeight,
          length: body.shipment.length,
          breadth: body.shipment.breadth,
          height: body.shipment.height,
          dangerousGoods: body.dangerousGoods,
          paymentMethod: body.paymentMethod,
        },
      });

      // 3️⃣ Reset Order Products
      await tx.orderProduct.deleteMany({ where: { orderId } });

      // 4️⃣ Handle Products by SKU
      for (const p of body.products) {
        let product = await tx.product.findUnique({
          where: {
            userId_name: {
              userId: Number(decoded.userId),
              name: p.name,
            },
          },
        });

        if (!product) {
          product = await tx.product.create({
            data: {
              userId: Number(decoded.userId),
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
            orderId,
            productId: product.id,
            quantity: p.quantity,
            unitPrice: p.unitPrice,
            totalPrice: p.unitPrice * p.quantity,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Failed to update order" },
      { status: 500 }
    );
  }
}
