// import { prisma } from "@/lib/prisma";
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//   try {
//     const { orderId } = await req.json();

//     if (!orderId)
//       return NextResponse.json(
//         { success: false, message: "Order ID required" },
//         { status: 400 }
//       );

//     const order = await prisma.order.findUnique({
//       where: { id: orderId },
//       include: {
//         buyer: true,
//         address: true,
//         products: { include: { product: true } },
//       },
//     });

    

//     if (!order)
//       return NextResponse.json(
//         { success: false, message: "Order not found" },
//         { status: 404 }
//       );

//     /* 🔁 Ensure Pickup Warehouse Exists */
//     const ensureWarehouse = async () => {
//       if (!order.address.code) return;
//       try {
//         const payload = {
//           name: order.address.code,
//           address: order.address.address,
//           city: order.address.city,
//           state: order.address.state,
//           pin: order.address.pincode,
//           phone: order.address.phone,
//           return_address: order.address.address,
//           return_city: order.address.city,
//           return_state: order.address.state,
//           return_pin: order.address.pincode,
//           return_phone: order.address.phone,
//         };

//         const res = await fetch(
//           "https://staging-express.delhivery.com/api/backend/clientwarehouse/create/",
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               Accept: "application/json",
//               Authorization: `Token ${process.env.DELHIVERY_API_KEY}`,
//             },
//             body: JSON.stringify(payload),
//           }
//         );

//         const data = await res.json();

//         // const msg = String(data?.message || "");

//         if (data.success === false) {
//           console.log(
//             "Warehouse Already Exist proceeding with Existing Warehouse Address..."
//           );
//         } else {
//           console.log("Warehouse Created....");
//         }
//       } catch (err) {
//         console.error("Warehouse sync failed:", err);
//         throw err;
//       }
//     };

//     await ensureWarehouse();

//     /* 📦 Create Shipment */
//     const payload = {
//       shipments: [
//         {
//           name: order.buyer.name,
//           add: order.buyer.address,
//           pin: order.buyer.pincode,
//           city: order.buyer.city,
//           state: order.buyer.state,
//           country: "India",
//           phone: order.buyer.phone,

//           order: String(order.id),
//           payment_mode: order.paymentMethod === "COD" ? "COD" : "Prepaid",

//           return_pin: order.address.pincode,
//           return_city: order.address.city,
//           return_phone: order.address.phone,
//           return_add: order.address.address,
//           return_state: order.address.state,
//           return_country: "India",

//           products_desc: order.products.map((p) => p.product.name).join(", "),
//           cod_amount: order.paymentMethod === "COD" ? order.totalOrderValue : 0,
//           order_date: new Date().toISOString().split("T")[0],

//           total_amount: order.totalOrderValue,
//           quantity: order.products.reduce((s, p) => s + p.quantity, 0),

//           seller_add: order.address.code,
//           seller_name: order.address.tag,
//           seller_inv: String(order.id),
//           seller_inv_date: new Date().toISOString().split("T")[0],

//           shipment_width: order.breadth,
//           shipment_height: order.height,
//           shipment_length: order.length,
//           weight: order.applicableWeight,
//         },
//       ],
//       pickup_location:{
//         name:order.address.code
//       }
//     };

//     const formBody = new URLSearchParams();
//     formBody.append("format", "json");
//     formBody.append("data", JSON.stringify(payload));

//     const res = await fetch(
//       "https://staging-express.delhivery.com/api/cmu/create.json",
//       {
//         method: "POST",
//         headers: {
//           Accept: "application/json",
//           Authorization: `Token ${process.env.DELHIVERY_API_KEY}`,
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//         body: formBody.toString(),
//       }
//     );

//     const raw = await res.text();
//     let delhivery;

//     try {
//       delhivery = JSON.parse(raw);
//     } catch {
//       console.error("Shipment Raw Response:", raw);
//       return NextResponse.json(
//         { success: false, message: "Courier returned invalid response" },
//         { status: 400 }
//       );
//     }

//     const waybill =
//       delhivery?.packages?.[0]?.waybill || delhivery?.waybills?.[0];

//     if (!waybill) {
//       const courierRemark = delhivery?.packages?.[0]?.remarks?.[0];

//       const reason =
//         courierRemark ||
//         delhivery?.rmk ||
//         delhivery?.packages?.[0]?.status ||
//         "Shipment rejected by courier";

//       return NextResponse.json(
//         { success: false, message: reason },
//         { status: 400 }
//       );
//     }

//     await prisma.order.update({
//       where: { id: orderId },
//       data: {
//         awb_number: waybill,
//         status: "READY_TO_SHIP",
//         delhivery_partner:"delhivery"
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       message: "Shipment created successfully",
//       order: {
//         id: orderId,
//         awb_number: waybill,
//         status: "READY_TO_SHIP",
//         delhivery_partner: "delhivery"
//       },
//     });
//   } catch (err) {
//     console.error("Shipment Fatal Error:", err);
//     return NextResponse.json(
//       { success: false, message: "Shipment creation crashed" },
//       { status: 500 }
//     );
//   }
// }





import { NextRequest, NextResponse } from "next/server";
import { shipOrderFlow } from "@/actions/ship-order";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    jwt.verify(token, process.env.JWT_SECRET!);

    const { orderId } = await req.json();
    const result = await shipOrderFlow(orderId);

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Shipment failed" },
      { status: 500 }
    );
  }
}
