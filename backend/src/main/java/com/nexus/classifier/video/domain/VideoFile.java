package com.nexus.classifier.video.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "video_files")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class VideoFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String originalName;

    @Column
    private String renamedName;

    @Column
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VideoStatus status;

    @Column
    private String quality;

    @Column(nullable = false)
    private boolean isLowQuality;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime processedAt;

    @Builder
    public VideoFile(String originalName, String category, VideoStatus status, String quality, boolean isLowQuality) {
        this.originalName = originalName;
        this.category = category;
        this.status = status != null ? status : VideoStatus.PENDING;
        this.quality = quality;
        this.isLowQuality = isLowQuality;
        this.createdAt = LocalDateTime.now();
    }

    public void completeProcessing(String renamedName, String category, String quality, boolean isLowQuality) {
        this.renamedName = renamedName;
        this.category = category;
        this.quality = quality;
        this.isLowQuality = isLowQuality;
        this.status = isLowQuality ? VideoStatus.ISOLATED_LOW_QUALITY : VideoStatus.COMPLETED;
        this.processedAt = LocalDateTime.now();
    }

    public void failProcessing() {
        this.status = VideoStatus.FAILED;
        this.processedAt = LocalDateTime.now();
    }
}
