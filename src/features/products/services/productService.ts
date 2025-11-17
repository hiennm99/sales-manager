// src/features/products/services/productService.ts

import { CACHE, IMAGE_OPTIMIZATION, STORAGE_PATHS, VALIDATION } from "@constants";
import { cleanInsertData, handleSupabaseError, supabase } from "@lib";
import { databaseService, imageService } from "@services";
import type { Database, Product, ProductFormData } from "@types";

/**
 * Table reference for reusability
 */
const productsTable = () => supabase.from("products");

/**
 * Helper function to map database row to Product type
 */
const mapToRow = (
  data: Database["public"]["Tables"]["products"]["Row"]
): Product => {
  return {
    id: data.id,
    shop_code: data.shop_code,
    sku: data.sku,
    title: data.title,
    etsy_url: data.etsy_url,
    image_url: data.image_url,
    is_active: data.is_active,
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at)
  };
};

/**
 * Generate SKU based on shop_code and serial_id
 * Format: <shop_code><zeros><serial_id> = 8 characters
 * Example: shop_code="ABC" serial_id=1 => "ABC00001"
 */
const generateSKU = (shopCode: string, serialId: number): string => {
  const shopCodeLength = shopCode.length;
  const maxLength = VALIDATION.SKU_MAX_LENGTH;
  const serialStr = serialId.toString();
  const zerosNeeded = maxLength - shopCodeLength - serialStr.length;

  if (zerosNeeded < 0) {
    throw new Error(
      `SKU would exceed ${maxLength} characters. Shop code: ${shopCode}, Serial: ${serialId}`
    );
  }

  return `${shopCode}${"0".repeat(zerosNeeded)}${serialStr}`;
};

/**
 * Get the next serial ID for a shop
 * Uses databaseService to get max id and ensure unique serial numbers
 */
const getNextSerialId = async (shopCode: string): Promise<number> => {
  try {
    // Get the maximum ID for the current shop using databaseService
    const maxId = await databaseService.getMaxColumnValue("products", "id", {
      shop_code: shopCode
    });

    // If no products exist for this shop, start with 1, otherwise increment max ID
    return maxId ? maxId + 1 : 1;
  } catch (error) {
    console.error("Error in getNextSerialId:", error);
    throw error;
  }
};

/**
 * Upload image to Supabase Storage with WebP conversion
 * @param file - Image file to upload
 * @param sku - Product SKU (used as filename)
 * @returns Public URL of uploaded image
 */
const uploadProductImage = async (file: File, sku: string): Promise<string> => {
  // Use IMAGE_OPTIMIZATION constants
  const fileName = `${sku}.${IMAGE_OPTIMIZATION.FORMAT}`;
  const filePath = STORAGE_PATHS.PRODUCTS.getFilePath(fileName);

  // Convert image to WebP with optimization
  const optimizedImage = await imageService.convertToWebP(file, {
    quality: IMAGE_OPTIMIZATION.QUALITY,
    maxWidth: IMAGE_OPTIMIZATION.MAX_WIDTH,
    maxHeight: IMAGE_OPTIMIZATION.MAX_HEIGHT
  });

  // Delete existing file if exists
  const { error: deleteError } = await supabase.storage
    .from(STORAGE_PATHS.PRODUCTS.BUCKET)
    .remove([filePath]);

  if (deleteError && deleteError.message !== "The resource was not found") {
    console.warn("Error deleting existing image:", deleteError);
  }

  // Upload the optimized WebP image
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_PATHS.PRODUCTS.BUCKET)
    .upload(filePath, optimizedImage, {
      cacheControl: CACHE.STORAGE_CACHE_CONTROL,
      upsert: true,
      contentType: `image/${IMAGE_OPTIMIZATION.FORMAT}`
    });

  if (uploadError) {
    console.error("Error uploading image:", uploadError);
    throw new Error("Failed to upload image");
  }

  // Get public URL
  const { data } = supabase.storage
    .from(STORAGE_PATHS.PRODUCTS.BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
};

