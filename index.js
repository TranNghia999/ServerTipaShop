// các thư viên kết nối server Backend
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
// Các file thư mục thêm vào
import connectDB from './config/connectDb.js';
import userRouter from './route/user.route.js'
import categoryRouter from './route/category.route.js';
import productRouter from './route/product.route.js';
import cartRouter from './route/cart.route.js';
import myListRouter from './route/mylist.route.js';
import addressRouter from './route/address.route.js';
import homeSlidesRouter from './route/homeSlides.route.js';
import bannerV1Router from './route/bannerV1.route.js';
import blogRouter from './route/blog.route.js';
import bannerV2Router from './route/bannerV2.route.js';
import orderRouter from './route/order.route.js';


const app = express()

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', // local React
    'https://admin-tipa-shop.vercel.app',
    'https://overexertedly-unresponding-arely.ngrok-free.dev'// deployed React
  ],
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  credentials: true
}));

// handle preflight
app.options('*', cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', // local React
    'https://admin-tipa-shop.vercel.app',
    'https://overexertedly-unresponding-arely.ngrok-free.dev' // deployed React
  ],
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  credentials: true
}));



app.use(express.json());
app.use(cookieParser())
app.use(morgan())
app.use(helmet({
  crossOriginResourcePolicy: false
}));

app.get("/", (request, response) => {
  // server to client
  response.json({
    message: "Server is running " + process.env.PORT
  });
});

app.use('/api/user', userRouter);
app.use('/api/category',categoryRouter);
app.use('/api/product', productRouter);
app.use("/api/cart",cartRouter);
app.use("/api/myList", myListRouter);
app.use("/api/address",  addressRouter);
app.use("/api/homeSlides", homeSlidesRouter)
app.use("/api/bannerV1", bannerV1Router)
app.use("/api/bannerV2", bannerV2Router)
app.use("/api/blog", blogRouter)
app.use("/api/order", orderRouter)



// Server chỉ chạy khi đã kết nối MongoDB, tránh lỗi truy vấn DB khi DB chưa sẵn sàng.
connectDB().then(()=>{
    app.listen(process.env.PORT, () =>{
        console.log("Server is running", process.env.PORT);
    })
})
 