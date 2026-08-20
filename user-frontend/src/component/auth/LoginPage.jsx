// frontend/src/component/auth/LoginPage.jsx

import React from 'react';
import { Users, Lock } from 'lucide-react';
import Button from '../shared/Button';
import { PRIMARY_COLOR } from '../../config';

const LoginPage = ({ navigate }) => {
    const IconInput = ({ icon: Icon, placeholder, type = 'text' }) => (
        <div className="relative mb-6">
            <input
                type={type}
                placeholder={placeholder}
                className="w-full p-4 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 transition duration-150"
            />
            <Icon className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
    );

    return (
        <div className="container mx-auto pt-10 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap shadow-2xl rounded-xl overflow-hidden min-h-[60vh]">
                {/* A. Left Panel: Welcome & Register Prompt */}
                <div className={`hidden lg:flex lg:w-2/5 flex-col items-center justify-center p-8 text-white bg-emerald-500 bg-opacity-90`}>
                    <h3 className="text-4xl font-extrabold mb-4">Hello, Welcome!</h3>
                    <p className="text-lg mb-8 text-center">Don't have an account?</p>
                    <Button primary={false} onClick={() => navigate('registration')} className="px-8 py-2 bg-green-400 text-white hover:bg-green-500 shadow-xl rounded-full font-semibold transition-transform transform hover:scale-105">
                        Register
                    </Button>
                </div>

                {/* B. Right Panel: Login Form */}
                <div className="w-full lg:w-3/5 bg-white p-6 md:p-12 flex flex-col justify-center">
                    <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-10">Login</h2>

                    <form className="max-w-md mx-auto w-full">
                        <IconInput icon={Users} placeholder="Username" />
                        <IconInput icon={Lock} placeholder="Password" type="password" />

                        <div className="text-right mb-8">
                            <button
                                onClick={(e) => { e.preventDefault(); navigate('forgotPassword'); }}
                                className={`text-sm text-${PRIMARY_COLOR} hover:underline`}
                            >
                                Forgot Password?
                            </button>
                        </div>

                        <Button primary={false} className="w-full" onClick={(e) => { e.preventDefault(); alert('Login simulated!'); }}>
                            Login
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;