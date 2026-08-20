// frontend/src/component/auth/ForgotPasswordPage.jsx

import React from 'react';
import Button from '../shared/Button';
import { ACCENT_COLOR } from '../../config';

const ForgotPasswordPage = ({ navigate }) => {
    return (
        <div className="container mx-auto pt-10 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap shadow-2xl rounded-xl overflow-hidden min-h-[60vh]">
                {/* A. Left Panel: Forgot Password Info */}
                <div className={`hidden lg:flex lg:w-2/5 flex-col items-center justify-center p-8 text-white bg-emerald-500 bg-opacity-90`}>
                    <h3 className="text-4xl font-extrabold mb-4">Forgot Password</h3>
                    <p className="text-lg mb-8 text-center">Remember your account details?</p>
                    <Button primary={false} onClick={() => navigate('login')} className="px-8 py-2 bg-white text-emerald-600 hover:bg-gray-100 shadow-xl">
                        Login
                    </Button>
                </div>

                {/* B. Right Panel: Reset Password Form */}
                <div className="w-full lg:w-3/5 bg-gray-50 p-6 md:p-12 flex flex-col justify-center">
                    <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-10">Reset Password</h2>

                    <form className="max-w-md mx-auto w-full">
                        <div className="flex items-end mb-6">
                            <div className="flex-grow mr-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username/Email/Mobile no.</label>
                                <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Enter details" />
                            </div>
                            <Button primary={true} small={true} onClick={(e) => { e.preventDefault(); alert('OTP Sent!'); }}>
                                Get OTP
                            </Button>
                        </div>

                        <div className="flex items-end mb-8">
                            <div className="flex-grow mr-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                                <input type="text" className="w-full p-3 border-2 border-red-500 rounded-lg" placeholder="Enter 6-digit OTP" />
                            </div>
                            <Button primary={false} small={true} onClick={(e) => { e.preventDefault(); alert('OTP Verified!'); }}>
                                Verify OTP
                            </Button>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
                            <input type="password" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="New password" />
                        </div>

                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
                            <input type="password" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Confirm new password" />
                        </div>

                        <Button primary={false} className="w-full" onClick={(e) => { e.preventDefault(); alert('Password Reset Successful!'); navigate('login'); }}>
                            Reset Password
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;