/**
 * Delete image from Supabase Storage
 */
const deleteProductImage = async (sku: string): Promise<void> => {
  try {
    // List all files with this SKU prefix
    const { data: files, error: listError } = await supabase.storage
      .from(STORAGE_PATHS.PRODUCTS.BUCKET)
      .list(STORAGE_PATHS.PRODUCTS.FOLDER, {
        search: sku
      });

    if (listError) {
      console.error("Error listing images:", listError);
      return;
    }

    if (files && files.length > 0) {
      const filesToDelete = files.map((file) =>
        STORAGE_PATHS.PRODUCTS.getFilePath(file.name)
      );
      const { error: deleteError } = await supabase.storage
        .from(STORAGE_PATHS.PRODUCTS.BUCKET)
        .remove(filesToDelete);

      if (deleteError) {
        console.error("Error removing images:", deleteError);
        return;
      }
    }
  } catch (error) {
    console.error("Error deleting image:", error);
  }
};

/**
 * Get product count
 */
const getProductCount = async (): Promise<number> => {
  return databaseService.getRecordCount("products");
};

/**
 * Check if product exists by ID
 */
const productExists = async (id: number): Promise<boolean> => {
  return databaseService.recordExists("products", { id });
};

/**
 * Product Supabase Service
 * Handles all database operations related to products using Supabase
 */
