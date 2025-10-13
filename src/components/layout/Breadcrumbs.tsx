// components/layout/Breadcrumbs.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import type { BreadcrumbItem } from '../../types/common';

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
    return (
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {index > 0 && (
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    )}
                    {item.path && index < items.length - 1 ? (
                        <Link
                            to={item.path}
                            className="hover:text-blue-600 transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className={index === items.length - 1 ? 'text-gray-900 font-medium' : ''}>
              {item.label}
            </span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};