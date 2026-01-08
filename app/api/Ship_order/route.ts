import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";


export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: true,
        address: true,
        products: { include: { product: true } }
      }
    });

    if (!order) return NextResponse.json({ success:false, message:"Order not found" },{status:404});

    const payload = {
      shipments: [
        {
          name: order.buyer.name,
          add: order.buyer.address,
          pin: order.buyer.pincode,
          city: order.buyer.city,
          state: order.buyer.state,
          country: "India",
          phone: order.buyer.phone,

          order: String(order.id),
          payment_mode: order.paymentMethod === "COD" ? "COD" : "Prepaid",
          return_pin: order.address.pincode,
          return_city: order.address.city,
          return_phone: order.address.phone,
          return_add: order.address.address,
          return_state: order.address.state,
          return_country: "India",

          products_desc: order.products.map(p => p.product.name).join(", "),
          cod_amount: order.paymentMethod === "COD" ? order.totalOrderValue : 0,
          order_date: new Date().toISOString().split("T")[0],

          total_amount: order.totalOrderValue,
          quantity: order.products.reduce((s,p)=>s+p.quantity,0),

          seller_add: order.address.code,
          seller_name: order.address.tag,
          seller_inv: order.id,
          seller_inv_date: new Date().toISOString().split("T")[0],

          shipment_width: order.breadth,
          shipment_height: order.height,
          shipment_length: order.length,
          weight: order.applicableWeight
        }
      ]
    };

    const formBody = new URLSearchParams();
    formBody.append("format","json");
    formBody.append("data", JSON.stringify(payload));

    const res = await fetch("https://staging-express.delhivery.com/api/cmu/create.json",{
      method:"POST",
      headers:{
        Authorization:`Token ${process.env.DELHIVERY_API_KEY}`,
        Accept:"application/json",
        "Content-Type":"application/x-www-form-urlencoded"
      },
      body: formBody.toString()
    });

    const data = await res.json();

    return NextResponse.json({ success:true, delhivery:data });

  } catch(err:any){
    console.error(err);
    return NextResponse.json({ success:false, message:"Shipment creation failed"},{status:400});
  }
}
