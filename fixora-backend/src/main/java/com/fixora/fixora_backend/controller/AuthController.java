package com.fixora.fixora_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final Map<String, String> otpStorage = new ConcurrentHashMap<>();
    private final SecureRandom secureRandom = new SecureRandom();

    @PostMapping("/send-otp")
    public ResponseEntity sendOtp(@RequestParam String phoneNumber,
                                  @RequestParam(defaultValue = "CUSTOMER") String role) {
        String otp = String.valueOf(100000 + secureRandom.nextInt(900000));
        otpStorage.put(phoneNumber, otp);

        System.out.println("==========================================");
        System.out.println("[FIXORA SMS GATEWAY] Role: " + role + " | To: +91-" + phoneNumber + " | OTP: " + otp);
        System.out.println("==========================================");

        Map<String, Object> response = new HashMap<>();
        response.put("status", "sent");
        response.put("phoneNumber", phoneNumber);
        response.put("role", role);
        response.put("liveSmsOtp", otp);
        response.put("message", "OTP dispatched via Fixora SMS Gateway to +91 " + phoneNumber);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity verifyOtp(@RequestParam String phoneNumber, @RequestParam String otp) {
        Map<String, Object> response = new HashMap<>();
        String storedOtp = otpStorage.get(phoneNumber);

        if (storedOtp != null && storedOtp.equals(otp.trim())) {
            otpStorage.remove(phoneNumber);
            response.put("verified", true);
            response.put("message", "Authentication successful");
            return ResponseEntity.ok(response);
        }
        response.put("verified", false);
        response.put("message", "Invalid or expired OTP");
        return ResponseEntity.status(401).body(response);
    }
}