 // Các Thư Viện
import UserModel from "../models/user.model.js";
import ReviewModel from "../models/reviews.model.js";

import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import streamifier from "streamifier";

// Các Hàm Thêm
import sendEmailFun from "../config/sendEmail.js";
import VerificationEmail from "../utils/verifyEmailTemplate.js";
import generatedAccessToken from "../utils/generatedAccessToken.js";
import generterdRefreshToken from "../utils/generatedRefreshToken.js";

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});


export async function registerUserController(request, response) {
  try {
    let user;

    const { name, email, password } = request.body;
    if (!name || !email || !password) {
      return response.status(400).json({
        message: "Vui lòng cung cấp email, tên, mật khẩu",
        error: true,
        success: false,
      });
    }

    const isStrongPassword = (password) => {
      const strongPasswordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      return strongPasswordRegex.test(password);
    };

    if (!isStrongPassword(password)) {
      return response.status(400).json({
        message:
          "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.",
        error: true,
        success: false,
      });
    }

    user = await UserModel.findOne({ email: email });

    if (user) {
      return response.json({
        message: "Người dùng đã đăng ký với email này",
        error: true,
        success: false,
      });
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);

    user = new UserModel({
      email: email,
      password: hashPassword,
      name: name,
      otp: verifyCode,
      otpExpires: Date.now() + 180000,
    });

    await user.save();


      const emailResult = await sendEmailFun(
        email,
          "Tipashop – Mã xác minh OTP",
        "",
        VerificationEmail(name, verifyCode)
      );

      if (!emailResult?.success) {
        return response.status(500).json({
          message: "Không gửi được OTP, vui lòng thử lại sau.",
          error: true,
          success: false,
        });
      }

    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JSON_WEB_TOKEN_SECRET_KEY
    );

    return response.status(200).json({
      success: true,
      error: false,
      message:
        "Người dùng đã đăng ký thành công! Vui lòng xác minh email của bạn.",
      token: token, // Optional: include this if needed for verification
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}
export async function verifyEmailController(request, response) {
  try {
    const { email, otp } = request.body;

    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return response.status(400).json({
        error: true,
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }
    const isCodeValid = user.otp === otp;
    const isNotExpired = user.otpExpires > Date.now();

    if (isCodeValid && isNotExpired) {
      user.verify_email = true;
      user.otp = null;
      user.otpExpires = null;
      await user.save();
      return response.status(200).json({
        error: false,
        success: true,
        message: "Email đã được xác minh thành công",
      });
    } else if (!isCodeValid) {
      return response
        .status(400)
        .json({ error: true, success: false, message: "OTP không hợp lệ" });
    } else {
      return response
        .status(400)
        .json({ error: true, success: false, message: "OTP đã hết hạn" });
    }
  } catch (error) {
    return response.status(500).json({
      message: "cung cấp email, tên, mật khẩu",
      error: true,
      success: false,
    });
  }
}

export async function loginUserController(request, response) {
  try {
    const { email, password } = request.body;

    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return response.status(400).json({
        message: "Người dùng không đăng ký",
        error: true,
        success: false,
      });
    }
    if (user.status !== "Active") {
      return response.status(400).json({
        message: "Liên hệ với quản trị viên",
        error: true,
        success: false,
      });
    }

    if (user.verify_email !== true) {
      return response.status(400).json({
        message: "Vui lòng hãy xác minh email của bạn",
        error: true,
        success: false,
      });
    }

    const checkPassword = await bcryptjs.compare(password, user.password);

    if (!checkPassword) {
      return response.status(400).json({
        message: "Kiểm tra mật khẩu của bạn",
        error: true,
        success: false,
      });
    }
    const accessToken = await generatedAccessToken(user._id);
    const refreshToken = await generterdRefreshToken(user._id);

    const updateUser = await UserModel.findByIdAndUpdate(user?._id, {
      last_login_date: new Date(),
    });

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };
    response.cookie("accessToken", accessToken, cookiesOption);
    response.cookie("refreshToken", refreshToken, cookiesOption);

    return response.json({
      message: "Đăng nhập thành công",
      error: false,
      success: true,
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function logoutController(request, response) {
  try {
    const userId = request.userId; // middleware

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    response.clearCookie("accessToken", cookiesOption);
    response.clearCookie("refreshToken", cookiesOption);

    const removeRefreshToken = await UserModel.findByIdAndUpdate(userId, {
      refresh_token: "",
    });

    return response.json({
      message: "Đăng xuất thành công",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function authWithGoogle(request, response) {
  const { name, email, password, avatar, mobile, role } = request.body;

  try {
    const existingUser = await UserModel.findOne({ email: email });

    if (!existingUser) {
      const user = await UserModel.create({
        name: name,
        email: email,
        password: "null",
        avatar: avatar,
        mobile: mobile,
        role: role,
        verify_email: true,
        signUpWithGoogle: true,
      });

      await user.save();

      const accessToken = await generatedAccessToken(user._id);
      const refreshToken = await generterdRefreshToken(user._id);

      await UserModel.findByIdAndUpdate(user?._id, {
        last_login_date: new Date(),
      });

      const cookiesOption = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      };
      response.cookie("accessToken", accessToken, cookiesOption);
      response.cookie("refreshToken", refreshToken, cookiesOption);

      return response.json({
        message: "Đăng nhập thành công",
        error: false,
        success: true,
        data: {
          accessToken,
          refreshToken,
        },
      });
    } else {
      const accessToken = await generatedAccessToken(existingUser._id);
      const refreshToken = await generterdRefreshToken(existingUser._id);

      await UserModel.findByIdAndUpdate(existingUser?._id, {
        last_login_date: new Date(),
      });

      const cookiesOption = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      };
      response.cookie("accessToken", accessToken, cookiesOption);
      response.cookie("refreshToken", refreshToken, cookiesOption);

      return response.json({
        message: "Đăng nhập thành công",
        error: false,
        success: true,
        data: {
          accessToken,
          refreshToken,
        },
      });
    }
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}


 export async function userAvatarController(req, res) {
     try {
         const userId = req.userId;
         const files = req.files;

         if (!files || files.length === 0) {
             return res.status(400).json({
                 message: "Không có ảnh được tải lên",
                 error: true,
                 success: false,
             });
         }

         const user = await UserModel.findById(userId);
         if (!user) {
             return res.status(404).json({
                 message: "Không tìm thấy người dùng",
                 error: true,
                 success: false,
             });
         }

         const file = files[0];

         if (!file.mimetype.startsWith("image/")) {
             return res.status(400).json({
                 message: "File không phải hình ảnh",
                 error: true,
                 success: false,
             });
         }

         const avatarUrl = await new Promise((resolve, reject) => {
             const stream = cloudinary.uploader.upload_stream(
                 {
                     folder: "avatars",
                     public_id: userId.toString(),
                     overwrite: true,
                     resource_type: "image",
                 },
                 (error, result) => {
                     if (error) return reject(error);
                     resolve(result.secure_url);
                 }
             );

             streamifier.createReadStream(file.buffer).pipe(stream);
         });

         user.avatar = avatarUrl;
         await user.save();

         return res.status(200).json({
             _id: userId,
             avatar: avatarUrl,
             error: false,
             success: true,
         });

     } catch (error) {
         console.error("AVATAR UPLOAD ERROR:", error);
         return res.status(500).json({
             message: error.message || "Upload avatar failed",
             error: true,
             success: false,
         });
     }
 }



 export async function removeImageFromCloudinary(request, response) {
  const imgUrl = request.query.img;

  const urlArr = imgUrl.split("/");
  const image = urlArr[urlArr.length - 1];

  const imageName = image.split(".")[0];

  if (imageName) {
    const res = await cloudinary.uploader.destroy(
      imageName,
      (error, result) => {
        // console.log(error, res)
      }
    );
  }
}


export async function updateUserDetails(request, response) {
  try {
    const userId = request.userId; //auth middleware
    const { name, email, mobile, password } = request.body;

    const userExist = await UserModel.findById(userId);
    if (!userExist)
      return response.status(400).send("The user cannot be Updated!");

    // Thời gian gởi lại otp
    const updateUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        name: name,
        mobile: mobile,
        email: email
      },
      { new: true }
    );

    if (email !== userExist.email) {
      // gửi-xác-thực-email
      await sendEmailFun(
        email,
        "Xác minh email từ trang web thương mại điện tử",
        "",
        VerificationEmail(name, verifyCode)
      );
    }

    return response.json({
      message: "Người dùng được cập nhật thành công",
      error: false,
      success: true,
      user: {
        name: updateUser?.name,
        _id: updateUser?._id,
        email: updateUser?.email,
        mobile: updateUser?.mobile,
        avatar: updateUser?.avatar,
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}


export async function forgotPasswordController(request, response) {
  try {
    const { email } = request.body;

    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return response.status(400).json({
        message: "Email không có sẵn",
        error: true,
        success: false,
      });
    } else {
      let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

      user.otp = verifyCode;
      user.otpExpires = Date.now() + 600000;

      await user.save();

      // gửi-xác-thực-email
      await sendEmailFun(
        email,
        "Xác minh OTP từ trang thương mại điện tử của bạn",
        "",
        VerificationEmail(user.name, verifyCode)
      );
      return response.json({
        message: "kiểm tra mã OTP trong email của bạn",
        error: false,
        success: true,
      });
    }
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}


export async function verifyForgotPasswordOtp(request, response) {
  try {
    const { email, otp } = request.body;

    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return response.status(400).json({
        message: "Email không có sẵn",
        error: true,
        success: false,
      });
    }
    if (!email || !otp) {
      return response.status(400).json({
        message: "Vui lòng cung cấp email, otp.",
        error: true,
        success: false,
      });
    }

    if (String(otp) !== String(user.otp)) {
      return response.status(400).json({
        message: "OTP không hợp lệ",
        error: true,
        success: false,
      });
    }

    const currentTime = new Date().toISOString();

    if (user.otpExpires < currentTime) {
      return response.status(400).json({
        message: "Otp đã hết hạn",
        error: true,
        success: false,
      });
    }

    user.otp = "";
    user.otpExpires = "";

    await user.save();

    return response.status(200).json({
      message: "Đã xác minh OTP thành công",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function resetpassword(request, response) {
  try {
    const { email, oldPassword, newPassword, confirmPassword } = request.body;

    if (!email || !newPassword || !confirmPassword) {
      return response.status(400).json({
        error: true,
        success: false,
        message: "Vui lòng nhập đầy đủ email, mật khẩu mới và xác nhận mật khẩu.",
      });
    }


    const user = await UserModel.findOne({ email });
    if (!user) {
      return response.status(400).json({
        message: "Email không tồn tại trong hệ thống.",
        error: true,
        success: false,
      });
    }


    if (oldPassword) {
      const checkPassword = await bcryptjs.compare(oldPassword, user.password);
      if (!checkPassword) {
        return response.status(400).json({
          message: "Mật khẩu cũ không đúng.",
          error: true,
          success: false,
        });
      }
    }


    if (newPassword !== confirmPassword) {
      return response.status(400).json({
        message: "Mật khẩu mới và xác nhận không khớp.",
        error: true,
        success: false,
      });
    }


    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!strongPasswordRegex.test(newPassword)) {
      return response.status(400).json({
        message:"Mật khẩu cần ít nhất 8 ký tự, gồm chữ hoa, thường, số và ký tự đặc biệt.",
        error: true,
        success: false,
      });
    }


    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(newPassword, salt); // ✅ đổi từ confirmPassword → newPassword
    user.password = hashPassword;


    user.otp = null;
    user.otpExpires = null;

    await user.save();

    return response.json({
      message: "Đặt lại mật khẩu thành công.",
      error: false,
      success: true,
    });
  } catch (error) {
    console.error(" Lỗi đặt lại mật khẩu:", error);
    return response.status(500).json({
      message: error.message || "Lỗi hệ thống khi đặt lại mật khẩu.",
      error: true,
      success: false,
    });
  }
}


export async function refreshToken(request, response) {
  try {
    const refreshToken =
      request.cookies.refreshToken ||
      request?.headers?.authorization?.split(" ")[1]; /// Mã thông báo ]

    if (!refreshToken) {
      return response.status(401).json({
        message: "Mã thông báo không hợp lệ",
        error: true,
        success: false,
      });
    }
    const verifyToken = await jwt.verify(
      refreshToken,
      process.env.SECRET_KEY_REFRESH_TOKEN
    );
    if (!verifyToken) {
      return response.status(401).json({
        message: "mã thông báo đã hết hạn",
        error: true,
        success: false,
      });
    }
    const userId = verifyToken?._id;
    const newAccessToken = await generatedAccessToken(userId);

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    response.cookie("accessToken", newAccessToken, cookiesOption);

    return response.json({
      message: "Mã thông báo truy cập mới được tạo",
      error: false,
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}


export async function userDetails(request, response) {
  try {
    const userId = request.userId;

    const user = await UserModel.findById(userId)
      .select("-password -refresh_token")
      .populate("address_details");

    return response.json({
      message: "chi tiết người dùng",
      data: user,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: "Có điều bất thường",
      error: true,
      success: false,
    });
  }
}


export async function addReview(request, response) {
  try {
    const { image, userName, review, rating, userId, productId } = request.body;

    const userReview = new ReviewModel({
      image: image,
      userName: userName,
      review: review,
      rating: rating,
      userId: userId,
      productId:productId
    });

    await userReview.save();

    return response.json({
      message: "Cảm ơn bạn đã gửi đánh giá!",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: "Có điều bất thường",
      error: true,
      success: false,
    });
  }
}


export async function getReview(request, response) {
  try {
    const productId = request.query.productId;

    const reviews = await ReviewModel.find({ productId: productId });

    if (!reviews) {
      return response.status(400).json({
        error: true,
        success: false,
      });
    }
    return response.status(200).json({
        error: false,
        success: true,
        reviews:reviews
      });
  } catch (error) {
    return response.status(500).json({
      message: "Có điều bất thường",
      error: true,
      success: false,
    });
  }
}


export async function getAllReviews(request, response) {
  try {
    const reviews = await ReviewModel.find();

        if(!reviews) {
            return response.status(400).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            reviews: reviews
        })   
    
  } catch (error) {
    return response.status(500).json({
      message: "Có điều bất thường",
      error: true,
      success: false,
    });
  }
}


export async function getAllUsers(request, response) {
  try {

    const users = await UserModel.find();
      
      if (!users) {
          return response.status(400).json({
              error: true,
              success: false
      });
  }
      return response.status(200).json({
            error: false,
            success: true,
            users: users
        });

    
  } catch (error) {
     return response.status(500).json({
      message: "Có điều bất thường",
      error: true,
      success: false,
    });
  }
}


export async function deleteMultiple(request, response) {
    const { ids } = request.body;

    if (!ids || !Array.isArray(ids)) {
        return response.status(400).json({ error: true, success: false, message: 'Invalid input' });
    }

    try {
        await UserModel.deleteMany({ _id: { $in: ids } });
        return response.status(200).json({
            message: "Xóa người dùng thành công",
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


