"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

const dummyPayments = [
  {
    id: "pay_1",
    orderId: "ORD123456",
    amount: 499,
    currency: "INR",
    status: "SUCCESS",
    paymentMode: "UPI",
    paidAt: "2025-06-20T10:15:00Z",
    courseTitle: "React for Beginners",
  },
  {
    id: "pay_2",
    orderId: "ORD123457",
    amount: 999,
    currency: "INR",
    status: "PENDING",
    paymentMode: "Card",
    paidAt: null,
    courseTitle: "Next.js Masterclass",
  },
  {
    id: "pay_3",
    orderId: "ORD123458",
    amount: 299,
    currency: "INR",
    status: "FAILED",
    paymentMode: "NetBanking",
    paidAt: null,
    courseTitle: "JavaScript Essentials",
  },
];

const ViewerPayout = () => {
  const statusColor = { SUCCESS: "bg-green-600", PENDING: "bg-yellow-600", FAILED: "bg-red-600", };

  const [isLoading, setIsLoading] = useState(true);

  return (
    <h1>Hello</h1>
    // <div className="p-6 space-y-6 w-full">
    //   <div className="space-y-2">
    //     <h1 className="text-2xl font-bold">Payment History</h1>
    //     <p className="text-muted-foreground">
    //       View your previous course payments
    //     </p>
    //   </div>

    //   <div className="space-y-4 mx-auto max-w-2xl">
    //     {isLoading
    //       ? Array.from({ length: 3 }).map((_, index) => (
    //         <Card key={index} className="border border-gray-700 bg-gradient-to-br from-gray-800 via-gray-900 to-black mx-auto max-w-xl mb-6 shadow-lg rounded-2xl">
    //           <CardContent className="p-4 space-y-2">
    //             <div className="flex justify-between items-start">
    //               <div className="space-y-2">
    //                 <Skeleton className="h-5 w-40 bg-gray-700 rounded-md" /> {/* Course Title */}
    //                 <Skeleton className="h-4 w-56 bg-gray-700 rounded-md" /> {/* Order ID */}
    //                 <Skeleton className="h-4 w-32 bg-gray-700 rounded-md" /> {/* Amount */}
    //                 <Skeleton className="h-4 w-28 bg-gray-700 rounded-md" /> {/* Mode */}
    //                 <Skeleton className="h-4 w-48 bg-gray-700 rounded-md" /> {/* Paid At */}
    //               </div>
    //               <Skeleton className="h-8 w-20 bg-gray-700 rounded-full" /> {/* Status badge */}
    //             </div>
    //           </CardContent>
    //         </Card>
    //       ))
    //       : dummyPayments.length === 0
    //         ? <p className="text-muted-foreground text-sm">No payments found.</p>
    //         : dummyPayments.map((payment) => (
    //           <Card key={payment.id} className="border border-gray-700 bg-gradient-to-br from-gray-800 via-gray-900 to-black text-gray-100 mx-auto max-w-xl mb-6 shadow-lg rounded-2xl">
    //             <CardContent className="p-4 space-y-2">
    //               <div className="flex justify-between items-center">
    //                 <div>
    //                   <p className="font-medium">{payment.courseTitle}</p>
    //                   <p className="text-sm text-muted-foreground">
    //                     Order ID: {payment.orderId}
    //                   </p>
    //                   <p className="text-sm text-muted-foreground">
    //                     Amount: ₹{payment.amount} {payment.currency}
    //                   </p>
    //                   <p className="text-sm text-muted-foreground">
    //                     Mode: {payment.paymentMode || "—"}
    //                   </p>
    //                   <p className="text-sm text-muted-foreground">
    //                     Paid At:{" "}
    //                     {payment.paidAt
    //                       ? new Date(payment.paidAt).toLocaleString()
    //                       : "—"}
    //                   </p>
    //                 </div>
    //                 <Badge className={statusColor[payment.status]}>
    //                   {payment.status}
    //                 </Badge>
    //               </div>
    //             </CardContent>
    //           </Card>
    //         ))
    //     }
    //   </div>
    // </div>
  )
}

export default ViewerPayout
