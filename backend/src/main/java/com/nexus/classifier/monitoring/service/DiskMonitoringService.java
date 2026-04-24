package com.nexus.classifier.monitoring.service;

import com.nexus.classifier.monitoring.dto.DiskStatusResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;

@Slf4j
@Service
@RequiredArgsConstructor
public class DiskMonitoringService {

    @Value("${app.storage.path:.}")
    private String storagePath;

    public DiskStatusResponse getDiskStatus() {
        File file = new File(storagePath);
        
        long totalSpace = file.getTotalSpace();
        long freeSpace = file.getFreeSpace();
        long usableSpace = file.getUsableSpace();
        
        long usedSpace = totalSpace - usableSpace;
        double usagePercentage = totalSpace > 0 ? (double) usedSpace / totalSpace * 100 : 0.0;
        
        return DiskStatusResponse.builder()
                .path(file.getAbsolutePath())
                .totalSpaceBytes(totalSpace)
                .freeSpaceBytes(freeSpace)
                .usableSpaceBytes(usableSpace)
                .usagePercentage(Math.round(usagePercentage * 100.0) / 100.0)
                .build();
    }
}
