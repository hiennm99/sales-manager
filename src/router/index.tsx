// router/index.tsx

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { ShopList } from '../features/shops/pages/ShopList';
import { ShopDetail } from '../features/shops/pages/ShopDetail';
import { ProductList } from "../features/products/pages/ProductList";
import { ProductDetail } from "../features/products/pages/ProductDetail";
import { ProductCreate } from "../features/products/pages/ProductCreate";

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
                children: [
                    {
                        index: true,
                        element: <ProductList />,
                    },
                    {
                        path: 'create', // ✅ Route tạo mới
                        element: <ProductCreate />,
                    },
                    {
                        path: ':productId',
                        element: <ProductDetail />,
                    },
                    {
                        path: ':productId/edit', // ✅ Route edit
                        element: <ProductCreate />,
                    },
                ],
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