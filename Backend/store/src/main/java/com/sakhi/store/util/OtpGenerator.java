package com.sakhi.store.util;

import java.security.SecureRandom;

public class OtpGenerator {
    private static final SecureRandom RANDOM = new SecureRandom();

    public static String generateNumericOtp(int length) {
        int bound = (int) Math.pow(10, length);
        int min = bound / 10;
        int number = RANDOM.nextInt(bound - min) + min;
        return String.format("%0" + length + "d", number);
    }
}
