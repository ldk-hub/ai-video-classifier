package com.nexus.classifier.monitoring.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DiskStatusResponse {
    private String path;
    private long totalSpaceBytes;
    private long freeSpaceBytes;
    private long usableSpaceBytes;
    private double usagePercentage;
}
