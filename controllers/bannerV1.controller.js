import BannerV1Model from '../models/bannerV1.model.js';

import { v2 as cloudinary } from 'cloudinary';
import path from "path";
import streamifier from "streamifier"
import fs from 'fs';

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});


var imagesArr = [];
export async function uploadImages(request, response) {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const uploadPromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const originalName = path.parse(file.originalname).name;

        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "banners",
            public_id: `${originalName}-${Date.now()}`,
            overwrite: false,
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );

        streamifier.createReadStream(file.buffer).pipe(stream);
      });
    });

    const images = await Promise.all(uploadPromises);

    return res.status(200).json({
      success: true,
      images,
    });

  } catch (error) {
    console.error("UPLOAD BANNER ERROR:", error);
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
}

export async function addBanner(request, response) { 
    try {
        let banner = new BannerV1Model({

    await banner.save();

    return res.status(200).json({
      success: true,
      message: "Đã tạo Banner",
      banner,
    });

  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
}

export async function getBanners(request, response) {
    try {
       const banners = await BannerV1Model.find();
       
        if(!banners){
        response.status(500).json({
            error:true,
            success:false
        })
    }

        return response.status(200).json({
            error: false,
            success: true,
            data:banners
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function getBanner(request, response) {
    try {
        const banner = await BannerV1Model.findById(request.params.id);

        if (!banner) {
                response.status(500)
                    .json({
                        message: "Không tìm thấy danh mục có ID đã cho.",
                        error: true,
                        success: false
                    });
            }
                return response.status(200).json({
                    error:false,
                    success:true,
                    banner:banner
                })
    } catch (error) {
         return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function deleteBanner(request, response) {
    const banner = await BannerV1Model.findById(request.params.id);
    const images = banner.images;
    let img = "";
    console.log(images)
    for (img of images) {
        const imgUrl = img;
        const urlArr = imgUrl.split("/");
        const image = urlArr[urlArr.length - 1];

        const imageName = image.split(".")[0];

            if(imageName){
            cloudinary.uploader.destroy(imageName, (error, result) => {
                // console.log(error, result);
            });
        }
    }
    
        const deletedBanner = await BannerV1Model.findByIdAndDelete(request.params.id);
            if (!deletedBanner) {
                response.status(404).json({
                    message: "Không tìm thấy Banner",
                    success: false,
                    error: true
                });
            }

            response.status(200).json({
                success: true,
                error:false,
                message: "Banner đã bị xóa!",
            });
}

export async function updatedBanner(request, response){
    const banner = await BannerV1Model.findByIdAndUpdate(
        request.params.id,
        {   
            bannerTitle: request.body.bannerTitle,
            images: imagesArr.length > 0 ? imagesArr[0] : request.body.images,
            catId: request.body.catId,
            subCatId: request.body.subCatId,
            thirdsubCatId: request.body.thirdsubCatId,
            price: request.body.price,
            alignInfo:request.body.alignInfo
        },
        { new: true }
    );

    if (!banner) {
      return res.status(404).json({
        error: true,
        message: "Không tìm thấy Banner",
      });
    }

    // 1️⃣ Xoá tất cả ảnh trên Cloudinary
    for (const imgUrl of banner.images) {
      const imageName = imgUrl.split("/").pop().split(".")[0];

      if (imageName) {
        await cloudinary.uploader.destroy(imageName);
      }
    }

    // 2️⃣ Xoá banner trong DB
    await BannerV1Model.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Banner đã bị xóa",
    });

  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
}


export async function updatedBanner(req, res) {
  try {
    const banner = await BannerV1Model.findByIdAndUpdate(
      req.params.id,
      {
        bannerTitle: req.body.bannerTitle,
        images: req.body.images,
        catId: req.body.catId,
        subCatId: req.body.subCatId,
        thirdsubCatId: req.body.thirdsubCatId,
        price: req.body.price,
        alignInfo: req.body.alignInfo,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
        message: "Đã cập nhật Banner",
      banner,
    });

  } catch (error) {
    return res.status(500).json({
      error: true,
        message: error.message,
    });
  }
}