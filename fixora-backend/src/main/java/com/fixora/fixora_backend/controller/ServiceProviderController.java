package com.fixora.fixora_backend.controller;

import com.fixora.fixora_backend.model.ServiceProvider;
import com.fixora.fixora_backend.repository.ServiceProviderRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/providers")
@CrossOrigin(origins = "*")
public class ServiceProviderController {

    @Autowired
    private ServiceProviderRepository providerRepository;

    // Automatically adds 3 default technicians into MySQL on startup if table is empty
    @PostConstruct
    public void initDefaultProviders() {
        if (providerRepository.count() == 0) {
            providerRepository.save(new ServiceProvider("Rajesh Sharma", "9800000001", "Plumber", 4.9, 42));
            providerRepository.save(new ServiceProvider("Amit Verma", "9800000002", "Electrician", 4.8, 38));
            providerRepository.save(new ServiceProvider("Suresh Das", "9800000003", "Carpenter", 4.7, 29));
        }
    }

    // 1. Get all providers
    @GetMapping("/list")
    public ResponseEntity getAllProviders() {
        List<ServiceProvider> providers = providerRepository.findAll();
        return ResponseEntity.ok(providers);
    }

    // 2. Get providers by category (Plumber, Electrician, Carpenter)
    @GetMapping("/category/{category}")
    public ResponseEntity getProvidersByCategory(@PathVariable String category) {
        List<ServiceProvider> providers = providerRepository.findByCategoryIgnoreCase(category);
        return ResponseEntity.ok(providers);
    }

    // 3. Register a new service provider
    @PostMapping("/register")
    public ResponseEntity registerProvider(@RequestBody ServiceProvider provider) {
        if (provider.getRating() == null) provider.setRating(4.8);
        if (provider.getCompletedJobs() == null) provider.setCompletedJobs(0);
        if (provider.getAvailable() == null) provider.setAvailable(true);
        ServiceProvider saved = providerRepository.save(provider);
        return ResponseEntity.ok(saved);
    }

    // 4. Toggle provider availability (Online / Offline)
    @PutMapping("/{id}/availability")
    public ResponseEntity updateAvailability(@PathVariable Long id, @RequestParam Boolean available) {
        Optional<ServiceProvider> optional = providerRepository.findById(id);
        if (optional.isPresent()) {
            ServiceProvider provider = optional.get();
            provider.setAvailable(available);
            return ResponseEntity.ok(providerRepository.save(provider));
        }
        return ResponseEntity.badRequest().body("Provider not found with id: " + id);
    }
}