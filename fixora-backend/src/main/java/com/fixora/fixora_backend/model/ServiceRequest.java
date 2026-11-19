package com.fixora.fixora_backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "service_requests")
public class ServiceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String problemDescription;
    private String category;       // Plumber, Electrician, Carpenter
    private String status;         // PENDING, ACCEPTED, DECLINED, COMPLETED
    private String customerPhone;
    private String customerName;
    private String providerPhone;  // Direct link to chosen Provider
    private String providerName;
    private Double price;
    private String paymentMethod;  // RAZORPAY_UPI, COD
    private String paymentStatus;  // ESCROW_HELD, CREDITED_TO_PROVIDER, REFUNDED_TO_CUSTOMER, COD_PENDING, COD_COLLECTED

    public ServiceRequest() {
        this.status = "PENDING";
        this.price = 499.0;
        this.paymentMethod = "RAZORPAY_UPI";
        this.paymentStatus = "ESCROW_HELD";
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProblemDescription() { return problemDescription; }
    public void setProblemDescription(String problemDescription) { this.problemDescription = problemDescription; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getProviderPhone() { return providerPhone; }
    public void setProviderPhone(String providerPhone) { this.providerPhone = providerPhone; }

    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
}