import api from './api'; // votre instance axios configurée

// Bases URL pour chaque ressource API
const BASE_CATEGORIES_URL = '/products/categories/';
const BASE_BRANDS_URL = '/products/brands/';
const BASE_PRODUCTS_URL = '/products/products/';
const BASE_PRODUCT_VARIANTS_URL = '/products/product-variants/';
const BASE_SPEC_CATEGORIES_URL = '/products/spec-categories/';
const BASE_SPEC_KEYS_URL = '/products/spec-keys/';
const BASE_PRODUCT_SPECIFICATIONS_URL = '/products/product-specifications/';
const BASE_PRODUCT_IMAGES_URL = '/products/product-images/';
const BASE_PRODUCT_DOCUMENTS_URL = '/products/product-documents/';
const BASE_RELATED_PRODUCTS_URL = '/related-products/';
const BASE_WAREHOUSES_URL = '/products/warehouses/';
const BASE_STOCK_LEVELS_URL = '/products/stock-levels/';
const BASE_STOCK_MOVEMENTS_URL = '/products/stock-movements/';

// --- Categories ---
export const fetchCategories = (params = {}) => api.get(BASE_CATEGORIES_URL, { params });
export const fetchCategoryById = (id) => api.get(`${BASE_CATEGORIES_URL}${id}/`);
export const createCategory = (data) => api.post(BASE_CATEGORIES_URL, data);
export const updateCategory = (id, data) => api.put(`${BASE_CATEGORIES_URL}${id}/`, data);
export const deleteCategory = (id) => api.delete(`${BASE_CATEGORIES_URL}${id}/`);

// --- Brands ---
export const fetchBrands = (params = {}) => api.get(BASE_BRANDS_URL, { params });
export const fetchBrandById = (id) => api.get(`${BASE_BRANDS_URL}${id}/`);
export const createBrand = (data) => api.post(BASE_BRANDS_URL, data);
export const updateBrand = (id, data) => api.put(`${BASE_BRANDS_URL}${id}/`, data);
export const deleteBrand = (id) => api.delete(`${BASE_BRANDS_URL}${id}/`);

// --- Products ---
export const fetchProducts = (params = {}) => api.get(BASE_PRODUCTS_URL, { params });
export const fetchProductById = (id) => api.get(`${BASE_PRODUCTS_URL}${id}/`);
export const createProduct = (data) => api.post(BASE_PRODUCTS_URL, data);
export const updateProduct = (id, data) => api.put(`${BASE_PRODUCTS_URL}${id}/`, data);
export const deleteProduct = (id) => api.delete(`${BASE_PRODUCTS_URL}${id}/`);

// --- Product Variants ---
export const fetchVariants = (params = {}) => api.get(BASE_PRODUCT_VARIANTS_URL, { params });
export const fetchVariantById = (id) => api.get(`${BASE_PRODUCT_VARIANTS_URL}${id}/`);
export const createVariant = (data) => api.post(BASE_PRODUCT_VARIANTS_URL, data);
export const updateVariant = (id, data) => api.put(`${BASE_PRODUCT_VARIANTS_URL}${id}/`, data);
export const deleteVariant = (id) => api.delete(`${BASE_PRODUCT_VARIANTS_URL}${id}/`);

// --- Spec Categories ---
export const fetchSpecCategories = (params = {}) => api.get(BASE_SPEC_CATEGORIES_URL, { params });
export const fetchSpecCategoryById = (id) => api.get(`${BASE_SPEC_CATEGORIES_URL}${id}/`);
export const createSpecCategory = (data) => api.post(BASE_SPEC_CATEGORIES_URL, data);
export const updateSpecCategory = (id, data) => api.put(`${BASE_SPEC_CATEGORIES_URL}${id}/`, data);
export const deleteSpecCategory = (id) => api.delete(`${BASE_SPEC_CATEGORIES_URL}${id}/`);

// --- Spec Keys ---
export const fetchSpecKeys = (params = {}) => api.get(BASE_SPEC_KEYS_URL, { params });
export const fetchSpecKeyById = (id) => api.get(`${BASE_SPEC_KEYS_URL}${id}/`);
export const createSpecKey = (data) => api.post(BASE_SPEC_KEYS_URL, data);
export const updateSpecKey = (id, data) => api.put(`${BASE_SPEC_KEYS_URL}${id}/`, data);
export const deleteSpecKey = (id) => api.delete(`${BASE_SPEC_KEYS_URL}${id}/`);

