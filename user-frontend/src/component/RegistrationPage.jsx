// frontend/src/component/RegistrationPage.jsx

import React, { useState } from 'react';
import { Users, Mail, Lock, Home, MapPin, Smartphone, FileText, Upload } from 'lucide-react';
import Button from './shared/Button';
import { PRIMARY_COLOR, ACCENT_COLOR } from '../config';

const IconInput = ({ icon: Icon, placeholder, label, type = 'text', half = true }) => (
    <div className={`flex flex-col ${half ? 'md:w-1/2' : 'w-full'} p-2`}>
        <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="relative">
            <input
                type={type}
                placeholder={placeholder}
                className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-150"
            />
            <Icon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
    </div>
);

const FileUpload = ({ title, documentsAccepted, setFile, file }) => (
    <div className="w-full md:w-1/2 p-2">
        <h4 className="font-semibold text-gray-800 mb-3">{title}</h4>
        <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg bg-gray-50 h-full flex flex-col justify-between">
            <div>
                <input
                    type="file"
                    id={title.replace(/\s/g, '-')}
                    className="hidden"
                    onChange={(e) => setFile(e.target.files[0])}
                />
                <label htmlFor={title.replace(/\s/g, '-')} className={`cursor-pointer block text-center py-2 rounded-full border border-${PRIMARY_COLOR} text-${PRIMARY_COLOR} hover:bg-indigo-50 transition`}>
                    {file ? file.name : 'Choose file / No file chosen'}
                </label>
                <p className="text-xs text-gray-500 mt-3 font-medium">Documents accepted:</p>
                <ul className="text-xs text-gray-500 list-disc pl-5 mt-1">
                    {documentsAccepted.map((doc, i) => <li key={i}>{doc}</li>)}
                </ul>
            </div>
        </div>
    </div>
);

const RegistrationPage = ({ navigate }) => {
    const [identityFile, setIdentityFile] = useState(null);
    const [premisesFile, setPremisesFile] = useState(null);

    return (
        <div className="container mx-auto pt-10 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap shadow-2xl rounded-xl overflow-hidden min-h-[80vh]">
                {/* A. Left Panel: Registration Form */}
                <div className="w-full lg:w-3/5 bg-white p-6 md:p-12">
                    <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-10">Register</h2>

                    <form className="flex flex-wrap -m-2">
                        {/* Input Fields */}
                        <IconInput icon={Users} label="Username" placeholder="Enter Username" />
                        <IconInput icon={Mail} label="E-mail" placeholder="Enter E-mail" type="email" />
                        <IconInput icon={Lock} label="Password" placeholder="Enter Password" type="password" />
                        <IconInput icon={Lock} label="Confirm Password" placeholder="Confirm Password" type="password" />
                        <IconInput icon={Home} label="H. No (House Number)" placeholder="Enter House Number" />
                        <IconInput icon={MapPin} label="Area/Locality/Ward" placeholder="Enter Area/Locality/Ward" />
                        <IconInput icon={MapPin} label="Pincode" placeholder="Enter Pincode" />
                        <IconInput icon={Smartphone} label="Mobile Number" placeholder="Enter Mobile Number" />

                        {/* Document Upload Section */}
                        <div className="w-full p-4 mt-6">
                            <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">
                                Upload Documents
                            </h3>

                            <div className="flex flex-wrap -m-2">
                                <FileUpload
                                    title="Proof of Identity"
                                    documentsAccepted={[
                                        'Aadhaar Card, Voter ID, Driving License, Passport, Enrollment Card, or any other government document.',
                                    ]}
                                    setFile={setIdentityFile}
                                    file={identityFile}
                                />

                                <FileUpload
                                    title="Proof of Premises"
                                    documentsAccepted={[
                                        'House registration document, House tax receipt (latest), Electricity bill (not older than 3 months), Rent/Lease agreement, Transfer of property document, or any other document...',
                                    ]}
                                    setFile={setPremisesFile}
                                    file={premisesFile}
                                />
                            </div>
                        </div>

                        {/* Action Button & Link */}
                        <div className="w-full p-2 mt-8 text-center">
                            <Button primary={false} className="w-full max-w-sm" onClick={(e) => { e.preventDefault(); alert('Registration simulated!'); }}>
                                Register
                            </Button><br />
                            <button onClick={(e) => { e.preventDefault(); alert('Need Help? Contact support at 9999999999'); }} className={`mt-4 text-sm text-${PRIMARY_COLOR} hover:underline`}>
                                Need help?
                            </button>
                        </div>
                    </form>
                </div>

                {/* B. Right Panel: Login Prompt */}
                <div className={`hidden lg:flex lg:w-2/5 flex-col items-center justify-center p-8 text-white bg-emerald-500 bg-opacity-90`}>
                    <h3 className="text-4xl font-extrabold mb-4">Welcome Back!</h3>
                    <p className="text-lg mb-8 text-center">Already have an account?</p>
                    <Button primary={false} onClick={() => navigate('login')} className="bg-green-500 text-white px-6 py-2 rounded-full shadow-md hover:bg-green-600 transition">
                        Login
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default RegistrationPage;