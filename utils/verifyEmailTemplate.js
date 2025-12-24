const VerificationEmail = (username, otp) => {

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác thực Email</title>
  <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; color: #333; }
      .container { max-width: 600px; margin: 20px auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
      .header { text-align: center; border-bottom: 1px solid #eee;  padding-bottom: 10px;  margin-bottom: 20px;  }
      .header h1 { color: #4CAF50; }
      .content { text-align: center; }
      .content p { font-size: 16px;  line-height: 1.5; }
      .otp { font-size: 20px; font-weight: bold; color: #0055e5; margin: 20px 0; }
      .footer { text-align: center; font-size: 14px; color: #777;  margin-top: 20px;}
  </style>
</head>

<body>
  <div class="container">
    <div class="header">
      <h1>Xin chào ${username}, vui lòng xác thực email</h1>
    </div>
    <div class="content">
    
      <p>Vui lòng sử dụng <strong>mã xác thực (OTP)</strong> bên dưới để hoàn tất quá trình đăng ký:</p>
      <div class="otp">${otp}</div>
      <p> 
        Mã xác thực có hiệu lực trong vòng <strong>3 phút</strong> kể từ thời điểm nhận email.
        Vui lòng không chia sẻ mã này với bất kỳ ai.
      </p>
      <p>Nếu bạn không thực hiện đăng ký tài khoản, hãy bỏ qua email này.</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Công ty TNHH SX – TM Tín Phát Việt. Bảo lưu mọi quyền.</p>
    </div>
  </div>
</body>
`;
};

export default VerificationEmail;