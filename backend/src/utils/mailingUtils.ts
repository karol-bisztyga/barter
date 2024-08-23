import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendVerificationEmail = (
  userEmail: string,
  verificationCode: string
): Promise<string> => {
  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: userEmail,
    subject: 'Barter - please confirm your email',
    text: `Here is your verification code: ${verificationCode}`,
  };
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject('Error sending email: ' + error);
      } else {
        resolve('Email sent: ' + info.response);
      }
    });
  });
};
