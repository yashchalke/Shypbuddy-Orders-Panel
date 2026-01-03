import {prisma} from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken";
import { success } from "zod";

export async function GET(req:NextRequest,{params}:{params:Promise<{id:string}>}){
    const id = await params;
    try{
    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token,process.env.JWT_SECRET!) as {userId:number};

    const res = await prisma.order.findFirst({
        where:{userId:decoded.userId,id:Number(id.id)},
    include:{
        products:true,
        address:true,
        rtoAddress:true,
    }});

    if (!res) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: res,
    });
}
catch(err){
    console.log(err);
    return NextResponse.json({
        success:"false"
    })
}
    
}