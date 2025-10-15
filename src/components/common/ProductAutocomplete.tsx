// src/components/common/ProductAutocomplete.tsx

import React, { useState, useEffect, useRef } from 'react';
import type { Product } from '../../types/product';
import { useProductStore } from '../../features/products/store/useProductStore';

interface ProductAutocompleteProps {
    value: string;
    onChange: (value: string, product?: Product) => void;
    onSelect?: (product: Product) => void;
    placeholder?: string;
    className?: string;
    error?: string;
}

export const ProductAutocomplete: React.FC<ProductAutocompleteProps> = ({
    value,
    onChange,
    onSelect,
    placeholder = 'Nhập SKU hoặc tên sản phẩm...',
    className = '',
    error,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    const { products, fetchProducts } = useProductStore();

    // Load products on mount
    useEffect(() => {
        if (products.length === 0) {
            fetchProducts();
        }
    }, [products.length, fetchProducts]);

    // Filter products based on input
    useEffect(() => {
        if (value.trim() === '') {
            setFilteredProducts([]);
            setIsOpen(false);
            return;
        }

        const searchTerm = value.toLowerCase();
        const filtered = products.filter(product => 
            product.is_active && (
                product.sku.toLowerCase().includes(searchTerm) ||
                product.title.toLowerCase().includes(searchTerm)
            )
        ).slice(0, 10); // Limit to 10 results

        setFilteredProducts(filtered);
        setIsOpen(filtered.length > 0);
        setHighlightedIndex(0);
    }, [value, products]);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    const handleSelectProduct = (product: Product) => {
        onChange(product.sku, product);
        setIsOpen(false);
        if (onSelect) {
            onSelect(product);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen || filteredProducts.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => 
                    prev < filteredProducts.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
                break;
            case 'Enter':
                e.preventDefault();
                if (filteredProducts[highlightedIndex]) {
                    handleSelectProduct(filteredProducts[highlightedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                break;
        }
    };

    return (
        <div className="relative">
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                    if (filteredProducts.length > 0) {
                        setIsOpen(true);
                    }
                }}
                placeholder={placeholder}
                className={className}
                autoComplete="off"
            />

            {/* Dropdown */}
            {isOpen && filteredProducts.length > 0 && (
                <div
                    ref={dropdownRef}
                    className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto"
                >
                    {filteredProducts.map((product, index) => (
                        <div
                            key={product.id}
                            onClick={() => handleSelectProduct(product)}
                            onMouseEnter={() => setHighlightedIndex(index)}
                            className={`
                                flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors
                                ${index === highlightedIndex 
                                    ? 'bg-blue-50 border-l-4 border-blue-500' 
                                    : 'hover:bg-gray-50 border-l-4 border-transparent'
                                }
                                ${index !== filteredProducts.length - 1 ? 'border-b border-gray-100' : ''}
                            `}
                        >
                            {/* Product Image */}
                            <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                                {product.image_url ? (
                                    <img
                                        src={product.image_url}
                                        alt={product.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            target.nextElementSibling?.classList.remove('hidden');
                                        }}
                                    />
                                ) : null}
                                <div className={`w-full h-full flex items-center justify-center ${product.image_url ? 'hidden' : ''}`}>
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-gray-900 text-sm truncate">
                                        {product.sku}
                                    </span>
                                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                                        Active
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 truncate">
                                    {product.title}
                                </p>
                            </div>

                            {/* Selection Indicator */}
                            {index === highlightedIndex && (
                                <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            )}
                        </div>
                    ))}

                    {/* Footer hint */}
                    <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                        <div className="flex items-center justify-between">
                            <span>Sử dụng ↑↓ để di chuyển, Enter để chọn</span>
                            <span>{filteredProducts.length} kết quả</span>
                        </div>
                    </div>
                </div>
            )}

            {/* No results message */}
            {value.trim() !== '' && !isOpen && filteredProducts.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                    <div className="flex items-center gap-3 text-gray-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="text-sm">Không tìm thấy sản phẩm phù hợp</span>
                    </div>
                </div>
            )}

            {/* Error message */}
            {error && (
                <p className="mt-1 text-xs text-red-600">{error}</p>
            )}
        </div>
    );
};
