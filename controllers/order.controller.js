import OrderModel from "../models/order.model.js";
import UserModel from '../models/user.model.js';
import ProductModel from "../models/product.modal.js";
import paypal from "@paypal/checkout-server-sdk";

// Tạo đơn hàng
export const createOrderController = async (request, response) => {
  try {
    let order = new OrderModel({
      userId: request.body.userId,
      products: request.body.products,
      orderId: request.body.orderId,
      paymentId: request.body.paymentId,
      payment_status: request.body.payment_status,
      delivery_address: request.body.delivery_address,
      totalAmt: request.body.totalAmt,
      date: request.body.date,
    });
    if (!order) {
      response.status(500).json({
        error: true,
        success: false,
      });
    }

    for (let i = 0; i < request.body.products.length; i++) {
      await ProductModel.findByIdAndUpdate(
        request.body.products[i].productId,
        {
          countInStock: parseInt(
            request.body.products[i].countInStock - request.body.products[i].quantity
          ),
        }, { new: true }
      );
    }
    order = await order.save();

    return response.status(200).json({
      error: false,
      success: true,
      message: "Đặt hàng thành công",
      order: order,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
// Lấy chi tiết đơn hàng theo userId làm lịch sử đơn hàng
export async function getOrderDetailsController(request, response) { 
    try {
    
    const userId = request.userId // order id

    const orderlist = await OrderModel.find().sort({ createdAt: -1 }).populate('delivery_address userId')

    return response.json({
        message: "Danh sách đơn hàng",
        data: orderlist,
        error: false,
        success: true
    })

    } catch (error) {
       return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });  
    }
}

// Lấy tổng số đơn hàng
export async function getTotalOrdersCountController(request, response) {
  try {
    const ordersCount = await OrderModel.countDocuments();
        return response.status(200).json({
            error: false,
            success: true,
            count: ordersCount
        });
    
  } catch (error) {
      return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });  
  }
}

// lấy chi tiết đơn hàng theo orderId
function getPayPalClient() {

  const environment = 
  process.env.PAYPAL_MODE === "live"
    ? new paypal.core.LiveEnvironment(
        process.env.PAYPAL_CLIENT_ID_LIVE,
        process.env.PAYPAL_SECRET_LIVE
      )
    : new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID_TEST,
        process.env.PAYPAL_SECRET_TEST
      );

return new paypal.core.PayPalHttpClient(environment);
}
// Tạo đơn hàng PayPal
export const createOrderPaypalController = async (request, response) => { 
  try {
      const req = new paypal.orders.OrdersCreateRequest();
      req.prefer("return=representation");

      req.requestBody({
        intent: "CAPTURE",
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: request.query.totalAmount
          }
        }]
    });

      try {
          const client = getPayPalClient();
          const order = await client.execute(req);
          response.json({ id: order.result.id });
      } catch (error) {
          console.error(error);
          response.status(500).send("Lỗi tạo đơn hàng PayPal");
        }
  } catch (error) {
      return response.status(500).json({
        message: error.message || error,
        error: true,
        success: false,
      });  
    }
  }
// Capture đơn hàng PayPal
export const captureOrderPaypalController = async (request, response) => {
   try {
        const { paymentId } = request.body;

        const req = new paypal.orders.OrdersCaptureRequest(paymentId);
        req.requestBody({});

          const orderInfo = {
            userId: request.body.userId,
            products: request.body.products,
            paymentId: request.body.paymentId,
            payment_status: request.body.payment_status,
            delivery_address: request.body.delivery_address,
            totalAmt: request.body.totalAmount,
            date: request.body.date
          };

          const order = new OrderModel(orderInfo);
          await order.save();

          for (let i = 0; i < request.body.products.length; i++) {
              await ProductModel.findByIdAndUpdate(
                request.body.products[i].productId,
                {
    countInStock: parseInt(request.body.products[i].countInStock - request.body.products[i].quantity),                },
                { new: true }
              );
          }

      return response.status(200).json({ 
        success: true, 
        error: false, order: 
        order, message: "Đặt hàng thành công qua PayPal" });
    
   } catch (error) {
       return response.status(500).json({
        message: error.message || error,
        error: true,
        success: false,
      });  
   }

}

