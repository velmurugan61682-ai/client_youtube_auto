import React from 'react';
import LeadsList from '../components/LeadsList';

const LeadsPage = ({ searchQuery }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-black text-[#0f0f0f] tracking-tight">
          WhatsApp Leads
        </h1>
      </div>
      <LeadsList searchQuery={searchQuery} />
    </div>
  );
};

export default LeadsPage;
