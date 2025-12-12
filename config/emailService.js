import http from 'http';
import nodemailer from 'nodemailer'

// Cấu hình bộ vận chuyển SMTP
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // e.g., 'smtp.gmail.com' for Gmail
    port: 465, // or 465 for secure
    secure: true, // đúng cho cổng 465, sai cho các cổng khác
    auth: {
        user: process.env.EMAIL, // your SMTP username
        pass: process.env.EMAIL_PASS, // your password
    },  
});

// Chức năng gửi email
async function sendEmail(to, subject, text, html) {
try {
    const info = await transporter.sendMail({
    from: process.env.EMAIL, // địa chỉ người gửi
    to, // danh sách người nhận
    subject, // Subject line
    text, // plain text body
    html, // html body
});
    return { success : true, messageId: info.messageId };
} catch (error) {
    console.error('Lỗi gửi email:', error);
    return { success: false, error: error.message };
    }
}

export { sendEmail };