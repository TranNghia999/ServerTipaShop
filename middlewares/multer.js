// Code dùng cho local  

// import multer from 'multer';
// import fs from 'fs';

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads");
//   },
//   filename: function (req, file, cb) {
//     cb(null, `${Date.now()}_${file.originalname}`);
//     // imagesArr.push(`${Date.now()}_${file.originalname}`)
//   },
// });

// const upload = multer({ storage: storage });

// export default upload;

// Code dùng cho publish server ( Phát viết )
import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
});

export default upload;
