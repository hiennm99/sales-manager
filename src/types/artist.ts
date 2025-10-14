// types/artist.ts

import type { BaseEntity } from './common';

export interface Artist extends BaseEntity {
    name: string;
    code: string;
    avatar: string;
    is_active: boolean;
}

export interface ArtistFormData {
    name: string;
    code: string;
    avatar: string;
}

// Helper function to get status string from is_active
export const getArtistStatus = (is_active: boolean): 'active' | 'inactive' => {
    return is_active ? 'active' : 'inactive';
};

// Helper function to get status label in Vietnamese
export const getArtistStatusLabel = (is_active: boolean): string => {
    return is_active ? 'Hoạt động' : 'Tạm ngưng';
};

// Helper function to get artist initials for avatar fallback
export const getArtistInitials = (name: string): string => {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

// Helper function to format artist display name with code
export const formatArtistDisplay = (artist: Artist): string => {
    return `${artist.name} (${artist.code})`;
};