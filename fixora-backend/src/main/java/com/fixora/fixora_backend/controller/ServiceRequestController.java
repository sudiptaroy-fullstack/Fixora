package com.fixora.fixora_backend.controller;

import com.fixora.fixora_backend.model.ServiceRequest;
import com.fixora.fixora_backend.repository.ServiceRequestRepository;
import com.fixora.fixora_backend.repository.UserAccountRepository;
import com.fixora.fixora_backend.service.AiRecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "*")
public class ServiceRequestController {

    @Autowired
    private ServiceRequestRepository requestRepo;

    @Autowired
    private UserAccountRepository userRepo;

    @Autowired
    private AiRecommendationService aiRecommendationService;

    // 1. Customer directly books a specific Provider (UPI/Razorpay or Cash on Delivery)
    @PostMapping("/create")
    public ResponseEntity createRequest(@RequestBody ServiceRequest request) {
        request.setStatus("PENDING");
        double amount = request.getPrice() != null ? request.getPrice() : 499.0;
        request.setPrice(amount);

        if ("COD".equalsIgnoreCase(request.getPaymentMethod())) {
            request.setPaymentStatus("COD_PENDING");
        } else {
            request.setPaymentStatus("ESCROW_HELD");
        }

        return ResponseEntity.ok(requestRepo.save(request));
    }

    // 2. Get all bookings for a specific Customer
    @GetMapping("/customer/{phone}")
    public ResponseEntity<List<ServiceRequest>> getCustomerRequests(@PathVariable String phone) {
        return ResponseEntity.ok(requestRepo.findByCustomerPhone(phone));
    }

    // 3. Get all bookings sent directly to a specific Provider
    @GetMapping("/provider/{phone}")
    public ResponseEntity<List<ServiceRequest>> getProviderRequests(@PathVariable String phone) {
        return ResponseEntity.ok(requestRepo.findByProviderPhone(phone));
    }

    // 4. Provider ACCEPTS or DECLINES a customer's booking (Real Wallet Credit / Customer Refund)
    @PutMapping("/{id}/respond")
    public ResponseEntity providerRespond(@PathVariable Long id, @RequestParam String action) {
        Optional<ServiceRequest> opt = requestRepo.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.badRequest().body("Booking not found");
        }

        ServiceRequest req = opt.get();
        double amount = req.getPrice() != null ? req.getPrice() : 499.0;

        if ("ACCEPT".equalsIgnoreCase(action)) {
            req.setStatus("ACCEPTED");
            if (!"COD".equalsIgnoreCase(req.getPaymentMethod())) {
                req.setPaymentStatus("CREDITED_TO_PROVIDER");
                if (req.getProviderPhone() != null) {
                    userRepo.findByPhone(req.getProviderPhone()).ifPresent(provider -> {
                        double current = provider.getWalletBalance() != null ? provider.getWalletBalance() : 0.0;
                        provider.setWalletBalance(current + amount);
                        userRepo.save(provider);
                    });
                }
            }
        } else if ("DECLINE".equalsIgnoreCase(action)) {
            req.setStatus("DECLINED");
            if (!"COD".equalsIgnoreCase(req.getPaymentMethod())) {
                req.setPaymentStatus("REFUNDED_TO_CUSTOMER");
                if (req.getCustomerPhone() != null) {
                    userRepo.findByPhone(req.getCustomerPhone()).ifPresent(customer -> {
                        double current = customer.getWalletBalance() != null ? customer.getWalletBalance() : 0.0;
                        customer.setWalletBalance(current + amount);
                        userRepo.save(customer);
                    });
                }
            } else {
                req.setPaymentStatus("CANCELLED");
            }
        } else if ("COMPLETE".equalsIgnoreCase(action)) {
            req.setStatus("COMPLETED");
            if ("COD".equalsIgnoreCase(req.getPaymentMethod())) {
                req.setPaymentStatus("COD_COLLECTED");
            }
            if (req.getProviderPhone() != null) {
                userRepo.findByPhone(req.getProviderPhone()).ifPresent(provider -> {
                    provider.setCompletedJobs((provider.getCompletedJobs() != null ? provider.getCompletedJobs() : 0) + 1);
                    userRepo.save(provider);
                });
            }
        }

        return ResponseEntity.ok(requestRepo.save(req));
    }

    // 5. Pure Live Gemini AI Diagnosis Endpoint
    @PostMapping("/ai-recommend")
    public ResponseEntity getAiRecommendation(@RequestBody Map<String, String> payload) {
        String description = payload.getOrDefault("problemDescription", "");
        return ResponseEntity.ok(aiRecommendationService.recommendProvider(description));
    }

    // 6. Admin Read-Only Platform Oversight & Analytics
    @GetMapping("/list")
    public ResponseEntity<List<ServiceRequest>> getAllRequests() {
        return ResponseEntity.ok(requestRepo.findAll());
    }

    @GetMapping("/admin/stats")
    public ResponseEntity getAdminStats() {
        List<ServiceRequest> all = requestRepo.findAll();
        long pendingCount = all.stream().filter(r -> "PENDING".equalsIgnoreCase(r.getStatus())).count();
        long acceptedCount = all.stream().filter(r -> "ACCEPTED".equalsIgnoreCase(r.getStatus())).count();
        long completedCount = all.stream().filter(r -> "COMPLETED".equalsIgnoreCase(r.getStatus())).count();
        long declinedCount = all.stream().filter(r -> "DECLINED".equalsIgnoreCase(r.getStatus())).count();
        double totalGmv = all.stream()
                .filter(r -> "ACCEPTED".equalsIgnoreCase(r.getStatus()) || "COMPLETED".equalsIgnoreCase(r.getStatus()))
                .mapToDouble(r -> r.getPrice() != null ? r.getPrice() : 0.0)
                .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRequests", all.size());
        stats.put("pendingJobs", pendingCount);
        stats.put("acceptedJobs", acceptedCount);
        stats.put("completedJobs", completedCount);
        stats.put("declinedJobs", declinedCount);
        stats.put("totalRevenue", totalGmv);
        return ResponseEntity.ok(stats);
    }
}