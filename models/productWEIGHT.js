import mongoose from "mongoose";

const productWEIGHTchema = mongoose.Schema({
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

const ProductWEIGHTModel = mongoose.model('productWEIGHT', productWEIGHTchema)

    export default ProductWEIGHTModel