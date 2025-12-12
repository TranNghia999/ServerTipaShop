import { Router } from 'express';
//đăng nhập
import auth from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';
import { removeImageFromCloudinary } from '../controllers/category.controller.js';
import { addBannerV2, deleteBannerV2, getBannersV2, getBannerV2, updatedBannerV2, uploadImages } from '../controllers/bannerV2.controller.js';

const bannerV2Router = Router();

bannerV2Router.post('/uploadImages',auth,upload.array('images'), uploadImages);
bannerV2Router.post('/add',auth,addBannerV2);
bannerV2Router.get('/', getBannersV2);
bannerV2Router.get('/:id', getBannerV2);
bannerV2Router.delete('/deleteImage', auth, removeImageFromCloudinary);
bannerV2Router.delete('/:id',auth, deleteBannerV2);
bannerV2Router.put('/:id',auth,updatedBannerV2);


export default bannerV2Router;