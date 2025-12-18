import CategoryModel from '../models/category.modal.js';

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true,
});

// tải hình ảnh lên cloudinary
export async function uploadImages(req, res) {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const uploadPromises = files.map(file => {
      return new Promise((resolve, reject) => {
        const originalName = path.parse(file.originalname).name;

        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "categories",
            public_id: originalName,   
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

// tạo danh mục
export async function createCategory(request, response) { 
    try {
        let category = new CategoryModel({
            name: request.body.name,
            images: request.body.images,
            parentId: request.body.parentId,
            parentCatName: request.body.parentCatName,
        });

        if (!category) {
            return response.status(500).json({
                message: "Danh mục chưa được tạo",
                error: true,
                success: false
            })
        }

        category = await category.save();
        imagesArr = [];

        return response.status(200).json({
            message: "Đã tạo danh mục",
            error: false,
            success: true,
            category:category
        })
        
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        }) 
    }
}

// lấy Danh mục
export async function getCategories(request, response) {
    try {
       const categories = await CategoryModel.find();
        const categoryMap = {};

        categories.forEach(cat => {
            categoryMap[cat._id] = { ...cat._doc, children: [] };
        });

        const rootCategories = [];

        categories.forEach(cat => {
            if (cat.parentId) {
                categoryMap[cat.parentId].children.push(categoryMap[cat._id]);
            } else {
                rootCategories.push(categoryMap[cat._id]);
            }
        });

        return response.status(200).json({
            error: false,
            success: true,
            data:rootCategories
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//lấy số lượng danh mục
export async function getCategoriesCount(request, response) {
    try {
        const categoryCount = await CategoryModel.countDocuments({parentId:undefined});
        if (!categoryCount) {
            response.status(500).json({ success: false, error: true });
        } 
        else {
            response.send({
                categoryCount: categoryCount,
            });
        }

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//lấy số lượng danh mục phụ
export async function getSubCategoriesCount(request, response) {
    try {
            const categories = await CategoryModel.find();
        if (!categories) {
            response.status(500).json({ success: false, error: true });
        } 
        else {
            const subCatList = [];
            for (let cat of categories) {
                if (cat.parentId !== undefined) {
                    subCatList.push(cat);
                }
            }

            response.send({
                SubCategoryCount: subCatList.length,
            });
        }
        
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// lấy danh mục duy nhất
export async function getCategory(request, response) {
    try {
        const category = await CategoryModel.findById(request.params.id);

        if (!category) {
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
                    category:category
                })
    } catch (error) {
         return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Xóa hình ảnh avatar khỏi cloudinary
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
    
    if (res) {
        return response.status(200).json({
            error: false,
            success: true,
            message: "Xóa ảnh thành công"
        });
    }
  }
}

// Xóa danh mục
export async function deleteCategory(request, response) {
    const category = await CategoryModel.findById(request.params.id);
    const images = category.images;
    let img = "";

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
    const subCategory = await CategoryModel.find({
            parentId: request.params.id
        });

        for (let i = 0; i < subCategory.length; i++) {

            const thirdSubCategory = await CategoryModel.find({
                parentId: subCategory[i]._id
            });

            for (let i = 0; i < thirdSubCategory.length; i++) {
                const deletedThirdSubCat = await CategoryModel.findByIdAndDelete(thirdSubCategory[i]._id);
            }

            const deletedSubCat = await CategoryModel.findByIdAndDelete(subCategory[i]._id);
        } 
        const deletedCat = await CategoryModel.findByIdAndDelete(request.params.id);
            if (!deletedCat) {
                response.status(404).json({
                    message: "Không tìm thấy danh mục!",
                    success: false,
                    error: true
                });
            }

            response.status(200).json({
                success: true,
                error:false,
                message: "Danh mục đã bị xóa!",
            });
}

// Cập nhật danh mục
export async function updatedCategory(request, response){
    const category = await CategoryModel.findByIdAndUpdate(
        request.params.id,
        {
            name: request.body.name,
            images: request.body.images,
            parentId: request.body.parentId,
            parentCatName: request.body.parentCatName
        },
        { new: true }
    );

    if (!category) {
        return response.status(500).json({
            message: "Không thể cập nhật danh mục",
            success: false,
            error:true
        });
    }
    imagesArr = [];

        response.status(200).json({
        error:false,
        success:true,
        category:category
    })
}
