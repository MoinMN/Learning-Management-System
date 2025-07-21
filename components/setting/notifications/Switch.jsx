'use client';

import { Switch } from "@/components/ui/switch";

const NotificationSwitch = ({ label, checked, onChange, isUpadting }) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-zinc-800">
      <span className="text-sm text-gray-300">{label}</span>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        disabled={isUpadting}
        className={`data-[state=checked]:bg-green-500 bg-zinc-700 border border-zinc-600 
    relative inline-flex h-6 w-9 items-center rounded-full transition-colors cursor-pointer`}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform 
      ${checked ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </Switch>
    </div>
  );
};

export default NotificationSwitch;
