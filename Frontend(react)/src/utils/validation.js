/**
 * Validation Utility Functions
 */

/**
 * Validate phone number (10 digits)
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate OTP (6 digits)
 */
export const validateOTP = (otp) => {
  const otpRegex = /^[0-9]{6}$/;
  return otpRegex.test(otp);
};

/**
 * Validate email
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate required field
 */
export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

/**
 * Sanitize input
 */
export const sanitizeInput = (input) => {
  return input.trim().replace(/[<>]/g, '');
};
