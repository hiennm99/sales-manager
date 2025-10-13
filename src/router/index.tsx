// router/index.tsx

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { ShopList } from '../features/shops/pages/ShopList';
import { ShopDetail } from '../features/shops/pages/ShopDetail';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <Navigate to="/dashboard" replace />,
            },
            {
                path: 'dashboard',
                element: <div className="text-2xl font-bold">Dashboard Page (Coming Soon)</div>,
            },
            {
                path: 'shops',
                children: [
                    {
                        index: true,
                        element: <ShopList />,
                    },
                    {
                        path: ':id',
                        element: <ShopDetail />,
                    },
                ],
            },
            {
                path: 'products',
                element: <div className="text-2xl font-bold">Products Page (Coming Soon)</div>,
            },
            {
                path: 'orders',
                element: <div className="text-2xl font-bold">Orders Page (Coming Soon)</div>,
            },
            {
                path: 'employees',
                element: <div className="text-2xl font-bold">Employees Page (Coming Soon)</div>,
            },
        ],
    },
]);