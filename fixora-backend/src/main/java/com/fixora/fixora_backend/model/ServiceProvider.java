package com.fixora.fixora_backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "service_providers")
public class ServiceProvider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String phone;
    private String category; // Plumber, Electrician, Carpenter
    private Double rating;
    private Integer completedJobs;
    private Boolean available;

    public ServiceProvider() {
        this.rating = 4.8;
        this.completedJobs = 10;
        this.available = true;
    }

    public ServiceProvider(String name, String phone, String category, Double rating, Integer completedJobs) {
        this.name = name;
        this.phone = phone;
        this.category = category;
        this.rating = rating;
        this.completedJobs = completedJobs;
        this.available = true;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Integer getCompletedJobs() {
        return completedJobs;
    }

    public void setCompletedJobs(Integer completedJobs) {
        this.completedJobs = completedJobs;
    }

    public Boolean getAvailable() {
        return available;
    }

    public void setAvailable(Boolean available) {
        this.available = available;
    }
}