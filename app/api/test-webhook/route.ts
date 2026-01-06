import { NextRequest,NextResponse } from "next/server";
import { success } from "zod";

export async function name(req:NextRequest) {
    const body = await req.json();

    console.log("Webhook recieved", body);

    return NextResponse.json({
        success:true,
        message:"Web hook recieved successfully"
    })
    
}