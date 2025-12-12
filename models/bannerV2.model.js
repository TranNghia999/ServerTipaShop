import mongoose from "mongoose";

const bannerV2Schema = new mongoose.Schema({
  
images:[
    {
        type:String,
    }
],
catId: {
    type: String,
    default: "",
  },
subCatId: {
    type: String,
    default: "",
  },
thirdsubCatId: {
    type: String,
    default: "",
  },
},{
  timestamps : true
})

const BannerV2Model = mongoose.model('bannerV2',bannerV2Schema)

export default BannerV2Model
