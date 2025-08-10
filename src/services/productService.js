import api from './api'; // Adaptez le chemin si nécessaire

const productService = {
  // Categories
  getCategories: (params = {}) => api.get('products/categories/', { params }),
  getCategoryById: (id) => api.get(`categories/${id}/`),
  createCategory: (data) => api.post('categories/', data),
  updateCategory: (id, data) => api.put(`categories/${id}/`, data),
  deleteCategory: (id) => api.delete(`categories/${id}/`),

  // Brands (Marques)
  getBrands: (params = {}) => api.get('products/brands/', { params }),
  getBrandById: (id) => api.get(`products/brands/${id}/`),
  createBrand: (data) => api.post('brands/', data),
  updateBrand: (id, data) => api.put(`brands/${id}/`, data),
  deleteBrand: (id) => api.delete(`brands/${id}/`),

  // Products (Produits)
  getProducts: (params = {}) => api.get('products/', { params }),
  getProductById: (id) => api.get(`products/${id}/`),
  createProduct: (data) => api.post('products/', data),
  updateProduct: (id, data) => api.put(`products/${id}/`, data),
  deleteProduct: (id) => api.delete(`products/${id}/`),

  // Product Variants (Variantes)
  getVariants: (params = {}) => api.get('product-variants/', { params }),
  getVariantById: (id) => api.get(`product-variants/${id}/`),
  createVariant: (data) => api.post('product-variants/', data),
  updateVariant: (id, data) => api.put(`product-variants/${id}/`, data),
  deleteVariant: (id) => api.delete(`product-variants/${id}/`),

  // Spec Categories (Catégories de spécifications)
  getSpecCategories: (params = {}) => api.get('spec-categories/', { params }),
  getSpecCategoryById: (id) => api.get(`spec-categories/${id}/`),
  createSpecCategory: (data) => api.post('spec-categories/', data),
  updateSpecCategory: (id, data) => api.put(`spec-categories/${id}/`, data),
  deleteSpecCategory: (id) => api.delete(`spec-categories/${id}/`),

  // Spec Keys (Clés de spécifications)
  getSpecKeys: (params = {}) => api.get('spec-keys/', { params }),
  getSpecKeyById: (id) => api.get(`spec-keys/${id}/`),
  createSpecKey: (data) => api.post('spec-keys/', data),
  updateSpecKey: (id, data) => api.put(`spec-keys/${id}/`, data),
  deleteSpecKey: (id) => api.delete(`spec-keys/${id}/`),

  // Product Specifications (Spécifications produits)
  getProductSpecifications: (params = {}) => api.get('product-specifications/', { params }),
  getProductSpecificationById: (id) => api.get(`product-specifications/${id}/`),
  createProductSpecification: (data) => api.post('product-specifications/', data),
  updateProductSpecification: (id, data) => api.put(`product-specifications/${id}/`, data),
  deleteProductSpecification: (id) => api.delete(`product-specifications/${id}/`),

  // Product Images (Images produit)
  getProductImages: (params = {}) => api.get('product-images/', { params }),
  getProductImageById: (id) => api.get(`product-images/${id}/`),
  createProductImage: (data) => api.post('product-images/', data),
  updateProductImage: (id, data) => api.put(`product-images/${id}/`, data),
  deleteProductImage: (id) => api.delete(`product-images/${id}/`),

  // Product Documents (Documents produit)
  getProductDocuments: (params = {}) => api.get('product-documents/', { params }),
  getProductDocumentById: (id) => api.get(`product-documents/${id}/`),
  createProductDocument: (data) => api.post('product-documents/', data),
  updateProductDocument: (id, data) => api.put(`product-documents/${id}/`, data),
  deleteProductDocument: (id) => api.delete(`product-documents/${id}/`),

  // Related Products (Produits liés)
  getRelatedProducts: (params = {}) => api.get('related-products/', { params }),
  getRelatedProductById: (id) => api.get(`related-products/${id}/`),
  createRelatedProduct: (data) => api.post('related-products/', data),
  updateRelatedProduct: (id, data) => api.put(`related-products/${id}/`, data),
  deleteRelatedProduct: (id) => api.delete(`related-products/${id}/`),

  // Warehouses (Entrepôts)
  getWarehouses: (params = {}) => api.get('warehouses/', { params }),
  getWarehouseById: (id) => api.get(`warehouses/${id}/`),
  createWarehouse: (data) => api.post('warehouses/', data),
  updateWarehouse: (id, data) => api.put(`warehouses/${id}/`, data),
  deleteWarehouse: (id) => api.delete(`warehouses/${id}/`),

  // Stock Levels (Niveaux de stock)
  getStockLevels: (params = {}) => api.get('stock-levels/', { params }),
  getStockLevelById: (id) => api.get(`stock-levels/${id}/`),
  createStockLevel: (data) => api.post('stock-levels/', data),
  updateStockLevel: (id, data) => api.put(`stock-levels/${id}/`, data),
  deleteStockLevel: (id) => api.delete(`stock-levels/${id}/`),

  // Stock Movements (Mouvements de stock)
  getStockMovements: (params = {}) => api.get('stock-movements/', { params }),
  getStockMovementById: (id) => api.get(`stock-movements/${id}/`),
  createStockMovement: (data) => api.post('stock-movements/', data),
  updateStockMovement: (id, data) => api.put(`stock-movements/${id}/`, data),
  deleteStockMovement: (id) => api.delete(`stock-movements/${id}/`),
};

export default productService;
