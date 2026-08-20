import React, { useState } from 'react';
import { Gauge, Leaf } from 'lucide-react';
import Button from './Button';
import Breadcrumb from './Breadcrumb';
import { statisticsData, scheduleData } from '../../config';

const QuickLinkPage = ({ navigate, title }) => {

    const [showVideo, setShowVideo] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        type: '',
        description: ''
    });
    const [submittedComplaint, setSubmittedComplaint] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmittedComplaint(formData);
    };

    const renderContent = () => {

        /* ================= HOW IT WORKS ================= */

        if (title === 'How it works') {
            return (
                <div className="text-left space-y-6">

                    <h3 className="text-xl font-bold text-green-800">
                        Smart Waste Collection Workflow
                    </h3>

                    <ul className="list-disc pl-6 space-y-3 text-gray-700">
                        <li>Workers scan QR codes for attendance with GPS verification (20m accuracy).</li>
                        <li>Collection routes are tracked using real-time GPS monitoring.</li>
                        <li>Offline data collection supported – syncs automatically.</li>
                        <li>Citizens can register complaints digitally.</li>
                        <li>Admin dashboard provides real-time analytics & performance reports.</li>
                        <li>Monthly waste statistics improve transparency.</li>
                    </ul>

                    <p className="text-gray-600">
                        This ensures accountability, efficiency and improved public service delivery.
                    </p>
                </div>
            );
        }

        /* ================= SUBMIT COMPLAINT ================= */

        if (title === 'Submit Complaint') {

            if (submittedComplaint) {
                return (
                    <div className="bg-green-50 p-6 rounded-xl border border-green-300 text-left">
                        <h3 className="text-xl font-bold text-green-800 mb-4">
                            Complaint Submitted Successfully
                        </h3>

                        <p><strong>Name:</strong> {submittedComplaint.name}</p>
                        <p><strong>Email:</strong> {submittedComplaint.email}</p>
                        <p><strong>Type:</strong> {submittedComplaint.type}</p>
                        <p><strong>Description:</strong> {submittedComplaint.description}</p>

                        <div className="flex justify-center mt-6">
                            <Button
                                primary={true}
                                onClick={() => setSubmittedComplaint(null)}
                            >
                                Submit Another Complaint
                            </Button>
                        </div>
                    </div>
                );
            }

            return (
                <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl mx-auto text-left">

                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded-lg"
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded-lg"
                    />

                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded-lg"
                    >
                        <option value="">Select Complaint Type</option>
                        <option>Missed Collection</option>
                        <option>Overflowing Bin</option>
                        <option>Illegal Dumping</option>
                        <option>Worker Misconduct</option>
                    </select>

                    <textarea
                        name="description"
                        placeholder="Describe the issue in detail..."
                        rows="4"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded-lg"
                    />

                    <div className="flex justify-center pt-4">
                        <Button primary={true} className="px-12 py-3 text-lg">
                            Submit Complaint
                        </Button>
                    </div>
                </form>
            );
        }

        /* ================= STATISTICS ================= */

        if (title === 'Statistics') {
            return (
                <div className="space-y-8 text-left">

                    <img
                        src="https://images.unsplash.com/photo-1581091215367-59ab6b5c4f0b"
                        alt="Waste Analytics"
                        className="w-full rounded-xl shadow-md"
                    />

                    <div className="grid md:grid-cols-2 gap-6">
                        {statisticsData.map((item, index) => (
                            <div key={index} className="p-6 border rounded-xl bg-green-50 shadow-sm">
                                <h3 className="text-3xl font-bold text-green-800">
                                    {item.value}
                                </h3>
                                <p className="text-gray-600 mt-2">
                                    {item.title}
                                </p>
                            </div>
                        ))}
                    </div>

                    <p className="text-gray-600">
                        These statistics are generated from the real-time admin dashboard,
                        ensuring transparency and performance monitoring as per the Smart Waste Management System.
                    </p>
                </div>
            );
        }

        /* ================= VIEW SCHEDULE ================= */

        if (title === 'View Schedule') {
            return (
                <div className="space-y-8 text-left">

                    <img
                        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
                        alt="Schedule"
                        className="w-full rounded-xl shadow-md"
                    />

                    <div className="grid md:grid-cols-2 gap-6">
                        {scheduleData.map((item, index) => (
                            <div key={index} className="p-6 border rounded-xl bg-green-50 shadow-sm">
                                <h3 className="font-bold text-green-800 mb-2">
                                    {item.ward}
                                </h3>
                                <p><strong>Collection Days:</strong> {item.days}</p>
                                <p><strong>Time:</strong> {item.time}</p>
                            </div>
                        ))}
                    </div>

                    <p className="text-gray-600">
                        Citizens are requested to keep segregated waste outside
                        before scheduled time for efficient door-to-door collection.
                    </p>
                </div>
            );
        }

        /* ================= GUIDES ================= */

        if (title === 'Guides / Resources') {
            return (
                <div className="grid md:grid-cols-2 gap-8 items-start">

                    <img
                        src="https://images.unsplash.com/photo-1509395176047-4a66953fd231"
                        alt="Guide"
                        className="w-full rounded-xl shadow-lg"
                    />

                    <div>
                        <iframe
                            className="w-full h-72 rounded-xl shadow-lg"
                            src="https://www.youtube.com/embed/7h3F8L7v1aE"
                            title="Waste Management Guide"
                            allowFullScreen
                        ></iframe>
                    </div>

                </div>
            );
        }

        return null;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-100">
            <div className="container mx-auto pt-10 px-4 sm:px-6 lg:px-8">

                <Breadcrumb
                    path={[
                        { label: 'Home', view: 'home' },
                        { label: 'Quick Links', view: null },
                        { label: title, view: null }
                    ]}
                    navigate={navigate}
                />

                <div className="max-w-5xl mx-auto mt-12 bg-white rounded-2xl p-12 border border-green-300 shadow-lg text-center">

                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center border">
                        <Gauge className="w-10 h-10 text-green-700" />
                    </div>

                    <h1 className="text-4xl font-bold text-green-900 mb-8">
                        {title}
                    </h1>

                    {renderContent()}

                    <div className="my-10 flex justify-center">
                        <div className="h-1 w-24 bg-green-300 rounded-full"></div>
                    </div>

                    <Button
                        onClick={() => navigate('home')}
                        primary={false}
                        className="text-lg px-10 py-3"
                    >
                        Return to Home
                    </Button>

                </div>

                <div className="text-center mt-12 text-gray-500 flex justify-center items-center gap-2">
                    <Leaf className="w-4 h-4 text-green-600" />
                    <span>Building a cleaner & greener community together</span>
                </div>

            </div>
        </div>
    );
};

export default QuickLinkPage;