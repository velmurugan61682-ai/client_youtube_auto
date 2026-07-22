import React from 'react';
import LeadsList from '../components/LeadsList';

const LeadsPage = ({ searchQuery }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 h-[calc(100vh-2.5rem)] min-h-[760px] overflow-hidden rounded-[28px] bg-[#eef3f5] p-4 sm:p-5 text-[#0f0f0f]">
      <div className="rounded-[22px] bg-white border border-[#e5e5e5] shadow-sm px-5 sm:px-7 py-5 flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-black text-[#0f0f0f] tracking-tight">
          WhatsApp Leads
        </h1>
      </div>
      <div className="custom-scroll mt-4 h-[calc(100%-92px)] overflow-y-auto pr-1">
        <LeadsList searchQuery={searchQuery} />
      </div>
    </div>
  );
};

export default LeadsPage;

