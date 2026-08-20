import React, { useState } from 'react';
import {
    Users,
    Mail,
    Lock,
    Home,
    MapPin,
    Smartphone,
    FileText
} from 'lucide-react';
import Button from '../shared/Button';
import { PRIMARY_COLOR } from '../../config';

const IconInput = ({ icon: Icon, placeholder, label, type = 'text', half = true }) => (
    <div className={`flex flex-col ${half ? 'md:w-1/2' : 'w-full'} p-2`}>
        <label className="text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        <div className="relative">
            <input
                type={type}
                placeholder={placeholder}
                className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <Icon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
    </div>
);

const FileUpload = ({ title, documentsAccepted, setFile, file }) => (
    <div className="w-full md:w-1/2 p-2">
        <h4 className="font-semibold text-gray-800 mb-3">{title}</h4>

        <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg bg-gray-50">
            <input
                type="file"
                id={title}
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
            />

            <label
                htmlFor={title}
                className={`cursor-pointer block text-center py-2 rounded-full border border-${PRIMARY_COLOR} text-${PRIMARY_COLOR}`}
            >
                {file ? file.name : 'Choose file / No file chosen'}
            </label>

            <ul className="text-xs text-gray-500 list-disc pl-5 mt-3">
                {documentsAccepted.map((doc, i) => (
                    <li key={i}>{doc}</li>
                ))}
            </ul>
        </div>
    </div>
);

const BaseRegistration = ({ navigate, type }) => {
    const [identityFile, setIdentityFile] = useState(null);
    const [premisesFile, setPremisesFile] = useState(null);

    return (
        <div className="container mx-auto pt-10 px-4">
            <div className="flex flex-wrap shadow-2xl rounded-xl overflow-hidden min-h-[80vh]">

                {/* LEFT PANEL */}
                <div className="w-full lg:w-3/5 bg-white p-6 md:p-12">
                    <h2 className="text-3xl font-extrabold text-center mb-10">
                        {type} Registration
                    </h2>

                    <form className="flex flex-wrap -m-2">
                        <IconInput icon={Users} label="Username" placeholder="Enter Username" />
                        <IconInput icon={Mail} label="E-mail" placeholder="Enter E-mail" type="email" />
                        <IconInput icon={Lock} label="Password" placeholder="Enter Password" type="password" />
                        <IconInput icon={Lock} label="Confirm Password" placeholder="Confirm Password" type="password" />

                        {type === 'Company' && (
                            <IconInput
                                icon={FileText}
                                label="Company Name"
                                placeholder="Enter Company Name"
                                half={false}
                            />
                        )}

                        <IconInput icon={Home} label="House Number" placeholder="Enter House Number" />
                        <IconInput icon={MapPin} label="Area / Ward" placeholder="Enter Area" />
                        <IconInput icon={MapPin} label="Pincode" placeholder="Enter Pincode" />
                        <IconInput icon={Smartphone} label="Mobile Number" placeholder="Enter Mobile Number" />

                        {/* DOCUMENTS */}
                        <div className="w-full p-4 mt-6">
                            <h3 className="text-xl font-bold border-b pb-2 mb-4">
                                Upload Documents
                            </h3>

                            <div className="flex flex-wrap -m-2">
                                <FileUpload
                                    title="identity"
                                    documentsAccepted={['Aadhaar, Passport, Voter ID']}
                                    setFile={setIdentityFile}
                                    file={identityFile}
                                />

                                <FileUpload
                                    title="premises"
                                    documentsAccepted={['Electricity bill, Rent agreement']}
                                    setFile={setPremisesFile}
                                    file={premisesFile}
                                />
                            </div>
                        </div>

                        {/* ACTION */}
                        <div className="w-full p-2 mt-8 text-center">
                            <Button
                                className="w-full max-w-sm"
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate(
                                        type === 'Company'
                                            ? 'company-dashboard'
                                            : 'household-dashboard'
                                    );
                                }}
                            >
                                Register
                            </Button>
                        </div>
                    </form>
                </div>

                {/* RIGHT PANEL */}
                <div className="hidden lg:flex lg:w-2/5 flex-col items-center justify-center p-8 text-white bg-emerald-500">
                    <h3 className="text-4xl font-extrabold mb-4">
                        Already Registered?
                    </h3>
                    <Button onClick={() => navigate(`login-${type.toLowerCase()}`)}>
                        Login
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default BaseRegistration;
