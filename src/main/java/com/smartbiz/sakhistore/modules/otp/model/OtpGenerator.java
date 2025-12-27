package com.smartbiz.sakhistore.modules.otp.model;

import java.util.Random;

public class OtpGenerator {

    private static final int OTP_LENGTH = 6;
    private static final Random random = new Random();

    /**
     * Generates a random 6-digit OTP code
     * @return 6-digit OTP string
     */
    public static String generateOtp() {
        return String.format("%06d", random.nextInt(1000000));
    }

    /**
     * Generates OTP with custom length
     * @param length OTP length
     * @return OTP string
     */
    public static String generateOtp(int length) {
        int min = (int) Math.pow(10, length - 1);
        int max = (int) Math.pow(10, length) - 1;
        return String.format("%0" + length + "d", random.nextInt(max - min + 1) + min);
    }
}
