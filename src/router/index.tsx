// router/index.tsx

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { ShopList } from '../features/shops/pages/ShopList';
import { ProductList } from "../features/products/pages/ProductList";
import { ProductDetail } from "../features/products/pages/ProductDetail";
import { ProductCreate } from "../features/products/pages/ProductCreate";
import { OrderList } from "../features/orders/pages/OrderList";
import { OrderDetail } from "../features/orders/pages/OrderDetail";
import { OrderCreate } from "../features/orders/pages/OrderCreate";


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
                    }
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
                        path: 'create',
                        element: <ProductCreate />,
                    },
                    {
                        path: ':productId',
                        element: <ProductDetail />,
                    },
                    {
                        path: ':productId/edit',
                        element: <ProductCreate />,
                    },
                ],
            },
            {
                path: 'orders',
                children: [
                    {
                        index: true,
                        element: <OrderList />,
                    },
                    {
                        path: 'create',
                        element: <OrderCreate />,
                    },
                    {
                        path: ':orderId',
                        element: <OrderDetail />,
                    },
                    {
                        path: ':orderId/edit',
                        element: <OrderDetail />,
                    },
                ],
            },
            {
                path: 'employees',
                element: <div className="text-2xl font-bold">Employees Page (Coming Soon)</div>,
            },
        ],
    },
]);