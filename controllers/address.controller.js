
import AddressModel from "../models/address.model.js";
import UserModel from "../models/user.model.js";
import axios from "axios";


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

    if (!address_line1 || !city || !state || !country || !mobile || !userId) {
      return response.status(400).json({
        message: "Vui lòng nhập đầy đủ thông tin bắt buộc",
        error: true,
        success: false
      });
    }

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


