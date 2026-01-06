import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
    };

    const { searchParams } = new URL(req.url);
    const orderId = Number(searchParams.get("id"));
    if (!orderId)
      return NextResponse.json({ message: "Order ID missing" }, { status: 400 });

    const body = await req.json();

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { products: true },
    });

    if (!existingOrder)
      return NextResponse.json({ message: "Order not found" }, { status: 404 });

    await prisma.$transaction(async (tx) => {

      await tx.buyer.update({
        where: { id: existingOrder.buyerId },
        data: {
          name: body.buyer.name,
          phone: body.buyer.phone,
          alternateNumber: body.buyer.alternateNumber,
          email: body.buyer.email,
          address: body.buyer.address,
          pincode: body.buyer.pincode,
          landmark: body.buyer.landmark,
          city: body.buyer.city,
          state: body.buyer.state,
          orderno: body.buyer.orderno,
        },
      });

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

      await tx.orderProduct.deleteMany({
        where: { orderId },
      });

      let totalOrderValue = 0;

      for (const p of body.products) {
        let product = await tx.product.findUnique({
          where: {
            userId_name: {
              userId: decoded.userId,
              name: p.name,
            },
          },
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

        const totalPrice = p.unitPrice * p.quantity;
        totalOrderValue += totalPrice;

        await tx.orderProduct.create({
          data: {
            orderId,
            productId: product.id,
            quantity: p.quantity,
            unitPrice: p.unitPrice,
            totalPrice,
          },
        });
      }

      await tx.order.update({
        where: { id: orderId },
        data: { totalOrderValue },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
    });

  } catch (err) {
    console.error("Update order error:", err);
    return NextResponse.json(
      { message: "Failed to update order" },
      { status: 500 }
    );
  }
}