// Cập nhật trạng thái đơn hàng
export const updateOrderStatusController = async (request, response) => {
    try {
      const { id, order_status } = request.body;

        const updateOrder = await OrderModel.updateOne(
                {
                    _id : id,
                },
                {
                    order_status: order_status,
                },
                { new : true  }
            )
             return response.json({
                    message : "Đã cập nhật trạng thái đơn hàng",
                    success : true,
                    error : false,
                    data : updateOrder
          })

    } catch (error) {
      return response.status(500).json({
        message: error.message || error,
        error: true,
        success: false,
      });  
    }
}

// Tổng doanh thu theo năm và tháng
export const totalSalesController = async (request, response) => {
    try {

      const currentYear = new Date().getFullYear();

      const ordersList = await OrderModel.find();
      let totalSales = 0;
      let monthlySales = [
        {
          name: 'T1',
          TotalSales: 0
        },
        {
          name: 'T2',
          TotalSales: 0
        }, 
        {
          name: 'T3',
          TotalSales: 0
        },
        {
          name: 'T4',
          TotalSales: 0
        },
        {
          name: 'T5',
          TotalSales: 0
        },
        {
          name: 'T6',
          TotalSales: 0
        },
        {
          name: 'T7',
          TotalSales: 0
        },
        {
          name: 'T8',
          TotalSales: 0
        },
        {
          name: 'T9',
          TotalSales: 0
        },
        {
          name: 'T10',
          TotalSales: 0
        },
        {
          name: 'T11',
          TotalSales: 0
        },
        {
          name: 'T12',
          TotalSales: 0
        },
      ]

      for (let i = 0; i < ordersList.length; i++) {
        totalSales = totalSales + parseInt(ordersList[i].totalAmt);
        const str = JSON.stringify(ordersList[i]?.createdAt);
        const year = str.substr(1, 4);
        const monthStr = str.substr(6, 8);
        const month = parseInt(monthStr.substr(0, 2));

        if (currentYear == year) {
              if (month === 1) {
                monthlySales[0] = {
                  name: 'THÁNG 1',
                  TotalSales: monthlySales[0].TotalSales = parseInt(monthlySales[0].TotalSales) + parseInt(ordersList[i].totalAmt)
                }
              }
              if (month === 2) {
                  monthlySales[1] = {
                      name: 'THÁNG 2',
                      TotalSales: monthlySales[1].TotalSales = parseInt(monthlySales[1].TotalSales) + parseInt(ordersList[i].totalAmt)
                  }
              }
              if (month === 3) {
                  monthlySales[2] = {
                      name: 'THÁNG 3',
                      TotalSales: monthlySales[2].TotalSales = parseInt(monthlySales[2].TotalSales) + parseInt(ordersList[i].totalAmt)
                  }
              }
              if (month === 4) {
                  monthlySales[3] = {
                      name: 'THÁNG 4',
                      TotalSales: monthlySales[3].TotalSales = parseInt(monthlySales[3].TotalSales) + parseInt(ordersList[i].totalAmt)
                  }
              }
              if (month === 5) {
                  monthlySales[4] = {
                      name: 'THÁNG 5',
                      TotalSales: monthlySales[4].TotalSales = parseInt(monthlySales[4].TotalSales) + parseInt(ordersList[i].totalAmt)
                  }
              }
              if (month === 6) {
                  monthlySales[5] = {
                      name: 'THÁNG 6',
                      TotalSales: monthlySales[5].TotalSales = parseInt(monthlySales[5].TotalSales) + parseInt(ordersList[i].totalAmt)
                  }
              }
              if (month === 7) {
                  monthlySales[6] = {
                      name: 'THÁNG 7',
                      TotalSales: monthlySales[6].TotalSales = parseInt(monthlySales[6].TotalSales) + parseInt(ordersList[i].totalAmt)
                  }
              }
              if (month === 8) {
                  monthlySales[7] = {
                      name: 'THÁNG 8',
                      TotalSales: monthlySales[7].TotalSales = parseInt(monthlySales[7].TotalSales) + parseInt(ordersList[i].totalAmt)
                  }
              }
              if (month === 9) {
                  monthlySales[8] = {
                      name: 'THÁNG 9',
                      TotalSales: monthlySales[8].TotalSales = parseInt(monthlySales[8].TotalSales) + parseInt(ordersList[i].totalAmt)
                  }
              }
              if (month === 10) {
                  monthlySales[9] = {
                      name: 'THÁNG 10',
                      TotalSales: monthlySales[9].TotalSales = parseInt(monthlySales[9].TotalSales) + parseInt(ordersList[i].totalAmt)
                  }
              }
              if (month === 11) {
                  monthlySales[10] = {
                      name: 'THÁNG 11',
                      TotalSales: monthlySales[10].TotalSales = parseInt(monthlySales[10].TotalSales) + parseInt(ordersList[i].totalAmt)
                  }
              }
              if (month === 12) {
                  monthlySales[11] = {
                      name: 'THÁNG 12',
                      TotalSales: monthlySales[11].TotalSales = parseInt(monthlySales[11].TotalSales) + parseInt(ordersList[i].totalAmt)
                  }
                }
              }
            }
          return response.status(200).json({
              totalSales: totalSales,
              monthlySales: monthlySales,
              error: false,
              success: true
            })
        
    } catch (error) {
        return response.status(500).json({
          message: error.message || error,
          error: true,
          success: false,
        });  
      }
}

