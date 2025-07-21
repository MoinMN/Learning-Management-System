'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { FiRefreshCcw } from "react-icons/fi";
import { MdOutlineAdd } from "react-icons/md";
import { Switch } from '@/components/ui/switch';
import LoadingAnimation from '../../SubLoader';
import Heading from '@/components/setting/Heading';

const SellerConnectWalletInfo = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [accountList, setAccountList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState({ vendorId: "", value: false, });
  const [isEditActive, setIsEditActive] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (isEditActive) params.set('editing', 'true');
    else params.delete('editing');

    router.replace(`${pathname}?${params.toString()}`);
  }, [isEditActive]);

  useEffect(() => {
    const fetchAccountInfo = async () => {
      try {
        const response = await fetch('/api/account/get', {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const result = await response.json();

        if (response.ok) {
          // store data
          setAccountList(result.accounts);
          // refresh data
          if (result.accounts.length !== 0) {
            result.accounts.map(acc => handleRefresh(acc.vendorId));
          }
        }
      } catch (error) {
        console.error('Error fetching account info:', error);
        toast.error("Internal Server Error!");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccountInfo();
  }, []);

  const handleRefresh = async (vendorId) => {
    setIsRefreshing({ vendorId, value: true });
    try {
      const response = await fetch(`/api/cashfree/vendor?vendorId=${vendorId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();
      if (response.ok) {
        // toast.success(result.message);
        setAccountList(result?.data);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.log('Error while retriving status', error);
      toast.error("Try again later!");
    } finally {
      setIsRefreshing({ vendorId: "", value: false });
    }
  };

  const handlePrimaryToggle = async (vendorId) => {
    try {
      const response = await fetch(`/api/account/toggle-primary?vendorId=${vendorId}`, { method: "PATCH" });
      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.message || "Could not update primary account");
      } else {
        toast.success("Primary account updated");
      }
      handleRefresh(vendorId); // or however you're refreshing account list
    } catch (error) {
      console.log('Error toggling primary account', error);
      toast.error("Try again later!");
    }
  }

  if (isLoading) return <LoadingAnimation />;

  if (accountList.length === 0) {
    return (
      <>
        <div className="p-4 flex flex-col gap-4 text-white">
          {/* Header */}
          <Heading title="Connect Wallet" />

          <p className='text-yellow-400 text-sm px-2 md:px-4'>
            Connect your payment gateway to start receiving money.
          </p>
          <Button
            variant="secondary"
            className="cursor-pointer px-4 w-fit mx-2 md:mx-4"
            onClick={() => setIsEditActive(true)}
          >
            Connect
          </Button>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <Heading title="Payment Account Info" />

      {accountList?.length > 0 ? (
        accountList.map((account) => (
          <Card
            key={account.id}
            className="border border-gray-700 bg-gradient-to-br from-gray-800 via-gray-900 to-black text-gray-100 mx-auto max-w-xl mb-6 shadow-lg rounded-2xl"
          >
            <CardContent className="p-6 space-y-4">
              {/* Header Row with Refresh */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Account Info</h2>
                <Button
                  type="button"
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleRefresh(account.vendorId)}
                  disabled={isRefreshing.vendorId === account?.vendorId && isRefreshing.value}
                >
                  {(isRefreshing.vendorId === account?.vendorId && isRefreshing.value)
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Refreshing</>
                    : <><FiRefreshCcw className="mr-2" size={16} /> Refresh</>
                  }
                </Button>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <InfoItem label="User ID" value={account.userId} />
                <InfoItem label="Vendor ID" value={account.vendorId} />
                {account?.accountNumber && <InfoItem label="Account Number" value={account.accountNumber} />}
                {account?.ifscCode && <InfoItem label="IFSC Code" value={account.ifscCode} />}
                {account?.upiId && <InfoItem label="UPI ID" value={account.upiId} />}
                <InfoItem label="Account Holder Name" value={account.accountHolderName} />
                <InfoItem
                  label="Status"
                  value={
                    <Badge
                      variant={
                        account.status === "VERIFIED"
                          ? "default"
                          : account.status === "REJECTED"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {account.status}
                    </Badge>
                  }
                />
                <InfoItem label="Created At" value={new Date(account.createdAt).toLocaleString()} />
                <InfoItem label="Updated At" value={new Date(account.updatedAt).toLocaleString()} />
              </div>

              {/* Primary Account Toggle */}
              <div className="flex items-center gap-3 pt-2 cursor-pointer">
                <label htmlFor={`primary-${account.vendorId}`} className="text-sm text-gray-300">
                  Primary Account
                </label>
                <Switch
                  id={`primary-${account.vendorId}`}
                  checked={account.isPrimary}
                  onCheckedChange={() => handlePrimaryToggle(account.vendorId)}
                  className={`data-[state=checked]:bg-green-500 bg-zinc-700 border border-zinc-600 
                    relative inline-flex h-6 w-9 items-center rounded-full transition-colors cursor-pointer`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform 
                      ${account.isPrimary ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </Switch>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-white">No account found.</div>
      )}

      <div className="flex gap-4 mx-auto items-center justify-center">
        <Button
          type="button"
          variant="secondary"
          className="cursor-pointer"
          onClick={() => setIsEditActive(true)}
        >
          <MdOutlineAdd /> Add Another
        </Button>
      </div>

    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-400">{label}</p>
    <p className="text-sm font-medium text-white">{value}</p>
  </div>
);

export default SellerConnectWalletInfo;
