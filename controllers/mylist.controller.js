import MylistModel from '../models/myList.modal.js';


export const addToMyListController = async (request, response) => {
    try {
        const userId = request.userId //middleware
        const { productId, productTitle, image, rating, price, oldPrice, brand, discount } = request.body;

                const item = await MylistModel.findOne({
                    userId:userId,
                    productId:productId
                })

                if(item){
                    return response.status(400).json({
                        message: "Sản phẩm đã có trong mục yêu thích",
                    })
                }

                const myList = new MylistModel({ productId, productTitle, image,rating, price, oldPrice, brand, discount, userId })

                const save = await myList.save();

                return response.status(200).json({
                    error:false,
                    success:true,
                    message:"Sản phẩm đã lưu vào mục yêu thích",
                })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export const getMyListController = async (request, response) => {
    try {

            const userId = request.userId;

            const mylistItems = await MylistModel.find({
                userId:userId
            })

            return response.status(200).json({
                error:false,
                success:true,
                data:mylistItems
            })            


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export const deleteToMyListController = async (request, response) => {
    try {
       const myListItem = await MylistModel.findById(request.params.id);

            if(!myListItem){
                return response.status(404).json({
                    error:true,
                    success:false,
                    message:"Không tìm thấy mục có id này"
                })
            }

            const deletedItem = await MylistModel.findByIdAndDelete(request.params.id);

            if(!deletedItem){
                return response.status(404).json({
                    error:true,
                    success:false,
                    message:"Mục không bị xóa"
                })
            }

            return response.status(200).json({
                error:false,
                success:true,
                message:"Mục đã xóa khỏi Danh sách của tôi"
            })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

