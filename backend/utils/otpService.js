const otpStore = new Map();

/**
 * Generate 6-digit OTP
 */
export const generateOTP = (mobile) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(mobile, otp);

  console.log(`OTP for ${mobile}: ${otp}`);

  return otp;
};

/**
 * Verify OTP
 */
export const verifyOTP = (mobile, otp) => {
  const storedOtp = otpStore.get(mobile);

  if (storedOtp && storedOtp === otp) {
    otpStore.delete(mobile);
    return true;
  }
  return false;
};
