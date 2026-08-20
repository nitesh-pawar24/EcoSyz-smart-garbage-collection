import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = ({ path, navigate }) => (
    <nav className="flex items-center gap-1.5 text-sm mb-6">
        <button
            onClick={() => navigate('home')}
            className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 hover:bg-green-50 hover:text-green-600 transition-colors"
        >
            <Home className="w-3.5 h-3.5" />
        </button>
        {path.map((item, index) => (
            <span key={index} className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                <button
                    onClick={() => item.view && navigate(item.view)}
                    className={`font-medium transition-colors ${
                        !item.view
                            ? 'text-gray-900 cursor-default'
                            : 'text-gray-500 hover:text-green-600'
                    }`}
                >
                    {item.label}
                </button>
            </span>
        ))}
    </nav>
);

export default Breadcrumb;