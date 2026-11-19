package com.fixora.fixora_backend.repository;

import com.fixora.fixora_backend.model.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {
    Optional<UserAccount> findByPhone(String phone);
    List<UserAccount> findByRole(String role);
    List<UserAccount> findByRoleAndCategoryIgnoreCase(String role, String category);
}