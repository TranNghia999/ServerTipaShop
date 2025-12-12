import mongoose from "mongoose";

const productSIZEchema = mongoose.Schema({
    name:{
        type:String,
        required: true,
    },
     dateCreated: {
        type: Date,
        default: Date.now,
    },
},{
    timestamps : true
});

const ProductSIZEModel = mongoose.model('productSIZE', productSIZEchema)

    export default ProductSIZEModel