import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar.jsx';

const StudentLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Sidebar navigation */}
            <Sidebar isOpen={sidebarOpen} toggleSidebar={setSidebarOpen} />

            {/* Main container */}
            <div className="lg:pl-64 flex flex-col min-h-screen">
                {/* Header toolbar */}
                <Navbar toggleSidebar={setSidebarOpen} />

                {/* Content canvas */}
                <main className="flex-1 p-6 max-w-7xl w-full mx-auto animate-fadeIn">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default StudentLayout;
