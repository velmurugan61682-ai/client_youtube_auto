import React from 'react';
import Settings from '../components/Settings';

const SettingsPage = ({ user }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#0f0f0f] tracking-tight mb-1">
          AI & System Settings
        </h1>
        <p className="text-[#606060] font-medium">Configure automation rules and API preferences</p>
      </div>
      <Settings user={user} />
    </div>
  );
};

export default SettingsPage;
