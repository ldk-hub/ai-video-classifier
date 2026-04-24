package com.nexus.classifier.video.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;

@Slf4j
@Service
public class VideoAnalysisService {

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public VideoAnalysisResult analyzeVideo(String filePath) {
        log.info("Analyzing video with ffprobe: {}", filePath);
        VideoAnalysisResult result = new VideoAnalysisResult();
        
        File file = new File(filePath);
        if (!file.exists()) {
            log.error("File does not exist: {}", filePath);
            result.setSuccess(false);
            result.setQualityLabel("Unknown");
            return result;
        }

        try {
            ProcessBuilder pb = new ProcessBuilder(
                    "ffprobe", 
                    "-v", "error", 
                    "-select_streams", "v:0", 
                    "-show_entries", "stream=width,height", 
                    "-of", "csv=s=x:p=0", 
                    filePath
            );
            pb.redirectErrorStream(true);
            Process process = pb.start();
            
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line = reader.readLine();
                if (line != null && !line.isEmpty()) {
                    String[] parts = line.split("x");
                    if (parts.length == 2) {
                        int width = Integer.parseInt(parts[0].trim());
                        int height = Integer.parseInt(parts[1].trim());
                        
                        result.setResolution(width + "x" + height);
                        result.setLowQuality(width < 1280 || height < 720);
                        
                        if (height >= 2160) result.setQualityLabel("4K");
                        else if (height >= 1080) result.setQualityLabel("1080p");
                        else if (height >= 720) result.setQualityLabel("720p");
                        else result.setQualityLabel(height + "p");
                    }
                }
            }
            process.waitFor();
            result.setSuccess(true);
            
            if (result.getQualityLabel() == null) {
                result.setQualityLabel("Unknown");
            }
        } catch (Exception e) {
            log.error("Failed to analyze video with ffprobe. Ensure ffprobe is installed.", e);
            result.setSuccess(false);
            result.setQualityLabel("Unknown");
            result.setLowQuality(false);
        }
        return result;
    }
    
    public String analyzeContentCategory(String filename) {
        if (geminiApiKey != null && !geminiApiKey.isEmpty()) {
            try {
                return callGeminiApi(filename);
            } catch (Exception e) {
                log.warn("Gemini API call failed, falling back to local heuristic.", e);
            }
        } else {
            log.info("Gemini API key not configured. Using local heuristic fallback for: {}", filename);
        }
        
        // Simulated AI Categorization (Fallback)
        String lower = filename.toLowerCase();
        if (lower.contains("game") || lower.contains("lol") || lower.contains("pubg")) return "Gaming";
        if (lower.contains("vlog") || lower.contains("trip")) return "Vlog";
        if (lower.contains("lecture") || lower.contains("study") || lower.contains("class")) return "Education";
        if (lower.contains("movie") || lower.contains("trailer")) return "Entertainment";
        if (lower.contains("music") || lower.contains("mv")) return "Music";
        return "Uncategorized";
    }

    private String callGeminiApi(String filename) throws Exception {
        log.info("Calling Gemini API for filename: {}", filename);
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=" + geminiApiKey;
        
        String payload = "{\n" +
                "  \"contents\": [{\n" +
                "    \"parts\":[{\"text\": \"Classify this video filename into exactly ONE short category word (e.g. Gaming, Vlog, Education, Entertainment, Music, Sports, Tech, Other). Output ONLY the category word. Filename: " + filename + "\"}]\n" +
                "  }]\n" +
                "}";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> entity = new HttpEntity<>(payload, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
        
        JsonNode root = objectMapper.readTree(response.getBody());
        String text = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
        
        String category = text.trim().replaceAll("[^a-zA-Z]", "");
        log.info("Gemini classified {} as {}", filename, category);
        return category.isEmpty() ? "Uncategorized" : category;
    }

    public String generateStandardizedFilename(String originalName, String category) {
        String extension = "";
        int extIndex = originalName.lastIndexOf(".");
        if (extIndex > 0) {
            extension = originalName.substring(extIndex);
        }
        
        String cleanName = originalName.substring(0, extIndex > 0 ? extIndex : originalName.length())
                .replaceAll("[^a-zA-Z0-9가-힣]", "_")
                .replaceAll("_+", "_");
                
        return category.toLowerCase() + "_" + cleanName + extension;
    }
}
