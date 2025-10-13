// src/features/products/data/mockProducts.ts

import type { Product } from '../../../types/product';

export const mockProducts: Product[] = [
    {
        id: '1',
        sku: 'TSH-BLK-001',
        title: 'Classic Black T-Shirt - Premium Cotton',
        etsy_url: 'https://www.etsy.com/listing/12345/classic-black-tshirt',
        image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
        status: 'active',
        created_at: new Date('2023-01-15'),
        updated_at: new Date('2024-10-10'),
    },
    {
        id: '2',
        sku: 'HDY-GRY-002',
        title: 'Unisex Hoodie - Cozy Gray',
        etsy_url: 'https://www.etsy.com/listing/12346/unisex-hoodie-gray',
        image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
        status: 'active',
        created_at: new Date('2023-01-15'),
        updated_at: new Date('2024-10-10'),
    },
    {
        id: '3',
        sku: 'MUG-WHT-003',
        title: 'Ceramic Coffee Mug - White 11oz',
        etsy_url: 'https://www.etsy.com/listing/12347/ceramic-coffee-mug',
        image_url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400',
        status: 'active',
        created_at: new Date('2023-01-15'),
        updated_at: new Date('2024-10-10'),
    },
    {
        id: '4',
        sku: 'PST-ART-004',
        title: 'Vintage Art Poster - Abstract Design',
        etsy_url: 'https://www.etsy.com/listing/12348/vintage-art-poster',
        image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=400',
        status: 'inactive',
        created_at: new Date('2023-01-15'),
        updated_at: new Date('2024-10-10'),
    }
];