// Tổng người dùng theo năm và tháng
export const totalUsersController = async (request, response) => {
  try {
        const users = await UserModel.aggregate([
            {
              $group: {
                      _id: 
                          { 
                            year: { $year: "$createdAt" }, 
                            month: { $month: "$createdAt" } 
                          },
                            count: { $sum: 1 },
                      },
            },
            {
              $sort: { "_id.year": 1, "_id.month": 1 },
            },
        ]);

        let monthlyUsers = [
                {
                    name: 'T1',
                    TotalUsers: 0
                },
                {
                    name: 'T2',
                    TotalUsers: 0
                },
                {
                    name: 'T3',
                    TotalUsers: 0
                },
                {
                    name: 'T4',
                    TotalUsers: 0
                },
                {
                    name: 'T5',
                    TotalUsers: 0
                },
                {
                    name: 'T6',
                    TotalUsers: 0
                },
                {
                    name: 'T7',
                    TotalUsers: 0
                },
                {
                    name: 'T8',
                    TotalUsers: 0
                },
                {
                    name: 'T9',
                    TotalUsers: 0
                },
                {
                    name: 'T10',
                    TotalUsers: 0
                },
                {
                    name: 'T11',
                    TotalUsers: 0
                },
                {
                    name: 'T12',
                    TotalUsers: 0
                },
            ];

        for (let i = 0; i < users.length; i++) {

          if (users[i]?._id?.month === 1) {
              monthlyUsers[0] = {
                  name: 'THÁNG 1',
                  TotalUsers: users[i].count
              }
          }
          if (users[i]?._id?.month === 2) {
              monthlyUsers[1] = {
                  name: 'THÁNG 2',
                  TotalUsers: users[i].count
              }
          }
          if (users[i]?._id?.month === 3) {
              monthlyUsers[2] = {
                  name: 'THÁNG 3',
                  TotalUsers: users[i].count
              }
          }
          if (users[i]?._id?.month === 4) {
              monthlyUsers[3] = {
                  name: 'THÁNG 4',
                  TotalUsers: users[i].count
              }
          }
          if (users[i]?._id?.month === 5) {
              monthlyUsers[4] = {
                  name: 'THÁNG 5',
                  TotalUsers: users[i].count
              }
          }
          if (users[i]?._id?.month === 6) {
              monthlyUsers[5] = {
                  name: 'THÁNG 6',
                  TotalUsers: users[i].count
              }
          }
          if (users[i]?._id?.month === 7) {
              monthlyUsers[6] = {
                  name: 'THÁNG 7',
                  TotalUsers: users[i].count
              }
          }
          if (users[i]?._id?.month === 8) {
              monthlyUsers[7] = {
                  name: 'THÁNG 8',
                  TotalUsers: users[i].count
              }
          }
          if (users[i]?._id?.month === 9) {
              monthlyUsers[8] = {
                  name: 'THÁNG 9',
                  TotalUsers: users[i].count
              }
          }
          if (users[i]?._id?.month === 10) {
              monthlyUsers[9] = {
                  name: 'THÁNG 10',
                  TotalUsers: users[i].count
              }
          }
          if (users[i]?._id?.month === 11) {
              monthlyUsers[10] = {
                  name: 'THÁNG 11',
                  TotalUsers: users[i].count
              }
          }
          if (users[i]?._id?.month === 12) {
              monthlyUsers[11] = {
                  name: 'THÁNG 12',
                  TotalUsers: users[i].count
              }
          }
        }
        return response.status(200).json({
            TotalUsers: monthlyUsers,
            error: false,
            success: true
        })

  } catch (error) {
      return response.status(500).json({
          message: error.message || error,
          error: true,
          success: false,
        }); 
  }
}

