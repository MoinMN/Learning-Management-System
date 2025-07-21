"use client";

import { useUser } from "@/context/UserContext";
import { load } from "@cashfreepayments/cashfree-js";
import { useEffect, useState } from "react";

const Courses = () => {
  const { user } = useUser();

  const [cashfree, setCashfree] = useState(null);

  useEffect(() => {
    const initializeSDK = async () => {
      const cf = await load({ mode: "sandbox" });
      setCashfree(cf);
    };
    initializeSDK();
  }, []);

  const startPayment = async (amount) => {
    if (!cashfree) {
      alert("Cashfree SDK not loaded. Try again later.");
      return;
    }

    const res = await fetch("/api/cashfree/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json", },
      body: JSON.stringify({
        orderId: "order_" + Date.now(),
        orderAmount: amount,
        customerDetails: {
          customer_id: user?.id,
          customer_name: user?.name,
          customer_email: user?.email,
        },
      }),
    });

    const data = await res.json();

    if (data?.result?.payment_session_id) {
      await cashfree.checkout({
        paymentSessionId: data.result.payment_session_id,
        redirectTarget: "_self",
      });
    } else {
      alert("Payment session creation failed");
    }
  };


  // const initiateRazorpayPayment = async (amount) => {
  //   const res = await fetch("/api/razorpay/order", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ amount }),
  //   });

  //   const orderData = await res.json();
  //   console.log(orderData);
  //   const options = {
  //     key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  //     amount: orderData.amount,
  //     currency: orderData.currency,
  //     name: "LMS",
  //     description: "Course Purchase",
  //     order_id: orderData.id,
  //     handler: async (response) => {
  //       // Send response to your backend for verification & course access
  //       console.log("Payment success", response);
  //     },
  //     prefill: {
  //       name: user.name,
  //       email: user.email,
  //     },
  //     theme: {
  //       color: "#6366f1",
  //     },
  //   };

  //   const rzp = new window.Razorpay(options);
  //   rzp.open();
  // };

  return (
    <div>
      {/* <button onClick={() => initiateRazorpayPayment(499)}> */}
      <button onClick={() => startPayment()}>
        Pay ₹499
      </button>

      <div className="row">
        <p>Click below to open the checkout page in current tab</p>
        <button type="submit" className="btn btn-primary" id="renderBtn" onClick={() => startPayment(500)}>
          Pay Now
        </button>
      </div>
    </div>
  )
}

export default Courses
