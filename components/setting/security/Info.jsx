'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import React from 'react';
import Heading from '../Heading';

const securityItems = [
  {
    label: 'Change Password',
    path: 'security/change-password',
  },
  {
    label: 'Reset Password',
    path: 'security/reset-password',
  },
  {
    label: 'Two-Step Authentication',
    path: 'security/two-step-auth',
  },
];

const SecuritySettings = () => {
  const router = useRouter();

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <Heading title="Security Settings" />

      <div className="divide-y divide-zinc-800 max-w-2xl mx-auto">
        {securityItems.map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className="w-full flex items-center justify-between py-3 px-1 text-left hover:bg-zinc-900 rounded transition cursor-pointer"
          >
            <span className="text-sm text-gray-300">{item.label}</span>
            <ChevronRight className="text-gray-400" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default SecuritySettings;
