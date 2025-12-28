import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  // 🔹 Danh sách sản phẩm trong đơn hàng
  products: [
    {
      productId: {
        type: String
      },
      productTitle: {
        type: String
      },
      quantity: {
        type: Number
      },
      price: {
        type: Number
      },
      image: {
        type: String
      },
      subTotal: {
        type: Number
      },
      brand1:{
        type: String
      },
      brand: {
        type: String
    },
    }
  ],
  // 🔹 Thông tin thanh toán
  paymentId: {
    type: String,
    default: ""
  },
  // 🔹 Trạng thái thanh toán
  payment_status : {
    type : String,
    default : ""
  },
  // 🔹 Trạng thái đơn hàng
  order_status : {
    type : String,
    default : "pending"
  },
  // 🔹 Địa chỉ giao hàng
  delivery_address: {
    type: mongoose.Schema.ObjectId,
    ref: 'address'
  },
  // 🔹 Tổng số tiền đơn hàng
  totalAmt: {
    type: Number,
    default: 0
  },
  shipperFee:{
    type: Number,
    default: 0
  },
  shipperID : {
     type : String,
     default : null
  },
  // 🔹 Mã tạo cho đơn hàng để kết nối dữ liệu
  orderId: {
    type: String
  }
}, {
  timestamps: true
})

const OrderModel = mongoose.model('order', orderSchema)
export default OrderModel