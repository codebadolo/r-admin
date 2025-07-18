// src/services/productService.js
import api from './api';

//
// ============ PRODUCT CRUD ============
//

// List all products (accepts optional search/filter params)
export function fetchProducts(params) {
  return api.get('/products/', { params }).then(res => res.data);
}

// Get a single product by ID
export function fetchProduct(id) {
  return api.get(`/products/${id}/`).then(res => res.data);
}

// Create new product
export function createProduct(data) {
  return api.post('/products/', data).then(res => res.data);
}

// Update product (PUT, full update)
export function updateProduct(id, data) {
  return api.put(`/products/${id}/`, data).then(res => res.data);
}

// Partially update product (PATCH)
export function patchProduct(id, data) {
  return api.patch(`/products/${id}/`, data).then(res => res.data);
}

// Delete a product
export function deleteProduct(id) {
  return api.delete(`/products/${id}/`).then(res => res.data);
}

//
// ============ CATEGORY CRUD ============
//

export function fetchCategories() {
  return api.get('/categories/').then(res => res.data);
}

export function fetchCategory(id) {
  return api.get(`/categories/${id}/`).then(res => res.data);
}

export function createCategory(data) {
  return api.post('/categories/', data).then(res => res.data);
}

export function updateCategory(id, data) {
  return api.put(`/categories/${id}/`, data).then(res => res.data);
}

export function patchCategory(id, data) {
  return api.patch(`/categories/${id}/`, data).then(res => res.data);
}

export function deleteCategory(id) {
  return api.delete(`/categories/${id}/`).then(res => res.data);
}

//
// ============ BRAND CRUD ============
//

export function fetchBrands() {
  return api.get('/brands/').then(res => res.data);
}

export function fetchBrand(id) {
  return api.get(`/brands/${id}/`).then(res => res.data);
}

export function createBrand(data) {
  return api.post('/brands/', data).then(res => res.data);
}

export function updateBrand(id, data) {
  return api.put(`/brands/${id}/`, data).then(res => res.data);
}

export function patchBrand(id, data) {
  return api.patch(`/brands/${id}/`, data).then(res => res.data);
}

export function deleteBrand(id) {
  return api.delete(`/brands/${id}/`).then(res => res.data);
}

//
// ============ PRODUCT TYPE CRUD ============
//

export function fetchProductTypes() {
  return api.get('/types/').then(res => res.data);
}

export function fetchProductType(id) {
  return api.get(`/types/${id}/`).then(res => res.data);
}

export function createProductType(data) {
  return api.post('/types/', data).then(res => res.data);
}

export function updateProductType(id, data) {
  return api.put(`/types/${id}/`, data).then(res => res.data);
}

export function patchProductType(id, data) {
  return api.patch(`/types/${id}/`, data).then(res => res.data);
}

export function deleteProductType(id) {
  return api.delete(`/types/${id}/`).then(res => res.data);
}

//
// ============ PRODUCT ATTRIBUTE CRUD ============
//

export function fetchProductAttributes() {
  return api.get('/attributes/').then(res => res.data);
}
export function fetchProductAttributeOptions() {
  return api.get('/attribute-options/').then(res => res.data);
}

export function fetchProductAttribute(id) {
  return api.get(`/attributes/${id}/`).then(res => res.data);
}

export function createProductAttribute(data) {
  return api.post('/attributes/', data).then(res => res.data);
}

export function updateProductAttribute(id, data) {
  return api.put(`/attributes/${id}/`, data).then(res => res.data);
}

export function patchProductAttribute(id, data) {
  return api.patch(`/attributes/${id}/`, data).then(res => res.data);
}

export function deleteProductAttribute(id) {
  return api.delete(`/attributes/${id}/`).then(res => res.data);
}

//
// ============ PRODUCT ATTRIBUTE VALUE CRUD ============
//

export function fetchProductAttributeValues(params) {
  // params: { attribute, product, etc } for filtering if needed
  return api.get('/attribute-values/', { params }).then(res => res.data);
}

export function fetchProductAttributeValue(id) {
  return api.get(`/attribute-values/${id}/`).then(res => res.data);
}

export function createProductAttributeValue(data) {
  return api.post('/attribute-values/', data).then(res => res.data);
}

export function updateProductAttributeValue(id, data) {
  return api.put(`/attribute-values/${id}/`, data).then(res => res.data);
}

export function patchProductAttributeValue(id, data) {
  return api.patch(`/attribute-values/${id}/`, data).then(res => res.data);
}

export function createProductAttributeOption(data) {
  // data attendue: { attribute: id, value: string }
  return api.post('/attribute-options/', data).then(res => res.data);
}
export function deleteProductAttributeValue(id) {
  return api.delete(`/attribute-values/${id}/`).then(res => res.data);
}

//
// ============ STOCK CRUD ============
//

export function fetchStocks(params) {
  return api.get('/stocks/', { params }).then(res => res.data);
}

export function fetchStock(id) {
  return api.get(`/stocks/${id}/`).then(res => res.data);
}

export function createStock(data) {
  return api.post('/stocks/', data).then(res => res.data);
}

export function updateStock(id, data) {
  return api.put(`/stocks/${id}/`, data).then(res => res.data);
}

export function patchStock(id, data) {
  return api.patch(`/stocks/${id}/`, data).then(res => res.data);
}

export function deleteStock(id) {
  return api.delete(`/stocks/${id}/`).then(res => res.data);
}

//
// ============ PRODUCT IMAGE CRUD ============
//

export function fetchProductImages(params) {
  return api.get('/images/', { params }).then(res => res.data);
}

export function fetchProductImage(id) {
  return api.get(`/images/${id}/`).then(res => res.data);
}


export function createProductImage(formData) {
  // Ne PAS fixer headers 'Content-Type', axios s'en charge automatiquement
  return api.post('/images/', formData);
}

export function updateProductImage(id, data) {
  // data: usually FormData for image update
  return api.put(`/images/${id}/`, data).then(res => res.data);
}

export function patchProductImage(id, data) {
  return api.patch(`/images/${id}/`, data).then(res => res.data);
}

export function deleteProductImage(id) {
  return api.delete(`/images/${id}/`).then(res => res.data);
}

//
// ============ WAREHOUSE CRUD ============
//

export function fetchWarehouses() {
  return api.get('/warehouses/').then(res => res.data);
}

export function fetchWarehouse(id) {
  return api.get(`/warehouses/${id}/`).then(res => res.data);
}

export function createWarehouse(data) {
  return api.post('/warehouses/', data).then(res => res.data);
}

export function updateWarehouse(id, data) {
  return api.put(`/warehouses/${id}/`, data).then(res => res.data);
}

export function patchWarehouse(id, data) {
  return api.patch(`/warehouses/${id}/`, data).then(res => res.data);
}

export function deleteWarehouse(id) {
  return api.delete(`/warehouses/${id}/`).then(res => res.data);
}
