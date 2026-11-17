package com.fixora.fixora_backend.controller;

import com.fixora.fixora_backend.model.ServiceRequest;
import com.fixora.fixora_backend.service.AiRecommendationService;
import com.fixora.fixora_backend.service.ServiceRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "*")
public class ServiceRequestController {

    @Autowired
    private ServiceRequestService serviceRequestService;

    @Autowired
    private AiRecommendationService aiRecommendationService;

    // 1. Create a new service booking request
    @PostMapping("/create")
    public ResponseEntity<ServiceRequest> createRequest(@RequestBody ServiceRequest request) {
        ServiceRequest created = serviceRequestService.createRequest(request);
        return ResponseEntity.ok(created);
    }

    // 2. List all service requests (for provider/admin dashboard)
    @GetMapping("/list")
    public ResponseEntity<List<ServiceRequest>> getAllRequests() {
        List<ServiceRequest> requests = serviceRequestService.getAllRequests();
        return ResponseEntity.ok(requests);
    }

    // 3. Update job status (PENDING -> ACCEPTED -> COMPLETED)
    @PutMapping("/{id}/status")
    public ResponseEntity<ServiceRequest> updateStatus(@PathVariable Long id, @RequestParam String status) {
        ServiceRequest updated = serviceRequestService.updateStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    // 4. AI Recommendation Endpoint
    @PostMapping("/ai-recommend")
    public ResponseEntity> getAiRecommendation(@RequestBody Map<String, String> payload) {
        String description = payload.getOrDefault("problemDescription", "");
        Map<String, Object> recommendation = aiRecommendationService.recommendProvider(description);
        return ResponseEntity.ok(recommendation);
    }
}