// import AddressModel from "../models/address.model.js";
// import UserModel from "../models/user.model.js";

// // Thêm địa chỉ
// export const addAddressController = async (request, response) => {
//   try {
//     const {address_line1, city, state, pincode, country, mobile, userId, landmark, addressType } = request.body;

    
      
//   //   if (!address_line1 || !city || !state || !pincode || !country || !mobile || !userId) {
//   //   return res.status(500).json({
//   //     message: "Vui lòng nhập đầy đủ thông tin",
//   //     error: true,
//   //     success: false
//   //   });
//   // }

//     const address = new AddressModel({
//         address_line1, city, state, pincode, country, mobile, userId, landmark, addressType
//     })
//         const savedAddress = await address.save();

//         const updateCartUser = await UserModel.updateOne( { _id: userId }, {
//             $push: {
//                 address_details: savedAddress?._id
//             }
//         })

//         return response.status(200).json({
//             data: savedAddress,
//             message: "Thêm địa chỉ thành công",
//             error: false,
//             success: true
//         })

//   } catch (error) {
//     return response.status(500).json({
//             message: error.message || error,
//             error: true,
//             success: false
//         })
//   }
// }

// // Lấy tất cả địa chỉ
// export const getAddressController = async (request, response) => {
//   try {
//     const address = await AddressModel.find({ userId: request?.query?.userId });

//     if (!address || address.length === 0) {
//       return response.status(404).json({
//         message: "Không tìm thấy địa chỉ",
//         error: true,
//         success: false
//       });
//     }

//     return response.status(200).json({
//       error: false,
//       success: true,
//       data: address,
//       message: "Lấy địa chỉ thành công"
//     });

//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false
//     });
//   }
// }

// // Xóa địa chỉ
// export const deleteAddressController = async(request,response)=>{
//     try {
//             const userId = request.userId // middleware
//             const _id  = request.params.id

//         if(!_id){
//             return response.status(400).json({
//                     message : "Provide _id",
//                     error : true,
//                     success : false
//                 })
//             }
//             const deleteItem = await AddressModel.deleteOne({ _id : _id, userId : userId })

//             if(!deleteItem){
//                 return response.status(404).json({
//                     message:"Không tìm thấy địa chỉ",
//                     error:true,
//                     success:false
//                 })
//             }

//             return response.json({
//                     message : "Đã xóa địa chỉ",
//                     error : false,
//                     success : true,
//                     data : deleteItem
//             })

        
//     } catch (error) {
//         return response.status(500).json({
//             message: error.message || error,
//             error: true,
//             success: false
//         })
//     }
// }

// // Lấy một địa chỉ
// export const getSingleAddressController = async (request, response) => {
//    try {

//     const id = request.params.id;

//     const address = await AddressModel.findOne({ _id: id });

//     if (!address) {
//       return response.status(404).json({
//         message: "Không tìm thấy địa chỉ ",
//         error: true,
//         success: false
//       });
//     }
//     return response.status(200).json({
//         error: false,
//         success: true,
//         address: address
//       });
    
//    } catch (error) {
//       return response.status(500).json({
//             message: error.message || error,
//             error: true,
//             success: false
//         })
//    }
// }

// // Sửa lại địa chỉ người dùng
// export async function editAddress(request, response) {
//   try {

//     const id = request.params.id; // Lấy id từ tham số đường dẫn
//     const {address_line1, city, state, pincode, country, mobile, userId, landmark, addressType } = request.body; // Lấy dữ liệu từ body

    
   
    
//     const address = await AddressModel.findByIdAndUpdate(
//       id,
//       {
//         address_line1: address_line1,
//         city: city,
//         state: state,
//         pincode: pincode,
//         country: country,
//         mobile: mobile,
//         landmark:landmark,
//         addressType: addressType
//       },
//       { new: true }
//     );

   
//     return response.json({
//       message: "Cập nhật địa chỉ thành công",
//       error: false,
//       success: true,
//       address: address
//     });
//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false,
//     });
//   }
// }

