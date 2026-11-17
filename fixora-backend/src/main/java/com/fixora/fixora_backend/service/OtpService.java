package com.fixora.fixora_backend.service;

import org.springframework.stereotype.Service;
import java.util.Random;

@Service
public class OtpService {

    public String generateOtp(String phoneNumber) {
        // Generate a random 6-digit number between 100000 and 999999
        Random random = new Random();
        int otpNumber = 100000 + random.nextInt(900000);
        String otp = String.valueOf(otpNumber);

        // Print to IntelliJ run console for instant testing during development
        System.out.println("========================================");
        System.out.println("[OTP SERVICE] Generated OTP for " + phoneNumber + ": " + otp);
        System.out.println("========================================");

        return otp;
    }
}
