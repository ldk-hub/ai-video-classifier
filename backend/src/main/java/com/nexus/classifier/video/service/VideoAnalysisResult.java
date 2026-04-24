package com.nexus.classifier.video.service;

import lombok.Data;

@Data
public class VideoAnalysisResult {
    private boolean success;
    private String resolution;
    private String qualityLabel;
    private boolean lowQuality;
}
