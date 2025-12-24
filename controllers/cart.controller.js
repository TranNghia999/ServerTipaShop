import CartProductModel from "../models/cartProduct.modal.js";
import UserModel from "../models/user.model.js";


export const addToCartItemController = async(request,response)=>{
    try {
        const userId = request.userId   //middleware
        const { brand, brand1, productTitle, image, rating, price, oldPrice, discount, quantity, subTotal, productId, countInStock, size, weight, ram, products_tipaId } = request.body

        if(!productId){
            return response.status(402).json({
                message : "Cung cấp ID sản phẩm",
                error : true,
                success : false
            })
        }


        const checkItemCart = await CartProductModel.findOne({
            userId : userId,
            productId : productId
        })

        if(checkItemCart){
            return response.status(400).json({
                message : "Mặt hàng đã có trong giỏ hàng"
            })
        }

        const cartItem = new CartProductModel({
            brand: brand,
            brand1: brand1,
            productTitle: productTitle,
            image: image,
            rating: rating,
            price: price,
            oldPrice: oldPrice,
            discount: discount,
            quantity: quantity,
            subTotal: subTotal,
            productId: productId,
            countInStock: countInStock,
            userId: userId,
            size: size,
            weight: weight,
            ram: ram
                    ,
                    products_tipaId: products_tipaId
        })

        const save = await cartItem.save()

            return response.status(200).json({
                data : save,
                message : "Thêm mặt hàng thành công",
                error : false,
                success : true
            })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}


export const getCartItemController = async(request,response)=>{
    try {
       
        const userId = request.userId;

        const cartItems = await CartProductModel.find({
            userId : userId
        });

        return response.json({
            data : cartItems,
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const updateCartItemQtyController = async(request,response)=>{
    try {
            const userId = request.userId
            const { _id, qty, subTotal, size, weight, ram } = request.body

            if(!_id || !qty){
                return response.status(400).json({
                    message : "provide _id, qty"
                })
            }

             const updateCartItem = await CartProductModel.updateOne(
                {
                    _id : _id,
                    userId : userId
                },
                {
                    quantity : qty,
                    subTotal:subTotal,
                    size: size,
                    ram: ram,
                    weight: weight
                },
                { new : true  }
            )
            return response.json({
                    message : "Cập nhật giỏ hàng thành công",
                    success : true,
                    error : false,
                    data : updateCartItem
            })

        
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const deleteCartItemQtyController = async(request,response)=>{
    try {
            const userId = request.userId // middleware
            const { id } = request.params

        if(!id){
            return response.status(400).json({
                    message : "Provide _id",
                    error : true,
                    success : false
                })
            }
            const deleteCartItem = await CartProductModel.deleteOne({ _id : id, userId : userId })

            if(!deleteCartItem){
                return response.status(404).json({
                    message:"Không tìm thấy sản phẩm trong giỏ hàng",
                    error:true,
                    success:false
                })
            }

            return response.status(200).json({
                    message : "Đã xóa sản phẩm ",
                    error : false,
                    success : true,
                    data : deleteCartItem
            })
 
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export const emptyCartController = async (request, response) => {
    try {
    const userId = request.params.id // middleware

    await CartProductModel.deleteMany({ userId: userId })

    return response.status(200).json({
        error : false,
        success : true,
    })
        
    } catch (error) {
         return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

