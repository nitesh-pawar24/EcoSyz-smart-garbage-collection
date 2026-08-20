"use client";

import { useState } from 'react';
import Layout from '../components/Layout';
import TicketOverviewCard from '../components/TicketOverviewCard';
import TicketsTable from '../components/TicketsTable';

const overviewStats = [
  { id: 1, title: 'Open Tickets',  count: '2',  description: 'Needs immediate attention', icon: 'open'     },
  { id: 2, title: 'In Progress',   count: '5',  description: 'Currently being handled',   icon: 'progress' },
  { id: 3, title: 'Solved',        count: '10', description: 'Successfully closed',        icon: 'solved'   },
];

const ticketData = [
  { id: 1, ticketId: 'T-01', panchayatName: 'Mapusa Panchayat',  issueType: 'Payment Issue',         createdDate: 'Oct 25, 2025, 10:42 AM', status: 'Open'        },
  { id: 2, ticketId: 'T-02', panchayatName: 'Verma Panchayat',   issueType: 'Technical Bug',         createdDate: 'Oct 25, 2025, 10:42 AM', status: 'In Progress' },
  { id: 3, ticketId: 'T-03', panchayatName: 'Navelim Panchayat', issueType: 'Subscription Inquiry',  createdDate: 'Oct 25, 2025, 10:42 AM', status: 'Resolved'    },
  { id: 4, ticketId: 'T-04', panchayatName: 'Varca Panchayat',   issueType: 'Login Issue',           createdDate: 'Oct 25, 2025, 10:42 AM', status: 'Resolved'    },
];

export default function SupportQueries() {
  const [selectedFilter, setSelectedFilter] = useState('All');

  return (
    <Layout>
      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-7">
        {overviewStats.map(s => <TicketOverviewCard key={s.id} stat={s} />)}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="p-5 md:p-6 border-b border-slate-100">
          <div className="text-[16px] font-bold text-slate-900">Support Tickets</div>
          <div className="text-[13px] text-slate-400 mt-1">Manage queries raised by panchayats</div>
        </div>
        <div className="p-0 md:px-6 md:pb-6 overflow-x-auto custom-scrollbar">
          <TicketsTable ticketData={ticketData} selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} />
        </div>
      </div>
    </Layout>
  );
}
