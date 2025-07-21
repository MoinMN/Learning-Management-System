'use client';

import LoadingAnimation from "@/components/SubLoader";
import { useUser } from "@/context/UserContext";
import { useEffect, useState } from "react";
import NotificationSwitch from "./Switch";
import { toast } from "sonner";
import Heading from "../Heading";

const viewerLabels = [
  {
    label: "New Course Available",
    key: "newCourseAvailable",
  },
  {
    label: "New Chapter Available",
    key: "newChapterAvailable",
  },
  {
    label: "Promotional Updates",
    key: "promotionalUpdates",
  },
];
const sellerLabels = [
  {
    label: "New Payment Received",
    key: "newPaymentReceived",
  },
  {
    label: "Bank Verified",
    key: "bankVerified",
  },
  {
    label: "Withdrawal Processed",
    key: "withdrawalProcessed",
  },
];

const NotificationSetting = () => {
  const { user, loading } = useUser();

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [settings, setSettings] = useState({});
  const [inputLabels, setInputLabels] = useState(viewerLabels);

  const fetchNotificationsSettings = async () => {
    try {
      const response = await fetch('/api/notification-setting/get', { method: "GET" });
      const result = await response.json();

      if (response.ok) {
        setSettings(result?.settings);
      } else {
        toast.error(result?.message);
      }
    } catch (error) {
      console.log("Error while fetching settings", error);
      toast.error("Try again later!");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchNotificationsSettings();
  }, []);

  const handleChange = async (key, value) => {
    if (!key || value === null) {
      return toast.warning("Key & value not received!");
    }
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/notification-setting/update?key=${key}&value=${value}`, { method: "PATCH" });
      const result = await response.json();
      if (response.ok) {
        setSettings(result?.settings)
        // toast.success(result?.message);
      } else {
        toast.error(result?.message);
      }
    } catch (error) {
      console.log('Error while updating notification settings ', error);
      toast.error("Try again later!");
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (user?.role === "SELLER") setInputLabels(sellerLabels)
    else setInputLabels(viewerLabels)
  }, [loading]);

  if (isLoading || loading) return <LoadingAnimation />;

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <Heading title="Notification Settings" />

      <div className="divide-y divide-zinc-800 max-w-2xl mx-auto">
        {inputLabels?.map((input, index) => (
          <NotificationSwitch
            key={index}
            label={input?.label}
            checked={settings[input?.key]}
            isUpdating={isUpdating}
            onChange={(val) => handleChange(input?.key, val)}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationSetting;
