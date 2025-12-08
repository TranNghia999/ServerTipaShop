import BannerV2Model from '../models/bannerV2.model.js';

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true,
});

// tải hình ảnh lên cloudinary
var imagesArr = [];
export async function uploadImages(request, response) {
    try {
        imagesArr = [];

        const image = request.files;


        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
        };

        for (let i = 0; i < image?.length; i++) {

            const img = await cloudinary.uploader.upload(
                image[i].path,
                options,
                function (error, result) {
                    imagesArr.push(result.secure_url);
                    fs.unlinkSync(`uploads/${request.files[i].filename}`);
                }
            );
        }


        return response.status(200).json({
            images: imagesArr
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// tạo banner
export async function addBannerV2(request, response) {
    try {
        let banner = new BannerV2Model({

            images: imagesArr,
            catId: request.body.catId,
            subCatId: request.body.subCatId,
            thirdsubCatId: request.body.thirdsubCatId,
        });

        if (!banner) {
            return response.status(500).json({
                message: "Banner được tạo",
                error: true,
                success: false
            })
        }

        banner = await banner.save();
        imagesArr = [];

        return response.status(200).json({
            message: "Đã tạo danh mục",
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

// nhận Banner
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

// lấy danh mục duy nhất
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

// Xóa Banner
export async function deleteBannerV2(request, response) {
    const banner = await BannerV2Model.findById(request.params.id);
    const images = banner.images;
    let img = "";
    console.log(images)
    for (img of images) {
        const imgUrl = img;
        const urlArr = imgUrl.split("/");
        const image = urlArr[urlArr.length - 1];

        const imageName = image.split(".")[0];

        if (imageName) {
            cloudinary.uploader.destroy(imageName, (error, result) => {
                // console.log(error, result);
            });
        }
    }

    const deletedBanner = await BannerV2Model.findByIdAndDelete(request.params.id);
    if (!deletedBanner) {
        response.status(404).json({
            message: "Không tìm thấy Banner",
            success: false,
            error: true
        });
    }

    response.status(200).json({
        success: true,
        error: false,
        message: "Banner đã bị xóa!",
    });
}

// Cập nhật Banner
export async function updatedBannerV2(request, response) {
    const banner = await BannerV2Model.findByIdAndUpdate(
        request.params.id,
        {
            images: imagesArr.length > 0 ? imagesArr[0] : request.body.images,
            catId: request.body.catId,
            subCatId: request.body.subCatId,
            thirdsubCatId: request.body.thirdsubCatId,
        },
        { new: true }
    );

    if (!banner) {
        return response.status(500).json({
            message: "Không thể cập nhật Banner",
            success: false,
            error: true
        });
    }
    imagesArr = [];

    response.status(200).json({
        error: false,
        success: true,
        banner: banner,
        message: "Cập nhật Banner thành công"
    })
}
