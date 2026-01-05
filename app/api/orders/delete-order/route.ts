import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };

    const { searchParams } = req.nextUrl;
    const orderId = searchParams.get("id");

    if (!orderId)
      return NextResponse.json({ message: "Order ID is required" }, { status: 400 });

    const order = await prisma.order.findFirst({
      where: {
        id: Number(orderId),
        userId: decoded.userId, // 🔐 user can delete only own orders
      },
    });

    if (!order)
      return NextResponse.json({ message: "Order not found" }, { status: 404 });

    // delete child records first (FK safe)
    await prisma.orderProduct.deleteMany({
      where: { orderId: order.id },
    });

    await prisma.order.delete({
      where: { id: order.id },
    });

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (err) {
    console.error("Delete order error:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
