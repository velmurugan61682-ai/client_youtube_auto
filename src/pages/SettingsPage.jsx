import React from 'react';
import Settings from '../components/Settings';

const SettingsPage = ({ user }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-[#0f0f0f] tracking-tight">
          Settings
        </h1>
      </div>
      <Settings user={user} />
    </div>
  );
};

export default SettingsPage;
