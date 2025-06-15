package com.autojudge.backend.payload.request;

import lombok.Data;

@Data
public class StartSessionRequest {
    private DeviceInfo deviceInfo;
    
    @Data
    public static class DeviceInfo {
        private String platform;
        private Integer screenHeight;
        private Integer screenWidth;
        private String userAgent;
    }
} 