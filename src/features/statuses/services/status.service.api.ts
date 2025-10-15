// src/features/statuses/services/status.service.api.ts

import { supabase, handleSupabaseError } from '../../../lib/supabase';
import type { 
    GeneralStatus, 
    CustomerStatus, 
    FactoryStatus, 
    DeliveryStatus 
} from '../../../types/status';

class StatusServiceApi {
    // General Statuses
    async getGeneralStatuses(): Promise<GeneralStatus[]> {
        const { data, error } = await supabase
            .from('general_statuses')
            .select('*')
            .order('id', { ascending: true });

        if (error) {
            throw new Error(handleSupabaseError(error));
        }

        // Map database fields to our Status interface
        return (data || []).map(item => ({
            id: item.id,
            name: item.code,
            name_vi: item.description,
            color: this.getColorFromCode(item.code),
            description: item.description,
            created_at: new Date(item.created_at),
            updated_at: new Date(item.updated_at),
        }));
    }

    // Customer Statuses
    async getCustomerStatuses(): Promise<CustomerStatus[]> {
        const { data, error } = await supabase
            .from('customer_statuses')
            .select('*')
            .order('id', { ascending: true });

        if (error) {
            throw new Error(handleSupabaseError(error));
        }

        return (data || []).map(item => ({
            id: item.id,
            name: item.code,
            name_vi: item.description,
            color: this.getColorFromCode(item.code),
            description: item.description,
            created_at: new Date(item.created_at),
            updated_at: new Date(item.updated_at),
        }));
    }

    // Factory Statuses
    async getFactoryStatuses(): Promise<FactoryStatus[]> {
        const { data, error } = await supabase
            .from('factory_statuses')
            .select('*')
            .order('id', { ascending: true });

        if (error) {
            throw new Error(handleSupabaseError(error));
        }

        return (data || []).map(item => ({
            id: item.id,
            name: item.code,
            name_vi: item.description,
            color: this.getColorFromCode(item.code),
            description: item.description,
            created_at: new Date(item.created_at),
            updated_at: new Date(item.updated_at),
        }));
    }

    // Delivery Statuses
    async getDeliveryStatuses(): Promise<DeliveryStatus[]> {
        const { data, error } = await supabase
            .from('delivery_statuses')
            .select('*')
            .order('id', { ascending: true });

        if (error) {
            throw new Error(handleSupabaseError(error));
        }

        return (data || []).map(item => ({
            id: item.id,
            name: item.code,
            name_vi: item.description,
            color: this.getColorFromCode(item.code),
            description: item.description,
            created_at: new Date(item.created_at),
            updated_at: new Date(item.updated_at),
        }));
    }

    // Helper function to determine color based on status code
    private getColorFromCode(code: string): string {
        const lowerCode = code.toLowerCase();
        
        // Completed/Success states - GREEN
        if (lowerCode.includes('completed') || 
            lowerCode.includes('delivered') || 
            lowerCode.includes('confirmed') ||
            lowerCode.includes('reviewed')) {
            return 'green';
        }
        
        // Cancelled/Failed/Returned states - RED
        if (lowerCode.includes('cancelled') || 
            lowerCode.includes('cancel_requested') ||
            lowerCode.includes('returned') || 
            lowerCode.includes('rejected') ||
            lowerCode.includes('delivery_failed')) {
            return 'red';
        }
        
        // Warning/Pending states - YELLOW
        if (lowerCode.includes('pending') || 
            lowerCode.includes('on_hold') ||
            lowerCode.includes('drying') ||
            lowerCode.includes('action_needed') ||
            lowerCode.includes('pushing') ||
            lowerCode.includes('no_response')) {
            return 'yellow';
        }
        
        // Processing/Active states - BLUE
        if (lowerCode.includes('processing') || 
            lowerCode.includes('drawing') ||
            lowerCode.includes('editing') ||
            lowerCode.includes('redrawing') ||
            lowerCode.includes('quality_check') ||
            lowerCode.includes('packaging') ||
            lowerCode.includes('on_tracking')) {
            return 'blue';
        }
        
        // New/Initial states - GRAY
        if (lowerCode.includes('new') || 
            lowerCode.includes('order_pending') ||
            lowerCode.includes('info_pending') ||
            lowerCode.includes('preview_pending') ||
            lowerCode.includes('tracking_pending')) {
            return 'gray';
        }
        
        // Sent/Ready states - PURPLE
        if (lowerCode.includes('sent') || 
            lowerCode.includes('handover') ||
            lowerCode.includes('prepared')) {
            return 'purple';
        }
        
        // Closed/End states - INDIGO
        if (lowerCode.includes('closed')) {
            return 'indigo';
        }
        
        // Default
        return 'gray';
    }
}

export const statusServiceApi = new StatusServiceApi();
