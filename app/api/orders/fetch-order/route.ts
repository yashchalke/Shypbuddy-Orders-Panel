import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
    };

    const { searchParams } = req.nextUrl;

    const orderId = searchParams.get("id");
    const payment = searchParams.get("payment");
    const tag = searchParams.get("tag");
    const hsn = searchParams.get("hsn");
    const sku = searchParams.get("sku");
    const page = Number(searchParams.get("page") || 1);
    const limit = 4;
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const skip = (page - 1) * limit;

    const dateFilter: any = {};
    if (from) {
      const start = new Date(from);
      start.setHours(0, 0, 0, 0);
      dateFilter.gte = start;
    }
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      dateFilter.lte = end;
    }

    const whereClause: any = {
      userId: decoded.userId,

      ...(orderId && { id: Number(orderId) }),

      ...(payment && {
        paymentMethod: payment.toUpperCase() as "PREPAID" | "COD",
      }),

      ...(from || to ? { createdAt: dateFilter } : {}),

      ...(tag && {
  address: {
    tag: { contains: tag, mode: "insensitive" },
  },
}),

      ...(hsn && {
        products: {
          some: {
            product: {
              HSN: { contains: hsn, mode: "insensitive" },
            },
          },
        },
      }),

      ...(sku && {
        products: {
          some: {
            product: {
              SKU: { contains: sku, mode: "insensitive" },
            },
          },
        },
      }),
    };

    const [orders, totalOrders] = await prisma.$transaction([
      prisma.order.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          address: true,
          rtoAddress: true,
          buyer: true,
          products: { include: { product: true } },
        },
      }),
      prisma.order.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      success: true,
      pagination: {
        total: totalOrders,
        page,
        totalPages: Math.ceil(totalOrders / limit),
      },
      orders,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
