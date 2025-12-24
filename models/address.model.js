
import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({

  // 🔹 Họ tên người nhận
  name: {
    type: String,
    default: ""
  },

  // 🔹 Địa chỉ dòng 1 (tên đường, số nhà,...)
  address_line1: {
    type: String,
    default: ""
  },

  // 🔹 Thành phố / Quận / Huyện
  city: {
    type: String,
    default: ""
  },

  // 🔹 Tỉnh / Thành phố trực thuộc Trung ương
  state: {
    type: String,
    default: ""
  },

  // 🔹 Mã bưu điện (Zipcode)
  pincode: {
    type: String,
    default: ""
  },

  // 🔹 Quốc gia
  country: {
    type: String,
    default: "Việt Nam"
  },

  // 🔹 Số điện thoại liên hệ
  mobile: {
    type: Number,
    default: null
  },

  // 🔹 Trạng thái địa chỉ
  status: {
    type: Boolean,
    default: true
  },

  // 🔹 Địa chỉ được chọn làm mặc định
  selected: {
    type: Boolean,
    default: false
  },

  // 🔹 Ghi chú, mốc cụ thể
  landmark: {
    type: String,
    default: ""
  },

  // 🔹 Loại địa chỉ (Nhà riêng / Văn phòng)
  addressType: {
    type: String,
    enum: ["Home", "Office"],
  },


  // 🔹 Xã / Phường / Thị trấn
  district: {
    type: String,
    default: ""
  },

  // 🔹 Mã hành chính cho Tỉnh / Huyện / Xã (phục vụ API địa lý)
  provinceCode: {
    type: String,
    default: ""
  },
  districtCode: {
    type: String,
    default: ""
  },
  wardCode: {
    type: String,
    default: ""
  },

  // 🔹 Liên kết với người dùng
  userId: {
    type: String,
    default: ""
  }


}, {
  timestamps: true
});

const AddressModel = mongoose.model("address", addressSchema);

export default AddressModel;
