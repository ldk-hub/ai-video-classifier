package com.nexus.classifier.video.service;

import com.nexus.classifier.common.exception.BusinessException;
import com.nexus.classifier.video.domain.VideoFile;
import com.nexus.classifier.video.domain.VideoFileRepository;
import com.nexus.classifier.video.domain.VideoStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class VideoFileService {

    private final VideoFileRepository videoFileRepository;
    private final VideoAnalysisService videoAnalysisService;

    @Value("${app.storage.path:.}")
    private String storagePath;

    @Transactional
    public VideoFile registerVideo(String originalName) {
        if (videoFileRepository.existsByOriginalName(originalName)) {
            log.info("Video already exists, skipping registration: {}", originalName);
            return null;
        }

        log.info("Registering new video file: {}", originalName);
        VideoFile videoFile = VideoFile.builder()
                .originalName(originalName)
                .status(VideoStatus.PENDING)
                .isLowQuality(false)
                .build();
        
        return videoFileRepository.save(videoFile);
    }

    @Transactional(readOnly = true)
    public List<VideoFile> getAllVideos() {
        return videoFileRepository.findAll();
    }

    @Transactional
    public List<VideoFile> scanDirectoryAndRegister() {
        log.info("Scanning directory for video files: {}", storagePath);
        File directory = new File(storagePath);
        if (!directory.exists() || !directory.isDirectory()) {
            log.warn("Storage path {} does not exist or is not a directory.", storagePath);
            return new ArrayList<>();
        }

        File[] files = directory.listFiles((dir, name) -> {
            String lower = name.toLowerCase();
            return lower.endsWith(".mp4") || lower.endsWith(".mov") || lower.endsWith(".avi");
        });

        List<VideoFile> registeredFiles = new ArrayList<>();
        if (files != null) {
            for (File file : files) {
                VideoFile registered = registerVideo(file.getName());
                if (registered != null) {
                    registeredFiles.add(registered);
                }
            }
        }
        
        log.info("Found and registered {} new video files.", registeredFiles.size());
        return registeredFiles;
    }

    @Transactional
    public VideoFile processVideo(Long videoId) {
        VideoFile video = videoFileRepository.findById(videoId)
                .orElseThrow(() -> new BusinessException("Video not found with id: " + videoId, HttpStatus.NOT_FOUND));

        try {
            log.info("Starting AI analysis and FFmpeg processing for video: {}", video.getOriginalName());
            
            // 1. Analyze with FFmpeg (Quality/Resolution)
            String fullPath = storagePath + File.separator + video.getOriginalName();
            VideoAnalysisResult analysisResult = videoAnalysisService.analyzeVideo(fullPath);
            
            // 2. AI Content Category Simulation
            String category = videoAnalysisService.analyzeContentCategory(video.getOriginalName());
            
            // 3. Filename Standardization
            String renamedName = videoAnalysisService.generateStandardizedFilename(video.getOriginalName(), category);
            if (analysisResult.isLowQuality()) {
                renamedName = "isolated_" + video.getOriginalName();
            }

            video.completeProcessing(
                renamedName, 
                category, 
                analysisResult.getQualityLabel(), 
                analysisResult.isLowQuality()
            );
            return videoFileRepository.save(video);
            
        } catch (Exception e) {
            log.error("Failed to process video id: {}", videoId, e);
            video.failProcessing();
            videoFileRepository.save(video);
            throw new BusinessException("Processing failed: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
