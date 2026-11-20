package com.fixora.fixora_backend.controller;

import com.fixora.fixora_backend.model.ServicePackage;
import com.fixora.fixora_backend.repository.ServicePackageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalog")
@CrossOrigin(origins = "*")
public class CatalogController {

    @Autowired
    private ServicePackageRepository packageRepository;

    // Fetch all packages directly from MySQL
    @GetMapping("/packages")
    public ResponseEntity<List<ServicePackage>> getAllPackages(
            @RequestParam(required = false) String category) {
        if (category != null && !category.isBlank() && !"ALL".equalsIgnoreCase(category)) {
            return ResponseEntity.ok(packageRepository.findByCategoryIgnoreCase(category.trim()));
        }
        return ResponseEntity.ok(packageRepository.findAll());
    }

    // Create a new service package in MySQL
    @PostMapping("/packages")
    public ResponseEntity<ServicePackage> createPackage(@RequestBody ServicePackage pkg) {
        return ResponseEntity.ok(packageRepository.save(pkg));
    }

    // Delete a package by ID
    @DeleteMapping("/packages/{id}")
    public ResponseEntity<?> deletePackage(@PathVariable Long id) {
        if (!packageRepository.existsById(id)) {
            return ResponseEntity.status(404).body("Service package not found.");
        }
        packageRepository.deleteById(id);
        return ResponseEntity.ok("Package deleted.");
    }
}