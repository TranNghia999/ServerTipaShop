// Các hàm - code cũ
// import { sendEmail } from "./emailService.js";


// const sendEmailFun=async(to, subject, text, html)=>{
//     const result = await sendEmail(to, subject, text, html);
//     if (result.success) {
//         return true;
//        // res.status(200).json({ message: 'Email sent successfully', messageId: result.messageId })
//     } else {
//         return false;
//        //  res.status(500).json({ message: 'Failed to send email', error: result.error });
//     }
// }

// export default sendEmailFun;


// sendEmail.js
import { sendEmail } from "./emailService.js";

const sendEmailFun = async (to, subject, text, html) => {
  try {
    // ✅ Kiểm tra đầu vào
    if (!to || typeof to !== "string") {
      throw new Error(`Email người nhận (to) không hợp lệ: ${to}`);
    }

    if (!subject || typeof subject !== "string") {
      throw new Error(`Tiêu đề email (subject) không hợp lệ: ${subject}`);
    }

    if (!html || typeof html !== "string") {
      throw new Error(`Nội dung HTML email (html) không hợp lệ hoặc undefined.`);
    }

    const result = await sendEmail(to, subject, text || "", html);

    if (result.success) {
      console.log(`✅ Email đã gửi thành công đến: ${to}`);
      return { success: true };
    } else {
      console.error("❌ Lỗi gửi email:", result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error("🚨 Lỗi khi gửi email:", error.message);
    return { success: false, error: error.message };
  }
};

export default sendEmailFun;
