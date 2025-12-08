import { Router } from 'express';
//đăng nhập
import auth from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';
import { addHomeSlide, deleteMultipleSlide, deleteSlide, getHomeSlides, getSlide, removeImageFromCloudinary, updatedSlide, uploadImages } from '../controllers/homeSlider.controller.js';

const homeSlidesRouter = Router();

homeSlidesRouter.post('/uploadImages',auth,upload.array('images'), uploadImages);
homeSlidesRouter.post('/add',auth,addHomeSlide);
homeSlidesRouter.get('/', getHomeSlides);
homeSlidesRouter.get('/:id', getSlide );
homeSlidesRouter.delete('/deleteImage', auth, removeImageFromCloudinary);
homeSlidesRouter.delete('/deleteMultiple', deleteMultipleSlide);
homeSlidesRouter.delete('/:id', deleteSlide);
homeSlidesRouter.put('/:id',auth,updatedSlide);


export default homeSlidesRouter;