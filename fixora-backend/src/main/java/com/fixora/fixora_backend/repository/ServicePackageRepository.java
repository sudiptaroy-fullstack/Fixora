package com.fixora.fixora_backend.repository;

import com.fixora.fixora_backend.model.ServicePackage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ServicePackageRepository extends JpaRepository<ServicePackage, Long> {
    List<ServicePackage> findByCategoryIgnoreCase(String category);
}