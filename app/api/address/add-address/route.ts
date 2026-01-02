import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({
        status:401,
        success:false,
        message:"Operation Failed",
        error:["User not logged in"]
      }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
    };

    const body = await req.json();

    const newAddress = await prisma.address.create({
      data: {
        userId: decoded.userId,   
        tag: body.tag,
        phone: body.phone,
        address: body.address,
        landmark: body.landmark,
        pincode: body.pincode,
        city: body.city,
        state: body.state,
        country: body.country,
      },
    });

    return NextResponse.json(
      {
        status: 201,
        success: true,
        message: "Address added successfully!",
        data: newAddress,
        error:[]
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Something went wrong:", err);

    return NextResponse.json(
      { status: 500, success: false, message: "Internal Server Error", error:[err] },
      { status: 500 }
    );
  }
}
