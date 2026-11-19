package com.fixora.fixora_backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "user_accounts")
public class UserAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String phone;

    private String role; // CUSTOMER or PROVIDER
    private String fullName;
    private String email;
    private String address;
    private String city;
    private String category; // For PROVIDER: Plumber, Electrician, Carpenter
    private String bio;
    private Double walletBalance;
    private Double rating;
    private Integer completedJobs;

    public UserAccount() {
        this.walletBalance = 1500.0;
        this.rating = 4.8;
        this.completedJobs = 0;
        this.city = "Kolkata / Howrah";
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public Double getWalletBalance() { return walletBalance; }
    public void setWalletBalance(Double walletBalance) { this.walletBalance = walletBalance; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getCompletedJobs() { return completedJobs; }
    public void setCompletedJobs(Integer completedJobs) { this.completedJobs = completedJobs; }
}