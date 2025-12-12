import ProductModel from '../models/product.modal.js';
// CỦA RAM
import ProductRAMSModel from '../models/productRAMS.js';
// của WEIGHT
import ProductWEIGHTModel from '../models/productWEIGHT.js';
// của SIZE
import ProductSIZEModel from '../models/productSIZE.js';

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import streamifier from "streamifier";

cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true,
});

var imagesArr = [];

// tải hình ảnh lên cloudinary
// export async function uploadImages(request, response) {
//     try {
//         imagesArr = [];

//         const image = request.files;


//         const options = {
//             use_filename: true,
//             unique_filename: false,
//             overwrite: false,
//         };

//         for (let i = 0; i < image?.length; i++) {

//             const img = await cloudinary.uploader.upload(
//                 image[i].path,
//                 options,
//                 function (error, result) {
//                     imagesArr.push(result.secure_url);
//                     fs.unlinkSync(`uploads/${request.files[i].filename}`);
//                 }
//             );
//         }


//         return response.status(200).json({
//             images: imagesArr
//         });

//     } catch (error) {
//         return response.status(500).json({
//             message: error.message || error,
//             error: true,
//             success: false
//         })
//     }
// }

// tải hình ảnh lên cloudinary dùng cho publish server (Phát viết)
export async function uploadImages(request, response) {
    try {
        let imagesArr = [];

        const files = request.files;

        if (!files || files.length === 0) {
            return response.status(400).json({
                message: "No images uploaded",
            });
        }

        const uploadPromises = files.map((file) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "products",
                        use_filename: true,
                        unique_filename: false,
                        overwrite: false,
                    },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result.secure_url);
                        }
                    }
                );

                streamifier.createReadStream(file.buffer).pipe(stream);
            });
        });

        imagesArr = await Promise.all(uploadPromises);

        return response.status(200).json({
            images: imagesArr,
        });

    } catch (error) {
        console.error(error);
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
}
// tải hình ảnh Banner lên cloudinary
var bannerImage = [];
export async function uploadBannerImages(request, response) {
    try {
        bannerImage = [];

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
                    bannerImage.push(result.secure_url);
                    fs.unlinkSync(`uploads/${request.files[i].filename}`);
                }
            );
        }


        return response.status(200).json({
            images: bannerImage
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//tạo ra sản phẩm
export async function createProduct(request, response) {
    try {
        let product = new ProductModel({
            name: request.body.name,
            description: request.body.description,
            describe: request.body.describe,
            images: imagesArr,
            bannerimages: bannerImage,
            bannerTitleName: request.body.bannerTitleName,
            isDisplayOnHomeBanner: request.body.isDisplayOnHomeBanner,
            brand1: request.body.brand1,
            brand: request.body.brand,
            price: request.body.price,
            oldPrice: request.body.oldPrice,
            catName: request.body.catName,
            category: request.body.category,
            catId: request.body.catId,
            subCatId: request.body.subCatId,
            subCat: request.body.subCat,
            thirdsubCat: request.body.thirdsubCat,
            thirdsubCatId: request.body.thirdsubCatId,
            countInStock: request.body.countInStock,
            rating: request.body.rating,
            isFeatured: request.body.isFeatured,
            discount: request.body.discount,
            productRam: request.body.productRam,
            size: request.body.size,
            productWeight: request.body.productWeight,
        })

        product = await product.save();

        if (!product) {
            response.status(500).json({
                error: true,
                success: false,
                message: "Sản phẩm chưa được tạo"
            });
        }

        imagesArr = [];

        return response.status(200).json({
            message: "Sản phẩm được tạo thành công",
            error: false,
            success: true,
            product: product
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false

        })
    }
}

//lấy tất cả các sản phẩm
export async function getAllProducts(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage);
        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return response.status(404).json(
                {
                    message: "Không tìm thấy trang",
                    success: false,
                    error: true
                }
            );
        }

        const products = await ProductModel.find().populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page,
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//lấy tất cả sản phẩm theo danh mục id
export async function getAllProductsByCatId(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;

        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return response.status(404).json(
                {
                    message: "Không tìm thấy trang",
                    success: false,
                    error: true
                }
            );
        }

        const products = await ProductModel.find({
            catId: request.params.id
        }).populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page,
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//lấy tất cả sản phẩm theo danh mục tên
export async function getAllProductsByCatName(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;

        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return response.status(404).json(
                {
                    message: "Không tìm thấy trang",
                    success: false,
                    error: true
                }
            );
        }

        const products = await ProductModel.find({
            catName: request.query.catName
        }).populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page,
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//lấy tất cả sản phẩm theo danh mục id phụ
export async function getAllProductsBySubCatId(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;

        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return response.status(404).json(
                {
                    message: "Không tìm thấy trang",
                    success: false,
                    error: true
                }
            );
        }

        const products = await ProductModel.find({
            subCatId: request.params.id
        }).populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page,
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//lấy tất cả sản phẩm theo danh mục tên phụ
export async function getAllProductsBySubCatName(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;

        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return response.status(404).json(
                {
                    message: "Không tìm thấy trang",
                    success: false,
                    error: true
                }
            );
        }

        const products = await ProductModel.find({
            subCat: request.query.subCat
        }).populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page,
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//lấy tất cả sản phẩm theo danh mục id phụ
export async function getAllProductsByThirdLavelCatId(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;

        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return response.status(404).json(
                {
                    message: "Không tìm thấy trang",
                    success: false,
                    error: true
                }
            );
        }

        const products = await ProductModel.find({
            thirdsubCatId: request.params.id
        }).populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page,
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//lấy tất cả sản phẩm theo danh mục tên phụ
export async function getAllProductsByThirdLavelCatName(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;

        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return response.status(404).json(
                {
                    message: "Không tìm thấy trang",
                    success: false,
                    error: true
                }
            );
        }

        const products = await ProductModel.find({
            thirdsubCat: request.query.thirdsubCat
        }).populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page,
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//lấy tất cả sản phẩm theo giá [ Bộ lọc giá ]
export async function getAllProductsByPrice(request, response) {
    let productList = [];

    // Thêm Id danh mục tại đây
    if (request.query.catId !== "" && request.query.catId !== undefined) {
        const productListArr = await ProductModel.find({
            catId: request.query.catId,
        }).populate("category");

        productList = productListArr;
    }
    // Tất cả hiển thị trên cơ sở của nó

    if (request.query.subCatId !== "" && request.query.subCatId !== undefined) {
        const productListArr = await ProductModel.find({
            subCatId: request.query.subCatId
        }).populate("category");

        productList = productListArr;
    }

    // Lấy Id danh mục con nhập vô
    if (request.query.thirdsubCatId !== "" && request.query.thirdsubCatId !== undefined) {
        const productListArr = await ProductModel.find({
            thirdsubCatId: request.query.thirdsubCatId,
        }).populate("category");

        productList = productListArr;
    }
    // Lấy tất cả Id danh mục

    const filteredProducts = productList.filter((product) => {
        if (request.query.minPrice && product.price < parseInt(+request.query.minPrice)) {
            return false;
        }
        if (request.query.maxPrice && product.price > parseInt(+request.query.maxPrice)) {
            return false;
        }
        return true;
    });

    // Lọc tất các sản phẩm xuất hiện
    return response.status(200).json({
        error: false,
        success: true,
        products: filteredProducts,
        totalPages: 0,
        page: 0,
    });
}

//lấy tất cả sản phẩm theo xếp hạng
export async function getAllProductsByRating(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;

        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return response.status(404).json(
                {
                    message: "Không tìm thấy trang",
                    success: false,
                    error: true
                }
            );
        }

        let products = [];
        // Đánh giá danh mục chính
        if (request.query.catId !== undefined) {

            products = await ProductModel.find({
                rating: request.query.rating,
                catId: request.query.catId,

            }).populate("category")
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec();
        }
        // Đánh giá danh mục phụ
        if (request.query.subCatId !== undefined) {

            products = await ProductModel.find({
                rating: request.query.rating,
                subCatId: request.query.subCatId,

            }).populate("category")
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec();
        }

        // Đánh giá danh mục phụ
        if (request.query.thirdsubCatId !== undefined) {

            products = await ProductModel.find({
                rating: request.query.rating,
                thirdsubCatId: request.query.thirdsubCatId,

            }).populate("category")
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec();
        }

        if (!products) {
            response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page,
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// đếm tất cả sản phẩm
export async function getProductsCount(request, response) {
    try {

        const productsCount = await ProductModel.countDocuments();

        if (!productsCount) {
            response.status(500).json({
                error: true,
                success: false
            });
        }

        return response.status(200).json({
            error: false,
            success: true,
            productCount: productsCount
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

//lấy tất cả các tính năng sản phẩm
export async function getAllFeaturedProducts(request, response) {
    try {

        const products = await ProductModel.find({
            isFeatured: true
        }).populate("category");

        if (!products) {
            response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,

        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//xóa sản phẩm 
export async function deleteProduct(request, response) {
    const product = await ProductModel.findById(request.params.id).populate("category");

    if (!product) {
        return response.status(404).json({
            message: "Không tìm thấy sản phẩm",
            error: true,
            success: false
        });
    }

    const images = product.images;
    let img = "";

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

    const deletedProduct = await ProductModel.findByIdAndDelete(request.params.id);

    if (!deletedProduct) {
        response.status(404).json({
            message: "Sản phẩm không bị xóa",
            success: false,
            error: true
        });
    }
    return response.status(200).json({
        success: true,
        error: false,
        message: "Sản phẩm đã bị xóa",
    });
}

//Xóa nhiều sản phẩm
export async function deleteMultipleProducts(request, response) {
    const { ids } = request.body;

    if (!ids || !Array.isArray(ids)) {
        return response.status(400).json({ error: true, success: false, message: 'Invalid input' });
    }

    for (let i = 0; i < ids?.length; i++) {
        const product = await ProductModel.findById(ids[i]);

        const images = product.images;
        let img = "";

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
    }

    try {
        await ProductModel.deleteMany({ _id: { $in: ids } });
        return response.status(200).json({
            message: "Xóa sản phẩm thành công",
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

//Lấy sản phẩm duy nhất
export async function getProduct(request, response) {
    try {
        const product = await ProductModel.findById(request.params.id).populate("category");

        if (!product) {
            return response.status(404).json({
                message: "Sản phẩm không được tìm thấy",
                error: true,
                success: false
            });
        }
        return response.status(200).json({
            error: false,
            success: true,
            product: product
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Xóa hình ảnh 
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

// Cập nhật sản phẩm -- Banner 
export async function updateProduct(request, response) {
    try {
        const product = await ProductModel.findByIdAndUpdate(
            request.params.id, {
            name: request.body.name,
            subCat: request.body.subCat,
            description: request.body.description,
            describe: request.body.describe,
            images: request.body.images,
            bannerimages: request.body.bannerimages,
            bannerTitleName: request.body.bannerTitleName,
            isDisplayOnHomeBanner: request.body.isDisplayOnHomeBanner,
            brand1: request.body.brand1,
            brand: request.body.brand,
            price: request.body.price,
            oldPrice: request.body.oldPrice,
            catId: request.body.catId,
            catName: request.body.catName,
            subCat: request.body.subCat,
            subCatId: request.body.subCatId,
            category: request.body.category,
            thirdsubCat: request.body.thirdsubCat,
            thirdsubCatId: request.body.thirdsubCatId,
            countInStock: request.body.countInStock,
            rating: request.body.rating,
            isFeatured: request.body.isFeatured,
            productRam: request.body.productRam,
            size: request.body.size,
            productWeight: request.body.productWeight,
        },
            { new: true }
        );
        if (!product) {
            return response.status(404).json({
                message: "sản phẩm không thể cập nhật",
                status: false,
            });
        }

        imagesArr = [];

        return response.status(200).json({
            message: "Sản phẩm đang được cập nhật",
            error: false,
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// PHẦN RAM

// Tạo dữ Liệu Ram
export async function createProductRAMS(request, response) {
    try {
        let productRAMS = new ProductRAMSModel({
            name: request.body.name
        })

        productRAMS = await productRAMS.save();

        if (!productRAMS) {
            response.status(500).json({
                error: true,
                success: false,
                message: "Dung lượng RAM chưa được tạo"
            });
        }

        return response.status(200).json({
            message: "Dung lượng RAM đã tạo thành công",
            error: false,
            success: true,
            product: productRAMS
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//xóa 1 sản phẩm Ram 
export async function deleteProductRAMS(request, response) {
    const productRAMS = await ProductRAMSModel.findById(request.params.id);

    if (!productRAMS) {
        return response.status(404).json({
            message: "Không tìm thấy mục nào",
            error: true,
            success: false
        });
    }


    const deleteProductRAMS = await ProductRAMSModel.findByIdAndDelete(request.params.id);

    if (!deleteProductRAMS) {
        response.status(404).json({
            message: "Dung lượng Ram không bị xóa",
            success: false,
            error: true
        });
    }
    return response.status(200).json({
        success: true,
        error: false,
        message: "Dung lượng Ram đã bị xóa",
    });
}


// Cập nhật Ram
export async function updateProductRam(request, response) {
    try {

        const productRAM = await ProductRAMSModel.findByIdAndUpdate(
            request.params.id, {
            name: request.body.name,
        },
            { new: true }
        );
        if (!productRAM) {
            return response.status(404).json({
                message: "Dung lượng Ram không thể cập nhật",
                status: false,
            });
        }


        return response.status(200).json({
            message: "Dung lượng Ram đang được cập nhật",
            error: false,
            success: true
        });


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Lấy dữ liệu Ram
export async function getProductRams(request, response) {
    try {

        const productRam = await ProductRAMSModel.find();

        if (!productRam) {
            return response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            data: productRam
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Chỉnh sửa dữ liệu Ram
export async function getProductRamsById(request, response) {
    try {

        const productRam = await ProductRAMSModel.findById(request.params.id);

        if (!productRam) {
            return response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            data: productRam
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// PHẦN WEIGHT

// Tạo dữ Liệu weight
export async function createProductWeight(request, response) {
    try {
        let productWeight = new ProductWEIGHTModel({
            name: request.body.name
        })

        productWeight = await productWeight.save();

        if (!productWeight) {
            response.status(500).json({
                error: true,
                success: false,
                message: "Trọng lượng chưa được tạo"
            });
        }

        return response.status(200).json({
            message: "Trọng lượng đã tạo thành công",
            error: false,
            success: true,
            product: productWeight
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//xóa 1 sản phẩm Weight
export async function deleteProducWeight(request, response) {
    const productWeight = await ProductWEIGHTModel.findById(request.params.id);

    if (!productWeight) {
        return response.status(404).json({
            message: "Không tìm thấy mục nào",
            error: true,
            success: false
        });
    }


    const deleteProductWeight = await ProductWEIGHTModel.findByIdAndDelete(request.params.id);

    if (!deleteProductWeight) {
        response.status(404).json({
            message: "Trọng lượng chưa bị xóa",
            success: false,
            error: true
        });
    }
    return response.status(200).json({
        success: true,
        error: false,
        message: "Trọng lượng đã bị xóa",
    });
}

// Cập nhật Weight
export async function updateProductWeight(request, response) {
    try {

        const productWeight = await ProductWEIGHTModel.findByIdAndUpdate(
            request.params.id, {
            name: request.body.name,
        },
            { new: true }
        );
        if (!productWeight) {
            return response.status(404).json({
                message: "Không thể cập nhật",
                status: false,
            });
        }


        return response.status(200).json({
            message: "Đang được cập nhật",
            error: false,
            success: true
        });


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Lấy dữ liệu Weight
export async function getProductWeight(request, response) {
    try {

        const productWeight = await ProductWEIGHTModel.find();

        if (!productWeight) {
            return response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            data: productWeight
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Chỉnh sửa dữ liệu Weight
export async function getProductWeightById(request, response) {
    try {

        const productWeight = await ProductWEIGHTModel.findById(request.params.id);

        if (!productWeight) {
            return response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            data: productWeight
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// PHẦN Size

// Tạo dữ Liệu Size
export async function createProductSize(request, response) {
    try {
        let productSize = new ProductSIZEModel({
            name: request.body.name
        })

        productSize = await productSize.save();

        if (!productSize) {
            response.status(500).json({
                error: true,
                success: false,
                message: "Kích thước chưa được tạo"
            });
        }

        return response.status(200).json({
            message: "Kích thước đã tạo thành công",
            error: false,
            success: true,
            product: productSize
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//xóa 1 sản phẩm Size
export async function deleteProductSize(request, response) {
    const productSize = await ProductSIZEModel.findById(request.params.id);

    if (!productSize) {
        return response.status(404).json({
            message: "Không tìm thấy mục nào",
            error: true,
            success: false
        });
    }


    const deleteProductSize = await ProductSIZEModel.findByIdAndDelete(request.params.id);

    if (!deleteProductSize) {
        response.status(404).json({
            message: "Kích thước chưa bị xóa",
            success: false,
            error: true
        });
    }
    return response.status(200).json({
        success: true,
        error: false,
        message: "Kích thước đã bị xóa",
    });
}


// Cập nhật Size
export async function updateProductSize(request, response) {
    try {

        const productSize = await ProductSIZEModel.findByIdAndUpdate(
            request.params.id, {
            name: request.body.name,
        },
            { new: true }
        );
        if (!productSize) {
            return response.status(404).json({
                message: "Không thể cập nhật",
                status: false,
            });
        }


        return response.status(200).json({
            message: "Đang được cập nhật",
            error: false,
            success: true
        });


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Lấy dữ liệu Size
export async function getProductSize(request, response) {
    try {

        const productSize = await ProductSIZEModel.find();

        if (!productSize) {
            return response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            data: productSize
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Chỉnh sửa dữ liệu Size
export async function getProductSizeById(request, response) {
    try {

        const productSize = await ProductSIZEModel.findById(request.params.id);

        if (!productSize) {
            return response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            data: productSize
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Filter - Lọc Sản Phẩm
export async function filters(request, response) {
    const { catId, subCatId, thirdsubCatId, minPrice, maxPrice, rating, page, limit } = request.body;

    const filters = {}

    if (catId?.length) {
        filters.catId = { $in: catId }
    }

    if (subCatId?.length) {
        filters.subCatId = { $in: subCatId }
    }

    if (thirdsubCatId?.length) {
        filters.thirdsubCatId = { $in: thirdsubCatId }
    }

    if (minPrice || maxPrice) {
        filters.price = { $gte: +minPrice || 0, $lte: +maxPrice || Infinity };
    }

    if (rating?.length) {
        filters.rating = { $in: rating };
    }

    try {

        const products = await ProductModel.find(filters).populate("category").skip((page - 1) * limit).limit(parseInt(limit));

        const total = await ProductModel.countDocuments(filters);

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            total: total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Lọc Kiểu Sắp xếp theo
const sortItems = (products, sortBy, order) => {
    return products.sort((a, b) => {
        if (sortBy === 'name') {
            return order === 'asc'  ? a.name.localeCompare(b.name) 
                                    : b.name.localeCompare(a.name)
        }

        if (sortBy === "price") {
            return order === 'asc' ? a.price - b.price : b.price - a.price
        }

        return 0;
    })
}

//  Lấy danh sách Sắp xếp theo sản phẩm, rồi sắp xếp nó theo tiêu chí sortBy và order
export async function sortBy(request, response) {
    const { products, sortBy, order } = request.body;
    const sortedItems = sortItems([...products?.products], sortBy, order);

    return response.status(200).json({
        error: false,
        success: true,
        products: sortedItems,
        page: 0,
        totalPages: 0
    })
}

// Thanh tìm kiếm phần giao diện
export async function searchProductController(request, response) {
    try {
        const { query, page, limit } = request.body;
        if (!query) {
                return response.status(400).json({
                    error: true,
                    success: false,
                    message: "Query is required"
                });
            }
            

        const products = await ProductModel.find({
            $or: [
                { name: { $regex: query, $options: "i" } },
                { brand: { $regex: query, $options: "i" } },
                { catName: { $regex: query, $options: "i" } },
                { subCat: { $regex: query, $options: "i" } },
                { thirdsubCat: { $regex: query, $options: "i" } },
                ], 
            }).populate("category")

            const total = await products?.length

            return response.status(200).json({
                error: false,
                success: true,
                products: products,
                total: 1,
                page: parseInt(page),
                totalPages:1
            })
        
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}





