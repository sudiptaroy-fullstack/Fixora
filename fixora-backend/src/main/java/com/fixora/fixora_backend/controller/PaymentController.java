package com.fixora.fixora_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    // 1. Create a mock Razorpay Order ID
    @PostMapping("/create-order")
    public ResponseEntity createOrder(@RequestBody Map<String, Object> data) {
        double amount = Double.parseDouble(data.getOrDefault("amount", "500").toString());

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", "order_" + UUID.randomUUID().toString().substring(0, 10));
        response.put("amount", (int) (amount * 100)); // Amount in paise (e.g., 500 INR = 50000 paise)
        response.put("currency", "INR");
        response.put("status", "created");

        return ResponseEntity.ok(response);
    }

    // 2. Verify Payment
    @PostMapping("/verify")
    public ResponseEntity verifyPayment(@RequestBody Map<String, String> paymentData) {
        String paymentId = paymentData.get("razorpayPaymentId");

        Map<String, String> result = new HashMap<>();
        if (paymentId != null && !paymentId.isEmpty()) {
            result.put("status", "success");
            result.put("message", "Payment verified successfully!");
        } else {
            result.put("status", "failed");
            result.put("message", "Invalid payment ID.");
        }
        return ResponseEntity.ok(result);
    }
}