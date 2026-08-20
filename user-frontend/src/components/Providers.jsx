"use client";

import React from "react";
import { PanchayatProvider } from "../context/PanchayatContext";
import GlobalScrollLock from "../component/shared/GlobalScrollLock";
import PanchayatModal from "../component/shared/PanchayatModal";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Providers({ children }) {
  return (
    <PanchayatProvider>
      <GlobalScrollLock />
      {children}
      <PanchayatModal />
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        toastClassName="!rounded-2xl !shadow-xl !font-sans !text-sm"
        progressClassName="!bg-green-500"
      />
    </PanchayatProvider>
  );
}
