import {prisma} from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcrypt"

export async function POST(req:Request){
    try{
        const {email,password,name} = await req.json()
        if(!email || !password || !name){
            return NextResponse.json({
                status:400,
                success:false,
                message:"Operation Failed",
                error:["All Fields are Required"]
            },{
                status:400
            })
        }

        const existingUser = await prisma.user.findUnique({
            where:{email}
        })


        if(existingUser){
            return NextResponse.json({
                status:409,
                success:false,
                message:"Operation Failed",
                error:["User Already Exist"]
            },{status:409})
        }

        const hashedpassword = await bcrypt.hash(password,10);

        const user = await prisma.user.create({
            data:{name,email,password:hashedpassword}
        })

        return NextResponse.json({
                status:201,
                success:true,
                message:"User Registered Successfully",
                data:{id:user.id,name:user.name,email:user.email},
                error:[]
                },{status:201},
    )
    }
    catch(err){
        return NextResponse.json({
                status:500,
                success:false,
                message:"Operation Failed",
                error:[err]
            },{status:500});
    }
}