// features/shops/data/mockProducts.ts
import type { Shop } from '../../../types/shop';

export const mockShops: Shop[] = [
    {
        id: '1',
        name: 'AoiGallery',
        code: 'AOI001',
        status: 'active',
        logo: 'https://via.placeholder.com/100/4F46E5/FFFFFF?text=AOI',
        created_at: new Date('2023-01-15'),
        updated_at: new Date('2024-10-10'),
    },
    {
        id: '2',
        name: 'TritoneGallery',
        code: 'TRI001',
        status: 'active',
        logo: 'https://via.placeholder.com/100/10B981/FFFFFF?text=TRI',
        created_at: new Date('2023-03-20'),
        updated_at: new Date('2024-10-12'),
    }
];