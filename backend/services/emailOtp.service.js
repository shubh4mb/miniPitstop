// Helper function to send OTP email
import nodemailer from 'nodemailer';
import dotenv from 'dotenv'; 

export const sendOTPEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for miniPitstop Signup',
      text: `Your OTP code is: ${otp}. It is valid for 2 minutes`,
    };
  
    await transporter.sendMail(mailOptions);
  };