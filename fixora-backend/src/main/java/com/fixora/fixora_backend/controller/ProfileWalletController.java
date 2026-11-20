package com.fixora.fixora_backend.controller;

import com.fixora.fixora_backend.model.UserAccount;
import com.fixora.fixora_backend.repository.UserAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class ProfileWalletController {

    @Autowired
    private UserAccountRepository userRepo;

    // Fetch providers filtered by service category (e.g. GET /api/users/providers/by-service?category=Plumber)
    @GetMapping("/providers/by-service")
    public ResponseEntity<List<UserAccount>> getProvidersByService(@RequestParam String category) {
        if (category == null || category.isBlank() || "ALL".equalsIgnoreCase(category)) {
            return ResponseEntity.ok(userRepo.findByRole("PROVIDER"));
        }
        return ResponseEntity.ok(
                userRepo.findByRoleAndCategoryIgnoreCase("PROVIDER", category.trim())
        );
    }

    // 1. Fetch User Profile & Wallet strictly from MySQL
    @GetMapping("/profile/{phone}")
    public ResponseEntity<?> getProfile(@PathVariable String phone,
                                        @RequestParam(defaultValue = "CUSTOMER") String role) {
        Optional<UserAccount> existing = userRepo.findByPhone(phone);
        if (existing.isEmpty()) {
            return ResponseEntity.status(404).body("User profile not found in database.");
        }
        return ResponseEntity.ok(existing.get());
    }

    // 2. Update User Profile in MySQL
    @PutMapping("/profile/{phone}")
    public ResponseEntity<?> updateProfile(@PathVariable String phone, @RequestBody UserAccount updated) {
        Optional<UserAccount> existingOpt = userRepo.findByPhone(phone);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User profile not found in database.");
        }
        UserAccount user = existingOpt.get();
        if (updated.getFullName() != null) user.setFullName(updated.getFullName());
        if (updated.getEmail() != null) user.setEmail(updated.getEmail());
        if (updated.getAddress() != null) user.setAddress(updated.getAddress());
        if (updated.getCity() != null) user.setCity(updated.getCity());
        if (updated.getCategory() != null) user.setCategory(updated.getCategory());
        if (updated.getBio() != null) user.setBio(updated.getBio());
        return ResponseEntity.ok(userRepo.save(user));
    }

    // 3. Fetch all registered Service Providers directly from MySQL
    @GetMapping("/providers")
    public ResponseEntity<List<UserAccount>> listAllProviders() {
        return ResponseEntity.ok(userRepo.findByRole("PROVIDER"));
    }

    // 4. Add Funds to Wallet in MySQL
    @PostMapping("/wallet/{phone}/topup")
    public ResponseEntity<?> topupWallet(@PathVariable String phone, @RequestParam Double amount) {
        Optional<UserAccount> existingOpt = userRepo.findByPhone(phone);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User profile not found in database.");
        }
        UserAccount user = existingOpt.get();
        user.setWalletBalance((user.getWalletBalance() != null ? user.getWalletBalance() : 0.0) + amount);
        return ResponseEntity.ok(userRepo.save(user));
    }

    // 5. Withdraw Funds from Wallet in MySQL
    @PostMapping("/wallet/{phone}/withdraw")
    public ResponseEntity<?> withdrawWallet(@PathVariable String phone, @RequestParam Double amount) {
        Optional<UserAccount> opt = userRepo.findByPhone(phone);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404).body("User account not found in database.");
        }
        UserAccount user = opt.get();
        double current = user.getWalletBalance() != null ? user.getWalletBalance() : 0.0;
        if (amount == null || amount <= 0 || amount > current) {
            return ResponseEntity.badRequest().body("Insufficient wallet balance.");
        }
        user.setWalletBalance(current - amount);
        return ResponseEntity.ok(userRepo.save(user));
    }
}