package com.nexus.classifier.video.service;

import com.nexus.classifier.common.exception.BusinessException;
import com.nexus.classifier.video.domain.VideoFile;
import com.nexus.classifier.video.domain.VideoFileRepository;
import com.nexus.classifier.video.domain.VideoStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class VideoFileService {

    private final VideoFileRepository videoFileRepository;

    @Transactional
    public VideoFile registerVideo(String originalName) {
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
    public VideoFile processVideo(Long videoId) {
        VideoFile video = videoFileRepository.findById(videoId)
                .orElseThrow(() -> new BusinessException("Video not found with id: " + videoId, HttpStatus.NOT_FOUND));

        try {
            log.info("Starting AI analysis and FFmpeg processing for video: {}", video.getOriginalName());
            
            // TODO: Replace with actual FFmpeg extraction & Gemini/OpenAI API Call
            // Mocking the AI categorization and regex standardization
            String mockCategory = "Gaming";
            String mockQuality = "1080p";
            boolean isLowQuality = false;
            String renamedName = "game_20260420_" + String.format("%03d", videoId) + ".mp4";

            if (video.getOriginalName().contains("tiny")) {
                mockQuality = "360p";
                isLowQuality = true;
                renamedName = "isolated_" + video.getOriginalName();
            }

            video.completeProcessing(renamedName, mockCategory, mockQuality, isLowQuality);
            return videoFileRepository.save(video);
            
        } catch (Exception e) {
            log.error("Failed to process video id: {}", videoId, e);
            video.failProcessing();
            videoFileRepository.save(video);
            throw new BusinessException("Processing failed: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
