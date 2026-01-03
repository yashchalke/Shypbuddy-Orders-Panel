// import { prisma } from "@/lib/prisma";
// import { NextRequest, NextResponse } from "next/server";
// import jwt from "jsonwebtoken";

// export async function GET(req: NextRequest) {
//   try {
//     const token = req.cookies.get("token")?.value;
//     if (!token)
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };

//     const orders = await prisma.order.findMany({
//       where: {
//         userId: decoded.userId,   
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//       include: {
//         address:true,
//         rtoAddress:true,
//         buyer: true,
//         products: {
//           include: {
//             product: true,
//           },
//         },
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       count: orders.length,
//       orders,
//     });
//   } catch (err) {
//     console.error("Fetch orders error:", err);
//     return NextResponse.json(
//       { success: false, message: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }



// Main code....

// import { prisma } from "@/lib/prisma";
// import { NextRequest, NextResponse } from "next/server";
// import jwt from "jsonwebtoken";

// export async function GET(req: NextRequest) {
//   try {
//     const token = req.cookies.get("token")?.value;
//     if (!token)
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };

//     const { searchParams } = req.nextUrl;
//     const orderId = searchParams.get("id"); // ?id=123

//     const orders = await prisma.order.findMany({
//       where: {
//         userId: decoded.userId,
//         ...(orderId && { id: Number(orderId) }), // only apply filter if id exists
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//       include: {
//         address: true,
//         rtoAddress: true,
//         buyer: true,
//         products: {
//           include: {
//             product: true,
//           },
//         },
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       count: orders.length,
//       orders,
//     });
//   } catch (err) {
//     console.error("Fetch orders error:", err);
//     return NextResponse.json(
//       { success: false, message: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };

    const { searchParams } = req.nextUrl;
    const orderId = searchParams.get("id");
    const page = Number(searchParams.get("page") || 1);
    const limit = 4;

    const skip = (page - 1) * limit;

    const whereClause: any = {
      userId: decoded.userId,
      ...(orderId && { id: Number(orderId) }),
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
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
