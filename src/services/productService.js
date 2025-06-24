import api from './api'; // Instance Axios configurée avec baseURL et gestion du token

// --- Brands ---
export const fetchBrands = () => api.get('/brands/');
export const fetchBrand = (id) => api.get(`/brands/${id}/`);
export const createBrand = (data) => api.post('/brands/', data);
export const updateBrand = (id, data) => api.put(`/brands/${id}/`, data);
export const deleteBrand = (id) => api.delete(`/brands/${id}/`);

// --- Categories ---
export const fetchCategories = () => api.get('/categories/');
export const fetchCategory = (id) => api.get(`/categories/${id}/`);
export const createCategory = (data) => api.post('/categories/', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}/`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}/`);

// --- Product Types ---
export const fetchProductTypes = () => api.get('/product-types/');
export const fetchProductType = (id) => api.get(`/product-types/${id}/`);
export const createProductType = (data) => api.post('/product-types/', data);
export const updateProductType = (id, data) => api.put(`/product-types/${id}/`, data);
export const deleteProductType = (id) => api.delete(`/product-types/${id}/`);

// --- Product Attributes ---
export const fetchProductAttributes = () => api.get('/product-attributes/');
export const fetchProductAttribute = (id) => api.get(`/product-attributes/${id}/`);
export const createProductAttribute = (data) => api.post('/product-attributes/', data);
export const updateProductAttribute = (id, data) => api.put(`/product-attributes/${id}/`, data);
export const deleteProductAttribute = (id) => api.delete(`/product-attributes/${id}/`);

// --- Product Attribute Values ---
export const fetchProductAttributeValues = () => api.get('/product-attribute-values/');
export const fetchProductAttributeValue = (id) => api.get(`/product-attribute-values/${id}/`);
export const createProductAttributeValue = (data) => api.post('/product-attribute-values/', data);
export const updateProductAttributeValue = (id, data) => api.put(`/product-attribute-values/${id}/`, data);
export const deleteProductAttributeValue = (id) => api.delete(`/product-attribute-values/${id}/`);

// --- Product Type Attributes ---
export const fetchProductTypeAttributes = () => api.get('/product-type-attributes/');
export const fetchProductTypeAttribute = (id) => api.get(`/product-type-attributes/${id}/`);
export const createProductTypeAttribute = (data) => api.post('/product-type-attributes/', data);
export const updateProductTypeAttribute = (id, data) => api.put(`/product-type-attributes/${id}/`, data);
export const deleteProductTypeAttribute = (id) => api.delete(`/product-type-attributes/${id}/`);

// --- Products ---
export const fetchProducts = () => api.get('/products/');
export const fetchProduct = (id) => api.get(`/products/${id}/`);
export const createProduct = (data) => api.post('/products/', data);
export const updateProduct = (id, data) => api.put(`/products/${id}/`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}/`);

// --- Product Inventories (Variantes) ---
export const fetchProductInventories = () => api.get('/product-inventories/');
export const fetchProductInventory = (id) => api.get(`/product-inventories/${id}/`);
export const createProductInventory = (data) => api.post('/product-inventories/', data);
export const updateProductInventory = (id, data) => api.put(`/product-inventories/${id}/`, data);
export const deleteProductInventory = (id) => api.delete(`/product-inventories/${id}/`);

// --- Product Attribute Values Links (liaisons attributs ↔ variantes) ---
export const fetchProductAttributeValuesLinks = () => api.get('/product-attribute-values-links/');
export const fetchProductAttributeValuesLink = (id) => api.get(`/product-attribute-values-links/${id}/`);
export const createProductAttributeValuesLink = (data) => api.post('/product-attribute-values-links/', data);
export const updateProductAttributeValuesLink = (id, data) => api.put(`/product-attribute-values-links/${id}/`, data);
export const deleteProductAttributeValuesLink = (id) => api.delete(`/product-attribute-values-links/${id}/`);

// --- Media ---
export const fetchMedia = () => api.get('/media/');
export const fetchMediaItem = (id) => api.get(`/media/${id}/`);
export const createMedia = (data) => api.post('/media/', data);
export const updateMedia = (id, data) => api.put(`/media/${id}/`, data);
export const deleteMedia = (id) => api.delete(`/media/${id}/`);

// --- Stock ---
export const fetchStocks = () => api.get('/stocks/');
export const fetchStock = (id) => api.get(`/stocks/${id}/`);
export const createStock = (data) => api.post('/stocks/', data);
export const updateStock = (id, data) => api.put(`/stocks/${id}/`, data);
export const deleteStock = (id) => api.delete(`/stocks/${id}/`);

// --- Section Specifications ---
export const fetchSectionSpecifications = () => api.get('/section-specifications/');
export const fetchSectionSpecification = (id) => api.get(`/section-specifications/${id}/`);
export const createSectionSpecification = (data) => api.post('/section-specifications/', data);
export const updateSectionSpecification = (id, data) => api.put(`/section-specifications/${id}/`, data);
export const deleteSectionSpecification = (id) => api.delete(`/section-specifications/${id}/`);

// --- Cle Specifications ---
export const fetchCleSpecifications = () => api.get('/cle-specifications/');
export const fetchCleSpecification = (id) => api.get(`/cle-specifications/${id}/`);
export const createCleSpecification = (data) => api.post('/cle-specifications/', data);
export const updateCleSpecification = (id, data) => api.put(`/cle-specifications/${id}/`, data);
export const deleteCleSpecification = (id) => api.delete(`/cle-specifications/${id}/`);

// --- Produit Specifications ---
export const fetchProduitSpecifications = () => api.get('/produit-specifications/');
export const fetchProduitSpecification = (id) => api.get(`/produit-specifications/${id}/`);
export const createProduitSpecification = (data) => api.post('/produit-specifications/', data);
export const updateProduitSpecification = (id, data) => api.put(`/produit-specifications/${id}/`, data);
export const deleteProduitSpecification = (id) => api.delete(`/produit-specifications/${id}/`);
