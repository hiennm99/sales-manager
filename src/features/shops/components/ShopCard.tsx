// features/shops/components/ShopCard.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import type { Shop } from '../../../types/shop';
import { cn } from '../../../lib/utils';
import { Button } from '../../../components/ui/Button';
import { useAppStore } from '../../../store/useAppStore';

interface ShopCardProps {
    shop: Shop;
    onSelect?: (shop: Shop) => void;
}

export const ShopCard: React.FC<ShopCardProps> = ({ shop, onSelect }) => {
    const { currentShop, setCurrentShop } = useAppStore();
    const isSelected = currentShop?.id === shop.id;

    const handleSelect = () => {
        setCurrentShop(shop);
        onSelect?.(shop);
    };

    return (
        <div
            className={cn(
                'bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden',
                isSelected && 'ring-2 ring-blue-500'
            )}
        >
            {/* Header với logo */}
            <div className="relative h-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                {shop.logo ? (
                    <img src={shop.logo} alt={shop.name} className="w-20 h-20 rounded-full border-4 border-white" />
                ) : (
                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-3xl font-bold text-blue-600">
                        {shop.name.charAt(0)}
                    </div>
                )}

                {/* Status badge */}
                <div className="absolute top-3 right-3">
                      <span
                          className={cn(
                              'px-2 py-1 rounded-full text-xs font-semibold',
                              shop.is_active === true
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                          )}
                      >
                        {shop.is_active === true ? 'Hoạt động' : 'Tạm ngưng'}
                      </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{shop.name}</h3>
                        <p className="text-sm text-gray-500">Mã: {shop.code}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Button
                        variant={isSelected ? 'primary' : 'outline'}
                        size="sm"
                        className="flex-1"
                        onClick={handleSelect}
                    >
                        {isSelected ? 'Đang chọn' : 'Chọn'}
                    </Button>
                    <Link to={`/shops/${shop.id}`} className="flex-1">
                        <Button variant="ghost" size="sm" className="w-full">
                            Chi tiết
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};