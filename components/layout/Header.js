import React from 'react';
import { useAppContext } from '../../context/AppContext.js';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
    const { state, dispatch } = useAppContext();
    const { currentUser } = state;

    return (
        <header className="sticky top-0 bg-white border-b border-gray-200 z-30">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 -mb-px">
                    {/* Header: Left side */}
                    <div className="flex">
                        {/* Hamburger button */}
                        <button
                            className="text-gray-500 hover:text-gray-600 lg:hidden"
                            aria-controls="sidebar"
                            aria-expanded={sidebarOpen}
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <span className="sr-only">Open sidebar</span>
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <rect x="4" y="5" width="16" height="2" />
                                <rect x="4" y="11" width="16" height="2" />
                                <rect x="4" y="17" width="16" height="2" />
                            </svg>
                        </button>
                    </div>

                    {/* Header: Right side */}
                    <div className="flex items-center space-x-3">
                        <div className="text-right">
                            <div className="font-semibold text-gray-800">{currentUser?.name}</div>
                            <div className="text-xs text-gray-500 capitalize">{currentUser?.role}</div>
                        </div>
                        <button 
                            onClick={() => dispatch({ type: 'LOGOUT' })}
                            className="ml-4 px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
