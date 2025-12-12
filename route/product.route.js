import { Router } from 'express'
import auth from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';
import {createProduct, createProductRAMS, createProductSize, createProductWeight, deleteMultipleProducts, 
        deleteProduct, deleteProductRAMS, deleteProductSize, deleteProducWeight, filters, getAllFeaturedProducts, 
        getAllProducts, getAllProductsByCatId, getAllProductsByCatName, getAllProductsByPrice, 
        getAllProductsByRating, getAllProductsBySubCatId, getAllProductsBySubCatName, getAllProductsByThirdLavelCatId, 
        getProduct, getProductRams, getProductRamsById, getProductsCount, getProductSize, getProductSizeById, 
        getProductWeight, getProductWeightById, searchProductController, sortBy, updateProduct, updateProductRam, 
        updateProductSize, updateProductWeight, uploadBannerImages, uploadImages} from '../controllers/product.controller.js';

import { removeImageFromCloudinary } from '../controllers/category.controller.js';

const productRouter = Router();

productRouter.post('/uploadImages',auth, upload.array('images'),uploadImages);
productRouter.post('/uploadBannerImages', auth, upload.array('bannerimages'), uploadBannerImages);

productRouter.post('/create', auth, createProduct);
productRouter.get('/getAllProducts', getAllProducts);
productRouter.get('/getAllProductsByCatId/:id', getAllProductsByCatId);
productRouter.get('/getAllProductsByCatName', getAllProductsByCatName);
productRouter.get('/getAllProductsBySubCatId/:id', getAllProductsBySubCatId);
productRouter.get('/getAllProductsBySubCatName', getAllProductsBySubCatName);
productRouter.get('/getAllProductsByThirdLavelCat/:id', getAllProductsByThirdLavelCatId);
productRouter.get('/getAllProductsByThirdLavelCatName', getAllProductsBySubCatName);
productRouter.get('/getAllProductsByPrice', getAllProductsByPrice);
productRouter.get('/getAllProductsByRating', getAllProductsByRating);
productRouter.get('/getAllProductsCount', getProductsCount);
productRouter.get('/getAllFeaturedProducts', getAllFeaturedProducts);
productRouter.delete('/deleteMultiple', deleteMultipleProducts); // phải đặt trước xóa 1 mục [ deleteProduct ]
productRouter.delete('/:id', deleteProduct);
productRouter.get('/:id', getProduct);
productRouter.delete('/deleteImage', auth, removeImageFromCloudinary);
productRouter.put('/updateProduct/:id', auth, updateProduct);

productRouter.post('/productRAMS/create', auth, createProductRAMS);
productRouter.delete('/productRAMS/:id', deleteProductRAMS);
productRouter.put('/productRAMS/:id', auth, updateProductRam);
productRouter.get('/productRAMS/get', getProductRams);
productRouter.get('/productRAMS/:id', getProductRamsById);

productRouter.post('/productWeight/create',auth,createProductWeight);
productRouter.delete('/productWeight/:id',deleteProducWeight);
productRouter.put('/productWeight/:id',auth,updateProductWeight);
productRouter.get('/productWeight/get',getProductWeight);
productRouter.get('/productWeight/:id',getProductWeightById);

productRouter.post('/productSize/create',auth,createProductSize);
productRouter.delete('/productSize/:id',deleteProductSize);
productRouter.put('/productSize/:id',auth,updateProductSize);
productRouter.get('/productSize/get',getProductSize);
productRouter.get('/productSize/:id',getProductSizeById);

productRouter.post('/filters', filters);

productRouter.post('/sortBy', sortBy);

productRouter.post('/search/get', searchProductController);


export default productRouter;