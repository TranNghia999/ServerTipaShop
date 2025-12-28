import jwt from 'jsonwebtoken'

const auth = async (request, response, next) => {
  try {
    const token = request.cookies.accessToken || request.headers?.authorization?.split(" ")[1];

    // if(!token){
    //   token = request.query.token;
    // }

    if (!token) {
      return response.status(401).json({
        message: "Vui lòng đăng nhập lại"
      })
    }

    const decode = await jwt.verify( token, process.env.SECRET_KEY_ACCESS_TOKEN )
      if(!decode){
        return response.status(401).json({
            message : "Quyền hạn đã hết. Vui lòng đăng nhập lại",
            error : true,
            success : false
        })
    }
    request.userId = decode.id;

    next()

  } catch (error) {
    return response.status(500).json({
      message: "Bạn chưa đăng nhập", //error.message || error,
      error: true,
      success: false
    })
  }
}

export default auth;