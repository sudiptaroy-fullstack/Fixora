package com.fixora.fixora_backend.service;

import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class AiRecommendationService {

    public Map<String, Object> recommendProvider(String problemDescription) {
        String lowerDesc = problemDescription != null ? problemDescription.toLowerCase() : "";
        Map<String, Object> recommendation = new HashMap<>();

        if (lowerDesc.contains("tap") || lowerDesc.contains("leak") || lowerDesc.contains("pipe") || lowerDesc.contains("water")) {
            recommendation.put("category", "Plumber");
            recommendation.put("providerName", "Amit Sen");
            recommendation.put("rating", 4.8);
            recommendation.put("completedJobs", 1700);
            recommendation.put("matchReason", "AI matched based on plumbing repair expertise with 95% confidence.");
        } else if (lowerDesc.contains("wire") || lowerDesc.contains("socket") || lowerDesc.contains("light") || lowerDesc.contains("fan") || lowerDesc.contains("power")) {
            recommendation.put("category", "Electrician");
            recommendation.put("providerName", "Rakesh Das");
            recommendation.put("rating", 4.9);
            recommendation.put("completedJobs", 2100);
            recommendation.put("matchReason", "AI matched based on electrical safety rating and local proximity.");
        } else if (lowerDesc.contains("wood") || lowerDesc.contains("door") || lowerDesc.contains("furniture") || lowerDesc.contains("lock")) {
            recommendation.put("category", "Carpenter");
            recommendation.put("providerName", "Bappa Mondal");
            recommendation.put("rating", 4.8);
            recommendation.put("completedJobs", 1300);
            recommendation.put("matchReason", "AI matched for specialized woodwork and hardware installation.");
        } else {
            recommendation.put("category", "General Handyman");
            recommendation.put("providerName", "Fixora Verified Partner");
            recommendation.put("rating", 4.7);
            recommendation.put("completedJobs", 950);
            recommendation.put("matchReason", "AI matched best available general service professional nearby.");
        }

        return recommendation;
    }
}