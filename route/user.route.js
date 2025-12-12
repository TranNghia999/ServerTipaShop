import { Router } from 'express'
import { addReview, authWithGoogle, deleteMultiple, forgotPasswordController, getAllReviews, getAllUsers, getReview, loginUserController, logoutController, refreshToken, registerUserController, removeImageFromCloudinary, resetpassword, updateUserDetails, userAvatarController, userDetails, verifyEmailController, verifyForgotPasswordOtp} from '../controllers/user.controller.js';
import auth from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';


// Các Tuyến đường kết nối của người dùng
const userRouter = Router()

userRouter.post('/register', registerUserController)
userRouter.post('/verifyEmail', verifyEmailController)
userRouter.post('/login', loginUserController)
userRouter.post('/authWithGoogle', authWithGoogle)
userRouter.get('/logout',auth, logoutController)
userRouter.put('/user-avatar',auth,upload.array('avatar'), userAvatarController)
userRouter.delete("/deleteImage", auth, removeImageFromCloudinary);
userRouter.put('/:id', auth, updateUserDetails);
userRouter.post('/forgot-password', forgotPasswordController)
userRouter.post('/verify-forgot-password-otp', verifyForgotPasswordOtp)
userRouter.post('/reset-password', resetpassword)
userRouter.post('/refresh-token', refreshToken)
userRouter.get('/user-details',auth,userDetails);
userRouter.post('/addReview',auth,addReview);
userRouter.get('/getReview',getReview);
userRouter.get('/getAllReviews', getAllReviews);
userRouter.get('/getAllUsers', getAllUsers);
userRouter.delete('/deleteMultiple', deleteMultiple);

 
export default userRouter;