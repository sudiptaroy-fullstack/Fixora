package com.fixora.fixora_backend.repository;

import com.fixora.fixora_backend.model.ServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    List<ServiceRequest> findByCustomerPhone(String customerPhone);
    List<ServiceRequest> findByProviderPhone(String providerPhone);
    List<ServiceRequest> findByStatus(String status);
}