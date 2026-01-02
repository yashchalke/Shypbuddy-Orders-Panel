import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({
        status:400,
        success:false,
        message:"Operation Failed!",
        error:["Email and Password cannot be Empty"]
      }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email },include:{products:true,orders:true,addresses:true,buyers:true} });

    if (!user) {
      return NextResponse.json({
        status:401,
        success:false,
        message:"Operation Failed!",
        error:["User Does not Exist"]
      }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json({
        status:401,
        success:false,
        message:"Operation Failed!",
        error:["Incorrect Password"]
      }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
        status:200,
        success:true,
        message:"Login Successful",
        token:token,
        data:{
          id:user.id,
          name:user.name,
          email:user.email,
          address:user.addresses,
          orders:user.orders,
          products:user.products,
          buyers:user.buyers
        },
        error:[]
      },{status:200});

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
