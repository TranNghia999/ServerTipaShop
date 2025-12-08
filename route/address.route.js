// import { Router } from "express";

// import auth from '../middlewares/auth.js';
// import { addAddressController, deleteAddressController, editAddress, getAddressController, getSingleAddressController } from "../controllers/address.controller.js";

// const addressRouter = Router();
// addressRouter.post('/add', auth, addAddressController)
// addressRouter.get('/get', auth, getAddressController)
// addressRouter.get('/:id', auth, getSingleAddressController)
// addressRouter.delete('/:id', auth, deleteAddressController)
// addressRouter.put('/:id', auth, editAddress)

// export default addressRouter


import { Router } from "express";
import auth from "../middlewares/auth.js";
import {
  addAddressController,
  deleteAddressController,
  editAddress,
  getAddressController,
  getSingleAddressController,
  getProvinces,
  getDistricts,
  getWards
} from "../controllers/address.controller.js";

const addressRouter = Router();

/* ===========================================================
   📦 CÁC API GỐC (THÊM / SỬA / XOÁ / LẤY ĐỊA CHỈ)
=========================================================== */
addressRouter.post("/add", auth, addAddressController);
addressRouter.get("/get", auth, getAddressController);
addressRouter.get("/:id", auth, getSingleAddressController);
addressRouter.delete("/:id", auth, deleteAddressController);
addressRouter.put("/:id", auth, editAddress);

/* ===========================================================
   🌏 CÁC API HÀNH CHÍNH (TỈNH / HUYỆN / XÃ)
   → dùng cho FE dropdown chọn tỉnh thành Việt Nam
=========================================================== */
addressRouter.get("/location/provinces", getProvinces);
addressRouter.get("/location/districts/:provinceCode", getDistricts);
addressRouter.get("/location/wards/:districtCode", getWards);

export default addressRouter;

