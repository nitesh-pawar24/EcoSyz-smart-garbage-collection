import React from 'react';
import { Leaf, Phone, Mail, MapPin, Github, Twitter, Facebook } from 'lucide-react';
import { quickLinks } from '../../config';
import { usePanchayat } from '../../context/PanchayatContext';

const Footer = ({ navigate }) => {
    const { selectedPanchayat } = usePanchayat();

    const phone = selectedPanchayat?.contactPhone || '+91 99999 99999';
    const email = selectedPanchayat?.contactEmail || 'info@ecosyz.com';
    const address = selectedPanchayat?.address || 'Your City, Maharashtra';

    return (
        <footer className="bg-gray-950 text-gray-400">
        {/* Wave separator */}
        <div className="bg-white" style={{ clipPath: 'ellipse(60% 40% at 50% 0%)' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">

                {/* Brand */}
                <div className="md:col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center">
                            <Leaf className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white font-display font-bold text-lg">EcoSyz</span>
                    </div>
                    <p className="text-sm leading-relaxed mb-5">
                        Smart waste management powered by technology — for a cleaner, greener community.
                    </p>
                    <div className="flex gap-3">
                        {[Facebook, Twitter, Github].map((Icon, i) => (
                            <a
                                key={i}
                                href="#"
                                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-green-600 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                            >
                                <Icon className="w-4 h-4" />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Navigation</h3>
                    <ul className="space-y-2.5">
                        {[['Home', 'home'], ['About', 'about'], ['Contact', 'contact'], ['Submit Complaint', 'complaint']].map(([label, view]) => (
                            <li key={view}>
                                <button
                                    onClick={() => navigate && navigate(view)}
                                    className="text-sm hover:text-green-400 transition-colors"
                                >
                                    {label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Resources */}
                <div>
                    <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Resources</h3>
                    <ul className="space-y-2.5">
                        {(quickLinks || []).slice(0, 5).map((link) => (
                            <li key={link.view || link.name}>
                                <button
                                    onClick={() => navigate && navigate(link.view)}
                                    className="text-sm hover:text-green-400 transition-colors"
                                >
                                    {link.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h3>
                    <ul className="space-y-3">
                        {[
                            { icon: Phone, text: phone },
                            { icon: Mail, text: email },
                            { icon: MapPin, text: address },
                        ].map(({ icon: Icon, text }) => (
                            <li key={text} className="flex items-start gap-2.5">
                                <Icon className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                <span className="text-sm">{text}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-sm text-gray-500">© 2025 EcoSyz. All rights reserved.</p>
                <div className="flex gap-6 text-sm">
                    {['Privacy Policy', 'Terms of Service'].map((t) => (
                        <a key={t} href="#" className="text-gray-500 hover:text-green-400 transition-colors">{t}</a>
                    ))}
                </div>
            </div>
        </div>
    </footer>
    );
};

export default Footer;