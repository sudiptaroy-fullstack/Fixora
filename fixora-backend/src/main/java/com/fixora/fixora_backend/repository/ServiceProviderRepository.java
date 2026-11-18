package com.fixora.fixora_backend.repository;

import com.fixora.fixora_backend.model.ServiceProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceProviderRepository extends JpaRepository<ServiceProvider, Long> {
    List<ServiceProvider> findByCategoryIgnoreCase(String category);
    List<ServiceProvider> findByAvailableTrue();
}