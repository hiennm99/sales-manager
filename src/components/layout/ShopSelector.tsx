// src/components/layout/ShopSelector.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAppStore } from '../../store/useAppStore';
import { useShopStore } from '../../features/shops/store/useShopStore';
import type { Shop } from '../../types/shop';

export const ShopSelector: React.FC = () => {
    const { currentShop, setCurrentShop, isSidebarCollapsed } = useAppStore();
    const { shops, fetchShops } = useShopStore();
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchShops();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Filter shops based on search
    const filteredShops = shops.filter(shop =>
        shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectShop = (shop: Shop) => {
        setCurrentShop(shop);
        setIsOpen(false);
        setSearchQuery('');
    };

    if (isSidebarCollapsed) {
        return (
            <div className="px-4 py-3 border-b border-gray-800">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-800 transition-colors"
                    title={currentShop?.name || 'Chọn cửa hàng'}
                >
                    {currentShop ? (
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                            {currentShop.name.charAt(0)}
                        </div>
                    ) : (
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    )}
                </button>
            </div>
        );
    }

    return (
        <div className="px-4 py-3 border-b border-gray-800" ref={dropdownRef}>
            {/* Current Shop Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors",
                    "hover:bg-gray-800",
                    isOpen && "bg-gray-800"
                )}
            >
                {currentShop ? (
                    <>
                        {currentShop.logo ? (
                            <img
                                src={currentShop.logo}
                                alt={currentShop.name}
                                className="w-8 h-8 rounded-full flex-shrink-0"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {currentShop.name.charAt(0)}
                            </div>
                        )}
                        <div className="flex-1 text-left min-w-0">
                            <div className="text-sm font-semibold text-white truncate">
                                {currentShop.name}
                            </div>
                            <div className="text-xs text-gray-400 truncate">
                                {currentShop.code}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div className="flex-1 text-left">
                            <div className="text-sm text-gray-400">Chọn cửa hàng</div>
                        </div>
                    </>
                )}
                <svg
                    className={cn(
                        "w-4 h-4 text-gray-400 transition-transform flex-shrink-0",
                        isOpen && "transform rotate-180"
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute left-4 right-4 mt-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50 max-h-96 flex flex-col">
                    {/* Search */}
                    <div className="p-3 border-b border-gray-700">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-900 text-white text-sm px-3 py-2 pl-9 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                            />
                            <svg
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Shop List */}
                    <div className="overflow-y-auto max-h-64">
                        {filteredShops.length === 0 ? (
                            <div className="p-4 text-center text-gray-400 text-sm">
                                Không tìm thấy cửa hàng
                            </div>
                        ) : (
                            filteredShops.map((shop) => (
                                <button
                                    key={shop.id}
                                    onClick={() => handleSelectShop(shop)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 hover:bg-gray-700 transition-colors",
                                        currentShop?.id === shop.id && "bg-gray-700"
                                    )}
                                >
                                    {shop.logo ? (
                                        <img
                                            src={shop.logo}
                                            alt={shop.name}
                                            className="w-8 h-8 rounded-full flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                            {shop.name.charAt(0)}
                                        </div>
                                    )}
                                    <div className="flex-1 text-left min-w-0">
                                        <div className="text-sm font-medium text-white truncate">
                                            {shop.name}
                                        </div>
                                        <div className="text-xs text-gray-400 truncate">
                                            {shop.code} • {shop.status === 'active' ? 'Hoạt động' : 'Tạm ngưng'}
                                        </div>
                                    </div>
                                    {currentShop?.id === shop.id && (
                                        <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </button>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-2 border-t border-gray-700">
                        <Link
                            to="/shops"
                            onClick={() => setIsOpen(false)}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Quản lý cửa hàng
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};