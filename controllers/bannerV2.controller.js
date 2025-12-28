import BannerV2Model from '../models/bannerV2.model.js';

import { v2 as cloudinary } from 'cloudinary';
import path from "path";
import streamifier from "streamifier";
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
        imagesArr = [];

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const uploadPromises = files.map(file => {
      return new Promise((resolve, reject) => {
        const originalName = path.parse(file.originalname).name;

        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "banners_v2",
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

    return res.status(200).json({ images });

  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
}

export async function addBannerV2(request, response) {
    try {
        let banner = new BannerV2Model({

    await banner.save();

    return res.status(200).json({
      success: true,
      banner,
      message: "Đã tạo Banner V2",
    });

  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
}

export async function getBannersV2(request, response) {
    try {
        const banners = await BannerV2Model.find();

        if (!banners) {
            response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            data: banners
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function getBannerV2(request, response) {
    try {
        const banner = await BannerV2Model.findById(request.params.id);

        if (!banner) {
            response.status(500)
                .json({
                    message: "Không tìm thấy danh mục có ID đã cho.",
                    error: true,
                    success: false
                });
        }
        return response.status(200).json({
            error: false,
            success: true,
            banner: banner
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function deleteBannerV2(request, response) {
    const banner = await BannerV2Model.findById(request.params.id);
    const images = banner.images;
    let img = "";
    console.log(images)
    for (img of images) {
        const imgUrl = img;
        const urlArr = imgUrl.split("/");
        const image = urlArr[urlArr.length - 1];

    if (!banner) {
      return res.status(404).json({
        error: true,
        message: "Không tìm thấy Banner",
      });
    }

    // 1️⃣ Xoá ảnh cloudinary
    for (const imgUrl of banner.images) {
      const imageName = imgUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imageName);
    }

    // 2️⃣ Xoá DB
    await BannerV2Model.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Banner V2 đã bị xóa",
    });

  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
}

export async function updatedBannerV2(request, response) {
    const banner = await BannerV2Model.findByIdAndUpdate(
      req.params.id,
      {
        images: req.body.images,
        catId: req.body.catId,
        subCatId: req.body.subCatId,
        thirdsubCatId: req.body.thirdsubCatId,
      },
      { new: true }
    );

    if (!banner) {
      return res.status(404).json({
        error: true,
        message: "Không tìm thấy Banner",
      });
    }

    return res.status(200).json({
      success: true,
      banner,
      message: "Cập nhật Banner V2 thành công",
    });

  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
}

