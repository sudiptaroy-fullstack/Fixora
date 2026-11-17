package com.fixora.fixora_backend.repository;

import com.fixora.fixora_backend.model.ServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    List<ServiceRequest> findByCustomerPhone(String customerPhone);
    List<ServiceRequest> findByStatus(String status);
}