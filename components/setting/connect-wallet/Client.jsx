"use client";

import { useSearchParams } from "next/navigation";
import SellerConnectWalletInfo from "./Info";
import SellerConnectWalletForm from "./Form";

const SellerConnectWalletClient = () => {
  const searchParams = useSearchParams();
  const isEditing = searchParams.get("editing") === "true";

  return isEditing ? <SellerConnectWalletForm /> : <SellerConnectWalletInfo />
}

export default SellerConnectWalletClient
