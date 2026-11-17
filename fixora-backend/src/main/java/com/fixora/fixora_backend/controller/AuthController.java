package com.fixora.fixora_backend.controller;

import com.fixora.fixora_backend.model.User;
import com.fixora.fixora_backend.repository.UserRepository;
import com.fixora.fixora_backend.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Allows your React frontend to connect later
public class AuthController {

    @Autowired
    private OtpService otpService;

    @Autowired
    private UserRepository userRepository;

    // 1. Endpoint to Request OTP
    @PostMapping("/send-otp")
    public ResponseEntity<String> sendOtp(@RequestParam String phoneNumber) {
        String generatedOtp = otpService.generateOtp(phoneNumber);

        // Find user or create a new one if it's their first time
        User user = userRepository.findByPhoneNumber(phoneNumber)
                .orElse(new User());

        user.setPhoneNumber(phoneNumber);
        user.setOtp(generatedOtp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5)); // Valid for 5 mins
        if (user.getRole() == null) {
            user.setRole("CUSTOMER"); // Default role
        }

        userRepository.save(user);

        return ResponseEntity.ok("OTP sent successfully to " + phoneNumber);
    }

    // 2. Endpoint to Verify OTP
    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestParam String phoneNumber, @RequestParam String otp) {
        Optional<User> optionalUser = userRepository.findByPhoneNumber(phoneNumber);

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (user.getOtp() != null && user.getOtp().equals(otp)) {
                if (user.getOtpExpiry().isAfter(LocalDateTime.now())) {
                    return ResponseEntity.ok("Login successful! Welcome to Fixora.");
                } else {
                    return ResponseEntity.badRequest().body("Error: OTP has expired.");
                }
            }
        }
        return ResponseEntity.badRequest().body("Error: Invalid phone number or OTP.");
    }
}