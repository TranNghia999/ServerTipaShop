// Kết nối đến MongoDB Atlas
import mongoose from "mongoose";

// thư viện giúp Node.js đọc file .env
import dotenv from 'dotenv';
// Tìm file .env trong thư mục gốc [ Đọc các biến trong đó - Gắn chúng vào process.env ]
dotenv.config();

// Kiểm tra xem biến môi trường MONGODB_URI có được khai báo không
//Nếu không có, chương trình lập tức dừng và báo lỗi 
if (!process.env.MONGODB_URI) {
  throw new Error("Please provide MONGODB_URI in the .env file");
}

// Hàm kết nối MongoDB 
async function connectDB() {
  try {
        await mongoose.connect(process.env.MONGODB_URI);
    console.log("connect DB");
  } catch (error) {
        console.log("Mongodb connect error", error);
        process.exit(1);
  }
}




export default connectDB;