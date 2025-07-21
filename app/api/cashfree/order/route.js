// app/api/cashfree/create-order/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();
  const { orderId, orderAmount, customerDetails } = body;

  const sellerAmount = parseFloat((orderAmount * 0.95).toFixed(2));
  const platformAmount = parseFloat((orderAmount * 0.05).toFixed(2));

  try {
    const data = {
      order_currency: "INR",
      order_amount: orderAmount,
      customer_details: {
        customer_id: customerDetails?.customer_id,
        customer_name: customerDetails?.customer_name,
        customer_email: customerDetails?.customer_email,
        customer_phone: "9090407368",
      },
      order_splits: [
        {
          vendor_id: "VENDOR_67890",
          amount: sellerAmount,
          tags: { role: "Seller" }
        },
        {
          vendor_id: "VENDOR_12345",
          amount: platformAmount,
          tags: { role: "Dev" }
        }
      ],
      order_meta: {
        return_url: `http://localhost:3000/viewer/courses`,
      },
    }


    const options = {
      method: 'POST',
      headers: {
        'x-api-version': '2025-01-01',
        'x-client-id': process.env.CASHFREE_APP_ID,
        'x-client-secret': process.env.CASHFREE_SECRET,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    };

    const response = await fetch('https://sandbox.cashfree.com/pg/orders', options);

    const result = await response.json();
    console.log(result);

    return NextResponse.json({ success: true, result }, { status: 201 });
  } catch (error) {
    console.error("Cashfree Order Error:", error?.response?.data || error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
