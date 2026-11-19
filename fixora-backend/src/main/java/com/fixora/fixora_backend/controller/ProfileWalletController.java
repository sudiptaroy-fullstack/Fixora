package com.fixora.fixora_backend.controller;

import com.fixora.fixora_backend.model.UserAccount;
import com.fixora.fixora_backend.repository.UserAccountRepository;
import jakarta.annotation.PostConstruct;
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

    @PostConstruct
    public void seedDefaultProviders() {
        createProviderIfMissing("9800000001", "Rajesh Sharma", "Plumber", "Master Hydro & Pipe Leak Specialist (8 yrs exp)", 4.9, 42);
        createProviderIfMissing("9800000002", "Amit Verma", "Electrician", "Certified Circuit, MCB & Inverter Technician (6 yrs exp)", 4.8, 38);
        createProviderIfMissing("9800000003", "Suresh Das", "Carpenter", "Architectural Woodwork & Smart Lock Specialist (10 yrs exp)", 4.7, 29);
    }

    private void createProviderIfMissing(String phone, String name, String cat, String bio, double rating, int jobs) {
        if (userRepo.findByPhone(phone).isEmpty()) {
            UserAccount p = new UserAccount();
            p.setPhone(phone);
            p.setRole("PROVIDER");
            p.setFullName(name);
            p.setCategory(cat);
            p.setBio(bio);
            p.setRating(rating);
            p.setCompletedJobs(jobs);
            p.setWalletBalance(2500.0);
            p.setAddress("Belur, Howrah");
            p.setCity("Howrah, WB");
            userRepo.save(p);
        }
    }

    // 1. Get or Auto-Create User Profile & Wallet by Phone
    @GetMapping("/profile/{phone}")
    public ResponseEntity getOrCreateProfile(@PathVariable String phone,
                                             @RequestParam(defaultValue = "CUSTOMER") String role) {
        Optional<UserAccount> existing = userRepo.findByPhone(phone);
        if (existing.isPresent()) {
            return ResponseEntity.ok(existing.get());
        }
        UserAccount newUser = new UserAccount();
        newUser.setPhone(phone);
        newUser.setRole(role);
        newUser.setFullName(role.equals("PROVIDER")
                ? "Partner " + phone.substring(Math.max(0, phone.length() - 4))
                : "Customer " + phone.substring(Math.max(0, phone.length() - 4)));
        newUser.setCategory(role.equals("PROVIDER") ? "Plumber" : null);
        newUser.setBio(role.equals("PROVIDER") ? "Verified Fixora Home Specialist" : "Verified Homeowner");
        newUser.setAddress("Howrah, West Bengal");
        newUser.setWalletBalance(role.equals("PROVIDER") ? 1000.0 : 2000.0);
        return ResponseEntity.ok(userRepo.save(newUser));
    }

    // 2. Update User Profile (Customer or Provider)
    @PutMapping("/profile/{phone}")
    public ResponseEntity updateProfile(@PathVariable String phone, @RequestBody UserAccount updated) {
        UserAccount user = userRepo.findByPhone(phone).orElse(new UserAccount());
        user.setPhone(phone);
        if (updated.getFullName() != null) user.setFullName(updated.getFullName());
        if (updated.getEmail() != null) user.setEmail(updated.getEmail());
        if (updated.getAddress() != null) user.setAddress(updated.getAddress());
        if (updated.getCity() != null) user.setCity(updated.getCity());
        if (updated.getCategory() != null) user.setCategory(updated.getCategory());
        if (updated.getBio() != null) user.setBio(updated.getBio());
        return ResponseEntity.ok(userRepo.save(user));
    }

    // 3. List all Service Providers so Customers can pick who to book
    @GetMapping("/providers")
    public ResponseEntity<List<UserAccount>> listAllProviders() {
        return ResponseEntity.ok(userRepo.findByRole("PROVIDER"));
    }

    // 4. Add Funds to Customer Wallet
    @PostMapping("/wallet/{phone}/topup")
    public ResponseEntity topupWallet(@PathVariable String phone, @RequestParam Double amount) {
        UserAccount user = userRepo.findByPhone(phone).orElseThrow();
        user.setWalletBalance((user.getWalletBalance() != null ? user.getWalletBalance() : 0.0) + amount);
        return ResponseEntity.ok(userRepo.save(user));
    }
}