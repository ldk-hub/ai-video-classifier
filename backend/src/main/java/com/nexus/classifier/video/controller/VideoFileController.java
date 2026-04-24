package com.nexus.classifier.video.controller;

import com.nexus.classifier.common.response.ApiResponse;
import com.nexus.classifier.video.domain.VideoFile;
import com.nexus.classifier.video.service.VideoFileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/v1/videos")
@RequiredArgsConstructor
public class VideoFileController {

    private final VideoFileService videoFileService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<VideoFile>> uploadVideo(@RequestParam("filename") String filename) {
        VideoFile registeredVideo = videoFileService.registerVideo(filename);
        if (registeredVideo == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "File already exists or invalid"));
        }
        
        // Trigger processing
        VideoFile processedVideo = videoFileService.processVideo(registeredVideo.getId());
        
        return ResponseEntity.ok(ApiResponse.success(processedVideo));
    }

    @PostMapping("/scan")
    public ResponseEntity<ApiResponse<List<VideoFile>>> scanLocalDisk() {
        List<VideoFile> scannedFiles = videoFileService.scanDirectoryAndRegister();
        
        // Asynchronously process the newly found files
        for (VideoFile file : scannedFiles) {
            CompletableFuture.runAsync(() -> {
                try {
                    videoFileService.processVideo(file.getId());
                } catch (Exception e) {
                    // Ignore, service layer already handles failure state
                }
            });
        }
        
        return ResponseEntity.ok(ApiResponse.success(scannedFiles));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<VideoFile>>> getAllVideos() {
        return ResponseEntity.ok(ApiResponse.success(videoFileService.getAllVideos()));
    }
}
