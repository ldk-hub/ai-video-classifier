package com.nexus.classifier.video.controller;

import com.nexus.classifier.common.response.ApiResponse;
import com.nexus.classifier.video.domain.VideoFile;
import com.nexus.classifier.video.service.VideoFileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/videos")
@RequiredArgsConstructor
public class VideoFileController {

    private final VideoFileService videoFileService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<VideoFile>> uploadVideo(@RequestParam("filename") String filename) {
        // Mocking file upload and just registering the metadata for now
        VideoFile registeredVideo = videoFileService.registerVideo(filename);
        
        // Trigger async processing (mocked synchronously for demonstration)
        VideoFile processedVideo = videoFileService.processVideo(registeredVideo.getId());
        
        return ResponseEntity.ok(ApiResponse.success(processedVideo));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<VideoFile>>> getAllVideos() {
        return ResponseEntity.ok(ApiResponse.success(videoFileService.getAllVideos()));
    }
}
