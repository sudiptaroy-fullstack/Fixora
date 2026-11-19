package com.fixora.fixora_backend.service;

import com.fixora.fixora_backend.model.UserAccount;
import com.fixora.fixora_backend.repository.UserAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class AiRecommendationService {

    @Autowired
    private UserAccountRepository userRepo;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    public Map<String, Object> recommendProvider(String problemDescription) {
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
            throw new RuntimeException("Missing gemini.api.key in application.properties!");
        }

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(8000);
        RestTemplate restTemplate = new RestTemplate(factory);

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key="
                + geminiApiKey.trim();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String prompt = "You are the Fixora AI Home Service Diagnostic Engine. "
                + "Analyze this customer issue: \"" + problemDescription + "\". "
                + "Respond ONLY with a single line containing 4 pipe-separated fields with no markdown or extra text: "
                + "CATEGORY|URGENCY|PRICE|DIAGNOSIS "
                + "where CATEGORY is Plumber or Electrician or Carpenter, "
                + "URGENCY is HIGH or STANDARD, "
                + "PRICE is a number like 399 or 499 or 549 or 699, "
                + "and DIAGNOSIS is 1 concise technical sentence explaining root cause and required tools.";

        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);

        Map<String, Object> contentObj = new HashMap<>();
        contentObj.put("parts", Collections.singletonList(textPart));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", Collections.singletonList(contentObj));

        HttpEntity requestEntity = new HttpEntity(requestBody, headers);
        Map apiResponse = restTemplate.postForObject(url, requestEntity, Map.class);

        String aiRawText = extractGeminiText(apiResponse);
        String cleaned = aiRawText.replace("```", "").trim();
        String[] parts = cleaned.split("\\|", 4);

        String category = parts.length > 0 && !parts[0].trim().isEmpty() ? parts[0].trim() : "Plumber";
        String urgency = parts.length > 1 && !parts[1].trim().isEmpty() ? parts[1].trim() : "STANDARD";

        double estimatedPrice = 499.0;
        if (parts.length > 2) {
            try {
                estimatedPrice = Double.parseDouble(parts[2].trim().replaceAll("[^0-9.]", ""));
            } catch (NumberFormatException ignored) {
                estimatedPrice = 499.0;
            }
        }

        String diagnosis = parts.length > 3 && !parts[3].trim().isEmpty()
                ? parts[3].trim()
                : cleaned;

        List<UserAccount> providers = userRepo.findByRoleAndCategoryIgnoreCase("PROVIDER", category);
        UserAccount bestProvider = null;
        if (providers != null && !providers.isEmpty()) {
            for (UserAccount candidate : providers) {
                if (bestProvider == null) {
                    bestProvider = candidate;
                } else {
                    double candRating = candidate.getRating() != null ? candidate.getRating() : 0.0;
                    double bestRating = bestProvider.getRating() != null ? bestProvider.getRating() : 0.0;
                    if (candRating > bestRating) {
                        bestProvider = candidate;
                    }
                }
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("category", category);
        result.put("providerName", bestProvider != null ? bestProvider.getFullName() : "Available Specialist");
        result.put("rating", bestProvider != null ? bestProvider.getRating() : 4.9);
        result.put("completedJobs", bestProvider != null ? bestProvider.getCompletedJobs() : 10);
        result.put("confidence", "95%");
        result.put("urgency", urgency);
        result.put("estimatedPrice", estimatedPrice);
        result.put("matchReason", diagnosis);
        return result;
    }

    private String extractGeminiText(Map apiResponse) {
        if (apiResponse == null) {
            throw new RuntimeException("Empty response from Gemini API");
        }
        Object candidatesObj = apiResponse.get("candidates");
        if (!(candidatesObj instanceof List)) {
            throw new RuntimeException("Unexpected Gemini response format: " + apiResponse);
        }
        List candidates = (List) candidatesObj;
        if (candidates.isEmpty() || !(candidates.get(0) instanceof Map)) {
            throw new RuntimeException("No candidates returned by Gemini API");
        }
        Map firstCandidate = (Map) candidates.get(0);
        Object contentObj = firstCandidate.get("content");
        if (!(contentObj instanceof Map)) {
            throw new RuntimeException("Missing content in Gemini candidate");
        }
        Map contentMap = (Map) contentObj;
        Object partsObj = contentMap.get("parts");
        if (!(partsObj instanceof List) || ((List) partsObj).isEmpty()) {
            throw new RuntimeException("Missing parts in Gemini content");
        }
        Object firstPartObj = ((List) partsObj).get(0);
        if (!(firstPartObj instanceof Map)) {
            throw new RuntimeException("Invalid part structure in Gemini response");
        }
        Object textObj = ((Map) firstPartObj).get("text");
        return textObj != null ? textObj.toString() : "";
    }
}