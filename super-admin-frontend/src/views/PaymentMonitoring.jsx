"use client";

import Layout from "../components/Layout";
import PaymentOverviewCard from "../components/PaymentOverviewCard";
import PaymentTable from "../components/PaymentTable";

const overviewStats = [
  { id: 1, title: "Successful Payments", count: "100", icon: "check" },
  { id: 2, title: "Pending Payments", count: "18", icon: "pending" },
  { id: 3, title: "Failed Payments", count: "5", icon: "failed" },
];

const paymentData = [
  {
    id: 1,
    panchayatName: "Mapusa Panchayat",
    planName: "Basic",
    amount: "₹1,499",
    paymentDate: "Oct 25, 2025, 10:42 AM",
    transactionId: "pay_0120",
    status: "Successful",
  },
  {
    id: 2,
    panchayatName: "Verma Panchayat",
    planName: "Standard",
    amount: "₹2,699",
    paymentDate: "Oct 25, 2025, 10:42 AM",
    transactionId: "pay_0220",
    status: "Successful",
  },
  {
    id: 3,
    panchayatName: "Navelim Panchayat",
    planName: "Standard",
    amount: "₹2,699",
    paymentDate: "Oct 25, 2025, 10:42 AM",
    transactionId: "pay_0320",
    status: "Successful",
  },
  {
    id: 4,
    panchayatName: "Varca Panchayat",
    planName: "Premium",
    amount: "₹5,999",
    paymentDate: "Oct 25, 2025, 10:42 AM",
    transactionId: "pay_0420",
    status: "Failed",
  },
];

export default function PaymentMonitoring() {
  return (
    <Layout>
      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-7">
        {overviewStats.map((s) => (
          <PaymentOverviewCard key={s.id} stat={s} />
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="p-5 md:p-6 border-b border-slate-100">
          <div className="text-[16px] font-bold text-slate-900">
            Payment Records
          </div>
          <div className="text-[13px] text-slate-400 mt-1">
            Track all panchayat transactions
          </div>
        </div>
        <div className="p-0 md:px-6 md:pb-6 overflow-x-auto custom-scrollbar">
          <PaymentTable paymentData={paymentData} />
        </div>
      </div>
    </Layout>
  );
}
