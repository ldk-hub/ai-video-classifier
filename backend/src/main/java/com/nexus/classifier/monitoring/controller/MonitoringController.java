package com.nexus.classifier.monitoring.controller;

import com.nexus.classifier.common.response.ApiResponse;
import com.nexus.classifier.monitoring.dto.DiskStatusResponse;
import com.nexus.classifier.monitoring.service.DiskMonitoringService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Monitoring API", description = "시스템 및 디스크 모니터링 API")
@RestController
@RequestMapping("/api/v1/monitoring")
@RequiredArgsConstructor
public class MonitoringController {

    private final DiskMonitoringService diskMonitoringService;

    @Operation(summary = "디스크 상태 조회", description = "애플리케이션이 구동되는 스토리지의 디스크 상태를 조회합니다.")
    @GetMapping("/disk")
    public ApiResponse<DiskStatusResponse> getDiskStatus() {
        return ApiResponse.success(diskMonitoringService.getDiskStatus());
    }
}