// // code mới
import AddressModel from "../models/address.model.js";
import UserModel from "../models/user.model.js";
import axios from "axios";

/* ===========================================================
   1️⃣  THÊM ĐỊA CHỈ NGƯỜI DÙNG
=========================================================== */
export const addAddressController = async (request, response) => {
  try {
    const {
      name,
      address_line1,
      city,
      state,
      pincode,
      country,
      mobile,
      userId,
      landmark,
      addressType,
      district,
      provinceCode,
      districtCode,
      wardCode
    } = request.body;

    // ⚠️ Kiểm tra tối thiểu dữ liệu
    if (!address_line1 || !city || !state || !country || !mobile || !userId) {
      return response.status(400).json({
        message: "Vui lòng nhập đầy đủ thông tin bắt buộc",
        error: true,
        success: false
      });
    }

    // 🔹 Tạo đối tượng địa chỉ mới
    const address = new AddressModel({
      name,
      address_line1,
      city,
      state,
      pincode,
      country,
      mobile,
      userId,
      landmark,
      addressType,
      district,
      provinceCode,
      districtCode,
      wardCode
    });

    const savedAddress = await address.save();

    // 🔹 Cập nhật địa chỉ vào user
    await UserModel.updateOne(
      { _id: userId },
      {
        $push: {
          address_details: savedAddress?._id
        }
      }
    );

    return response.status(200).json({
      data: savedAddress,
      message: "Thêm địa chỉ thành công",
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
};

/* ===========================================================
   2️⃣  LẤY TẤT CẢ ĐỊA CHỈ THEO USER ID
=========================================================== */
export const getAddressController = async (request, response) => {
  try {
    const address = await AddressModel.find({ userId: request?.query?.userId });

    if (!address || address.length === 0) {
      return response.status(404).json({
        message: "Không tìm thấy địa chỉ",
        error: true,
        success: false
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      data: address,
      message: "Lấy địa chỉ thành công"
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
};

/* ===========================================================
   3️⃣  XOÁ ĐỊA CHỈ
=========================================================== */
export const deleteAddressController = async (request, response) => {
  try {
    const userId = request.userId; // lấy từ middleware
    const _id = request.params.id;

    if (!_id) {
      return response.status(400).json({
        message: "Thiếu ID địa chỉ",
        error: true,
        success: false
      });
    }

    const deleteItem = await AddressModel.deleteOne({ _id: _id, userId: userId });

    if (!deleteItem) {
      return response.status(404).json({
        message: "Không tìm thấy địa chỉ cần xoá",
        error: true,
        success: false
      });
    }

    return response.json({
      message: "Đã xoá địa chỉ thành công",
      error: false,
      success: true,
      data: deleteItem
    });

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
};

/* ===========================================================
   4️⃣  LẤY MỘT ĐỊA CHỈ THEO ID
=========================================================== */
export const getSingleAddressController = async (request, response) => {
  try {
    const id = request.params.id;
    const address = await AddressModel.findOne({ _id: id });

    if (!address) {
      return response.status(404).json({
        message: "Không tìm thấy địa chỉ",
        error: true,
        success: false
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      address: address
    });

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
};

/* ===========================================================
   5️⃣  CẬP NHẬT / SỬA ĐỊA CHỈ
=========================================================== */
export async function editAddress(request, response) {
  try {
    const id = request.params.id;
    const {
      name,
      address_line1,
      city,
      state,
      pincode,
      country,
      mobile,
      userId,
      landmark,
      addressType,
      district,
      provinceCode,
      districtCode,
      wardCode
    } = request.body;

    const address = await AddressModel.findByIdAndUpdate(
      id,
      {
        name,
        address_line1,
        city,
        state,
        pincode,
        country,
        mobile,
        landmark,
        addressType,
        district,
        provinceCode,
        districtCode,
        wardCode
      },
      { new: true }
    );

    return response.json({
      message: "Cập nhật địa chỉ thành công",
      error: false,
      success: true,
      address: address
    });

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
}

/* ===========================================================
   6️⃣  API HÀNH CHÍNH — LẤY TỈNH / HUYỆN / XÃ
=========================================================== */

// 🔹 Lấy danh sách Tỉnh / Thành phố
export const getProvinces = async (req, res) => {
  try {
    const { data } = await axios.get("https://provinces.open-api.vn/api/p/");
    res.status(200).json({
      success: true,
      message: "Lấy danh sách Tỉnh/Thành phố thành công",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách tỉnh/thành phố",
      error: error.message,
    });
  }
};

// 🔹 Lấy danh sách Quận / Huyện theo mã Tỉnh
export const getDistricts = async (req, res) => {
  try {
    const { provinceCode } = req.params;
    const { data } = await axios.get(
      `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
    );
    res.status(200).json({
      success: true,
      message: "Lấy danh sách Quận/Huyện thành công",
      data: data.districts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách quận/huyện",
      error: error.message,
    });
  }
};

// 🔹 Lấy danh sách Xã / Phường theo mã Huyện
export const getWards = async (req, res) => {
  try {
    const { districtCode } = req.params;
    const { data } = await axios.get(
      `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`
    );
    res.status(200).json({
      success: true,
      message: "Lấy danh sách Xã/Phường thành công",
      data: data.wards,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách xã/phường",
      error: error.message,
    });
  }
};

//  code mới - có toạ độ, bản đồ
// import AddressModel from "../models/address.model.js";
// import UserModel from "../models/user.model.js";
// import axios from "axios";

// /* ===========================================================
//    1️⃣  THÊM ĐỊA CHỈ NGƯỜI DÙNG (CÓ TOẠ ĐỘ)
// =========================================================== */
// export const addAddressController = async (request, response) => {
//   try {
//     const {
//       name,
//       address_line1,
//       city,
//       state,
//       pincode,
//       country,
//       mobile,
//       userId,
//       landmark,
//       addressType,
//       district,
//       provinceCode,
//       districtCode,
//       wardCode,
//       latitude,   // ✅ thêm
//       longitude   // ✅ thêm
//     } = request.body;

//     // ⚠️ Kiểm tra dữ liệu tối thiểu
//     if (!address_line1 || !city || !state || !country || !mobile || !userId) {
//       return response.status(400).json({
//         message: "Vui lòng nhập đầy đủ thông tin bắt buộc",
//         error: true,
//         success: false
//       });
//     }

//     // 🔹 Tạo đối tượng địa chỉ mới
//     const address = new AddressModel({
//       name,
//       address_line1,
//       city,
//       state,
//       pincode,
//       country,
//       mobile,
//       userId,
//       landmark,
//       addressType,
//       district,
//       provinceCode,
//       districtCode,
//       wardCode,
//       latitude,   // ✅ lưu toạ độ
//       longitude   // ✅ lưu toạ độ
//     });

//     const savedAddress = await address.save();

//     // 🔹 Cập nhật địa chỉ vào user
//     await UserModel.updateOne(
//       { _id: userId },
//       { $push: { address_details: savedAddress?._id } }
//     );

//     return response.status(200).json({
//       data: savedAddress,
//       message: "Thêm địa chỉ thành công",
//       error: false,
//       success: true
//     });

//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false
//     });
//   }
// };

// /* ===========================================================
//    2️⃣  LẤY TẤT CẢ ĐỊA CHỈ THEO USER ID
// =========================================================== */
// export const getAddressController = async (request, response) => {
//   try {
//     const address = await AddressModel.find({ userId: request?.query?.userId });

//     if (!address || address.length === 0) {
//       return response.status(404).json({
//         message: "Không tìm thấy địa chỉ",
//         error: true,
//         success: false
//       });
//     }

//     return response.status(200).json({
//       error: false,
//       success: true,
//       data: address,
//       message: "Lấy địa chỉ thành công"
//     });
//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false
//     });
//   }
// };

// /* ===========================================================
//    3️⃣  XOÁ ĐỊA CHỈ
// =========================================================== */
// export const deleteAddressController = async (request, response) => {
//   try {
//     const userId = request.userId;
//     const _id = request.params.id;

//     if (!_id) {
//       return response.status(400).json({
//         message: "Thiếu ID địa chỉ",
//         error: true,
//         success: false
//       });
//     }

//     const deleteItem = await AddressModel.deleteOne({ _id, userId });

//     if (!deleteItem) {
//       return response.status(404).json({
//         message: "Không tìm thấy địa chỉ cần xoá",
//         error: true,
//         success: false
//       });
//     }

//     return response.json({
//       message: "Đã xoá địa chỉ thành công",
//       error: false,
//       success: true,
//       data: deleteItem
//     });

//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false
//     });
//   }
// };

// /* ===========================================================
//    4️⃣  LẤY MỘT ĐỊA CHỈ THEO ID
// =========================================================== */
// export const getSingleAddressController = async (request, response) => {
//   try {
//     const id = request.params.id;
//     const address = await AddressModel.findOne({ _id: id });

//     if (!address) {
//       return response.status(404).json({
//         message: "Không tìm thấy địa chỉ",
//         error: true,
//         success: false
//       });
//     }

//     return response.status(200).json({
//       error: false,
//       success: true,
//       address
//     });

//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false
//     });
//   }
// };

// /* ===========================================================
//    5️⃣  CẬP NHẬT / SỬA ĐỊA CHỈ (CÓ TOẠ ĐỘ)
// =========================================================== */
// export async function editAddress(request, response) {
//   try {
//     const id = request.params.id;
//     const {
//       name,
//       address_line1,
//       city,
//       state,
//       pincode,
//       country,
//       mobile,
//       userId,
//       landmark,
//       addressType,
//       district,
//       provinceCode,
//       districtCode,
//       wardCode,
//       latitude,   // ✅ thêm
//       longitude   // ✅ thêm
//     } = request.body;

//     const address = await AddressModel.findByIdAndUpdate(
//       id,
//       {
//         name,
//         address_line1,
//         city,
//         state,
//         pincode,
//         country,
//         mobile,
//         landmark,
//         addressType,
//         district,
//         provinceCode,
//         districtCode,
//         wardCode,
//         latitude,
//         longitude
//       },
//       { new: true }
//     );

//     return response.json({
//       message: "Cập nhật địa chỉ thành công",
//       error: false,
//       success: true,
//       address
//     });

//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false
//     });
//   }
// }

// /* ===========================================================
//    6️⃣  API HÀNH CHÍNH — LẤY TỈNH / HUYỆN / XÃ
// =========================================================== */

// // 🔹 Lấy danh sách Tỉnh / Thành phố
// export const getProvinces = async (req, res) => {
//   try {
//     const { data } = await axios.get("https://provinces.open-api.vn/api/p/");
//     res.status(200).json({
//       success: true,
//       message: "Lấy danh sách Tỉnh/Thành phố thành công",
//       data,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Không thể lấy danh sách tỉnh/thành phố",
//       error: error.message,
//     });
//   }
// };

// // 🔹 Lấy danh sách Quận / Huyện theo mã Tỉnh
// export const getDistricts = async (req, res) => {
//   try {
//     const { provinceCode } = req.params;
//     const { data } = await axios.get(
//       `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
//     );
//     res.status(200).json({
//       success: true,
//       message: "Lấy danh sách Quận/Huyện thành công",
//       data: data.districts,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Không thể lấy danh sách quận/huyện",
//       error: error.message,
//     });
//   }
// };

// // 🔹 Lấy danh sách Xã / Phường theo mã Huyện
// export const getWards = async (req, res) => {
//   try {
//     const { districtCode } = req.params;
//     const { data } = await axios.get(
//       `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`
//     );
//     res.status(200).json({
//       success: true,
//       message: "Lấy danh sách Xã/Phường thành công",
//       data: data.wards,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Không thể lấy danh sách xã/phường",
//       error: error.message,
//     });
//   }
// };


