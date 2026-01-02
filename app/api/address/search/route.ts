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

    const query = req.nextUrl.searchParams.get("query") || "";

    const addresses = await prisma.address.findMany({
      where: {
        userId: decoded.userId, // 🔥 ONLY this user’s addresses
        OR: [
          { tag: { contains: query, mode: "insensitive" } },
          { phone: { contains: query } },
          { address: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 6,
    });

    return NextResponse.json(addresses);
  } catch {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
}
