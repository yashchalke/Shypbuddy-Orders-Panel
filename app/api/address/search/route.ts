import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("query");
    const id = searchParams.get("id");

    // 🆕 Fetch single address by id (edit mode)
    if (id) {
      const address = await prisma.address.findFirst({
        where: {
          id: Number(id),
          userId: decoded.userId,
        },
      });

      return NextResponse.json(address);
    }

    // 🔍 Normal search mode
    const addresses = await prisma.address.findMany({
      where: {
        userId: decoded.userId,
        OR: [
          { tag: { contains: query || "", mode: "insensitive" } },
          { phone: { contains: query || "" } },
          { address: { contains: query || "", mode: "insensitive" } },
        ],
      },
      take: 6,
    });

    return NextResponse.json(addresses);
  } catch {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
}
