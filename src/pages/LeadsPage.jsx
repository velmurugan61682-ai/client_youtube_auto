import React from 'react';
import LeadsList from '../components/LeadsList';

const LeadsPage = ({ searchQuery }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#0f0f0f] tracking-tight mb-1">
          WhatsApp Leads
        </h1>
        <p className="text-[#606060] font-medium">Manage leads generated from YouTube comments</p>
      </div>
      <LeadsList searchQuery={searchQuery} />
    </div>
  );
};

export default LeadsPage;
