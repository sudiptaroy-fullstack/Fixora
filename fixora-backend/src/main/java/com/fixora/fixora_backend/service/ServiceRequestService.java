package com.fixora.fixora_backend.service;

import com.fixora.fixora_backend.model.ServiceProvider;
import com.fixora.fixora_backend.model.ServiceRequest;
import com.fixora.fixora_backend.repository.ServiceProviderRepository;
import com.fixora.fixora_backend.repository.ServiceRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ServiceRequestService {

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @Autowired
    private ServiceProviderRepository serviceProviderRepository;

    public ServiceRequest createRequest(ServiceRequest request) {
        request.setStatus("PENDING");
        if (request.getPrice() == null) {
            request.setPrice(499.0);
        }
        if (request.getProviderName() == null || request.getProviderName().isEmpty()) {
            request.setProviderName("Assigning technician...");
        }
        return serviceRequestRepository.save(request);
    }

    public List<ServiceRequest> getAllRequests() {
        return serviceRequestRepository.findAll();
    }

    public ServiceRequest updateStatus(Long id, String status) {
        Optional<ServiceRequest> optionalRequest = serviceRequestRepository.findById(id);
        if (optionalRequest.isPresent()) {
            ServiceRequest request = optionalRequest.get();
            request.setStatus(status);

            // Auto-assign the best matching provider from MySQL when ACCEPTED
            if ("ACCEPTED".equalsIgnoreCase(status) && request.getCategory() != null) {
                List<ServiceProvider> matches = serviceProviderRepository.findByCategoryIgnoreCase(request.getCategory());
                if (!matches.isEmpty()) {
                    request.setProviderName(matches.get(0).getName());
                }
            }

            // Increment provider's completed jobs count when COMPLETED
            if ("COMPLETED".equalsIgnoreCase(status) && request.getCategory() != null) {
                List<ServiceProvider> matches = serviceProviderRepository.findByCategoryIgnoreCase(request.getCategory());
                if (!matches.isEmpty()) {
                    ServiceProvider provider = matches.get(0);
                    provider.setCompletedJobs(provider.getCompletedJobs() + 1);
                    serviceProviderRepository.save(provider);
                }
            }

            return serviceRequestRepository.save(request);
        }
        throw new RuntimeException("Service request not found with id: " + id);
    }

    public List<ServiceRequest> getRequestsByCustomer(String phone) {
        return serviceRequestRepository.findByCustomerPhone(phone);
    }

    public List<ServiceRequest> getRequestsByStatus(String status) {
        return serviceRequestRepository.findByStatus(status);
    }
}