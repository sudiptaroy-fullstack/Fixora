package com.fixora.fixora_backend.service;

import com.fixora.fixora_backend.model.ServiceRequest;
import com.fixora.fixora_backend.repository.ServiceRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ServiceRequestService {

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    public ServiceRequest createRequest(ServiceRequest request) {
        request.setStatus("PENDING");
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
            return serviceRequestRepository.save(request);
        }
        throw new RuntimeException("Service request not found with id: " + id);
    }

    // NEW METHOD 1: Get all bookings for one specific customer phone number
    public List<ServiceRequest> getRequestsByCustomer(String phone) {
        return serviceRequestRepository.findByCustomerPhone(phone);
    }

    // NEW METHOD 2: Get all bookings filtered by status (PENDING, ACCEPTED, COMPLETED)
    public List<ServiceRequest> getRequestsByStatus(String status) {
        return serviceRequestRepository.findByStatus(status);
    }
}