// --- Product Specifications ---
export const fetchProductSpecifications = (params = {}) => api.get(BASE_PRODUCT_SPECIFICATIONS_URL, { params });
export const fetchProductSpecificationById = (id) => api.get(`${BASE_PRODUCT_SPECIFICATIONS_URL}${id}/`);
export const createProductSpecification = (data) => api.post(BASE_PRODUCT_SPECIFICATIONS_URL, data);
export const updateProductSpecification = (id, data) => api.put(`${BASE_PRODUCT_SPECIFICATIONS_URL}${id}/`, data);
export const deleteProductSpecification = (id) => api.delete(`${BASE_PRODUCT_SPECIFICATIONS_URL}${id}/`);

// --- Product Images ---
export const fetchProductImages = (params = {}) => api.get(BASE_PRODUCT_IMAGES_URL, { params });
export const fetchProductImageById = (id) => api.get(`${BASE_PRODUCT_IMAGES_URL}${id}/`);
export const createProductImage = (data) => api.post(BASE_PRODUCT_IMAGES_URL, data);
export const updateProductImage = (id, data) => api.put(`${BASE_PRODUCT_IMAGES_URL}${id}/`, data);
export const deleteProductImage = (id) => api.delete(`${BASE_PRODUCT_IMAGES_URL}${id}/`);

// --- Product Documents ---
export const fetchProductDocuments = (params = {}) => api.get(BASE_PRODUCT_DOCUMENTS_URL, { params });
export const fetchProductDocumentById = (id) => api.get(`${BASE_PRODUCT_DOCUMENTS_URL}${id}/`);
export const createProductDocument = (data) => api.post(BASE_PRODUCT_DOCUMENTS_URL, data);
export const updateProductDocument = (id, data) => api.put(`${BASE_PRODUCT_DOCUMENTS_URL}${id}/`, data);
export const deleteProductDocument = (id) => api.delete(`${BASE_PRODUCT_DOCUMENTS_URL}${id}/`);

// --- Related Products ---
export const fetchRelatedProducts = (params = {}) => api.get(BASE_RELATED_PRODUCTS_URL, { params });
export const fetchRelatedProductById = (id) => api.get(`${BASE_RELATED_PRODUCTS_URL}${id}/`);
export const createRelatedProduct = (data) => api.post(BASE_RELATED_PRODUCTS_URL, data);
export const updateRelatedProduct = (id, data) => api.put(`${BASE_RELATED_PRODUCTS_URL}${id}/`, data);
export const deleteRelatedProduct = (id) => api.delete(`${BASE_RELATED_PRODUCTS_URL}${id}/`);

// --- Warehouses ---
export const fetchWarehouses = (params = {}) => api.get(BASE_WAREHOUSES_URL, { params });
export const fetchWarehouseById = (id) => api.get(`${BASE_WAREHOUSES_URL}${id}/`);
export const createWarehouse = (data) => api.post(BASE_WAREHOUSES_URL, data);
export const updateWarehouse = (id, data) => api.put(`${BASE_WAREHOUSES_URL}${id}/`, data);
export const deleteWarehouse = (id) => api.delete(`${BASE_WAREHOUSES_URL}${id}/`);

// --- Stock Levels ---
export const fetchStockLevels = (params = {}) => api.get(BASE_STOCK_LEVELS_URL, { params });
export const fetchStockLevelById = (id) => api.get(`${BASE_STOCK_LEVELS_URL}${id}/`);
export const createStockLevel = (data) => api.post(BASE_STOCK_LEVELS_URL, data);
export const updateStockLevel = (id, data) => api.put(`${BASE_STOCK_LEVELS_URL}${id}/`, data);
export const deleteStockLevel = (id) => api.delete(`${BASE_STOCK_LEVELS_URL}${id}/`);

// --- Stock Movements ---
export const fetchStockMovements = (params = {}) => api.get(BASE_STOCK_MOVEMENTS_URL, { params });
export const fetchStockMovementById = (id) => api.get(`${BASE_STOCK_MOVEMENTS_URL}${id}/`);
export const createStockMovement = (data) => api.post(BASE_STOCK_MOVEMENTS_URL, data);
export const updateStockMovement = (id, data) => api.put(`${BASE_STOCK_MOVEMENTS_URL}${id}/`, data);
export const deleteStockMovement = (id) => api.delete(`${BASE_STOCK_MOVEMENTS_URL}${id}/`);