export const productService = {
  /**
   * Fetch all products
   */
  async getProducts(): Promise<Product[]> {
    const { data, error } = await productsTable()
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data || data.length === 0) return [];

    return data.map(mapToRow);
  },

  /**
   * Fetch a single product by ID
   */
  async getProductById(id: number): Promise<Product> {
    const { data, error } = await productsTable()
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching product:", error);
      if (error.code === "PGRST116") {
        throw new Error("Product not found");
      }
      throw new Error(handleSupabaseError(error));
    }

    if (!data) throw new Error("Product not found");

    return mapToRow(data);
  },

  /**
   * Create a new product with auto-generated SKU and image upload
   */
  async createProduct(
    formData: ProductFormData,
    imageFile?: File
  ): Promise<Product> {
    // Get next serial ID for this shop
    const serialId = await getNextSerialId(formData.shop_code);

    // Generate SKU
    const sku = generateSKU(formData.shop_code, serialId);

    // Upload image if provided
    let imageUrl = formData.image_url || "";
    if (imageFile) {
      imageUrl = await uploadProductImage(imageFile, sku);
    }

    const rawInsertData = {
      shop_code: formData.shop_code,
      sku,
      title: formData.title,
      etsy_url: formData.etsy_url,
      image_url: imageUrl,
      is_active: true
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const insertData = cleanInsertData(rawInsertData) as any;

    const { data, error } = await productsTable()
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Error creating product:", error);
      // Clean up uploaded image if product creation fails
      if (imageFile) {
        await deleteProductImage(sku);
      }
      throw new Error(handleSupabaseError(error));
    }

    if (!data) throw new Error("Failed to create product");

    return mapToRow(data);
  },

  /**
   * Update an existing product
   */
  async updateProduct(
    id: string,
    formData: Partial<ProductFormData>,
    imageFile?: File
  ): Promise<Product> {
    const numericId = parseInt(id, 10);

    // Get current product to access SKU
    const currentProduct = await this.getProductById(numericId);

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };

    if (formData.title !== undefined) updateData.title = formData.title;
    if (formData.etsy_url !== undefined)
      updateData.etsy_url = formData.etsy_url;

    // Upload new image if provided
    if (imageFile) {
      updateData.image_url = await uploadProductImage(
        imageFile,
        currentProduct.sku
      );
    } else if (formData.image_url !== undefined) {
      updateData.image_url = formData.image_url;
    }

    const { data, error } = await productsTable()
      .update(updateData)
      .eq("id", numericId)
      .select()
      .single();

    if (error) {
      console.error("Error updating product:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data) throw new Error("Failed to update product");

    return mapToRow(data);
  },

  /**
   * Delete a product and its image
   */
  async deleteProduct(id: string): Promise<void> {
    const numericId = parseInt(id, 10);

    // Get product to access SKU for image deletion
    const product = await this.getProductById(numericId);

    // Delete from database
    const { error } = await productsTable().delete().eq("id", numericId);

    if (error) {
      console.error("Error deleting product:", error);
      throw new Error(handleSupabaseError(error));
    }

    // Delete associated image
    await deleteProductImage(product.sku);
  },

  /**
   * Toggle product status (active/inactive)
   */
  async toggleProductStatus(id: string): Promise<Product> {
    const numericId = parseInt(id, 10);

    const { data: currentProduct, error: fetchError } = await productsTable()
      .select("is_active")
      .eq("id", numericId)
      .single();

    if (fetchError) {
      console.error("Error toggling product status:", fetchError);
      throw new Error(handleSupabaseError(fetchError));
    }

    if (!currentProduct) throw new Error("Product not found");

    const newStatus = !currentProduct.is_active;

    const { data, error } = await productsTable()
      .update({
        is_active: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", numericId)
      .select()
      .single();

    if (error) {
      console.error("Error toggling product status:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data) throw new Error("Failed to toggle status");

    return mapToRow(data);
  },

  /**
   * Search products
   */
  async searchProducts(query: string): Promise<Product[]> {
    const { data, error } = await productsTable()
      .select("*")
      .or(`title.ilike.%${query}%,sku.ilike.%${query}%`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error searching products:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data || data.length === 0) return [];

    return data.map(mapToRow);
  },

  /**
   * Bulk delete products
   */
  async bulkDeleteProducts(ids: number[]): Promise<void> {
    if (!ids || ids.length === 0) return;

    // Get all products to delete their images
    const { data: products, error: fetchError } = await productsTable()
      .select("sku")
      .in("id", ids);

    if (fetchError) {
      console.error("Error bulk deleting products:", fetchError);
      throw new Error(handleSupabaseError(fetchError));
    }

    // Delete from database
    const { error } = await productsTable().delete().in("id", ids);

    if (error) {
      console.error("Error bulk deleting products:", error);
      throw new Error(handleSupabaseError(error));
    }

    // Delete associated images
    if (products) {
      await Promise.all(products.map((p) => deleteProductImage(p.sku)));
    }
  },

  /**
   * Bulk update product status
   */
  async bulkUpdateStatus(ids: number[], is_active: boolean): Promise<void> {
    if (!ids || ids.length === 0) return;

    const { error } = await productsTable()
      .update({
        is_active,
        updated_at: new Date().toISOString()
      })
      .in("id", ids);

    if (error) {
      console.error("Error bulk updating status:", error);
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Export products to CSV (get all data for client-side export)
   */
  async exportProducts(): Promise<Product[]> {
    const { data, error } = await productsTable()
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error exporting products:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data || data.length === 0) return [];

    return data.map(mapToRow);
  },

  /**
   * Upload product image (utility function)
   */
  uploadImage: uploadProductImage,

  /**
   * Delete product image (utility function)
   */
  deleteImage: deleteProductImage,

  /**
   * Get total product count
   */
  async getProductCount(): Promise<number> {
    return getProductCount();
  },

  /**
   * Check if product exists by ID
   */
  async productExists(id: number): Promise<boolean> {
    return productExists(id);
  }
};

/**
 * Helper function to download products as CSV
 */
export const downloadProductsCSV = async (): Promise<void> => {
  const products = await productService.exportProducts();

  if (products.length === 0) {
    console.warn("No products to export");
    return;
  }

  const headers = [
    "ID",
    "Shop Code",
    "SKU",
    "Title",
    "Etsy URL",
    "Image URL",
    "Status",
    "Created At",
    "Updated At"
  ];
  const rows = products.map((p) => [
    p.id,
    p.shop_code,
    p.sku,
    p.title,
    p.etsy_url,
    p.image_url,
    p.is_active ? "active" : "inactive",
    p.created_at.toISOString(),
    p.updated_at.toISOString()
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `products-${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
