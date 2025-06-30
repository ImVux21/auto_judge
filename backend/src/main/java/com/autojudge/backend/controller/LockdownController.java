package com.autojudge.backend.controller;

import com.autojudge.backend.payload.dto.ProctorEventDto;
import com.autojudge.backend.payload.request.ProctorEventRequest;
import com.autojudge.backend.payload.response.MessageResponse;
import com.autojudge.backend.service.LockdownService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lockdown")
@CrossOrigin(origins = "*", maxAge = 3600)
public class LockdownController {

    private final LockdownService lockdownService;

    @Autowired
    public LockdownController(LockdownService lockdownService) {
        this.lockdownService = lockdownService;
    }

    @PostMapping("/sessions/{sessionToken}/events")
    public ResponseEntity<MessageResponse> recordSecurityEvent(
            @PathVariable String sessionToken, 
            @RequestBody ProctorEventRequest request) {
        
        lockdownService.recordSecurityEvent(sessionToken, request);
        return ResponseEntity.ok(new MessageResponse("Security event recorded"));
    }

    @GetMapping("/sessions/{sessionToken}/events")
    @PreAuthorize("hasRole('INTERVIEWER') or hasRole('ADMIN')")
    public ResponseEntity<List<ProctorEventDto>> getSecurityEvents(@PathVariable String sessionToken) {
        return ResponseEntity.ok(lockdownService.getSecurityEvents(sessionToken));
    }

    @GetMapping("/sessions/{sessionToken}/violations")
    @PreAuthorize("hasRole('INTERVIEWER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Integer>> getViolationCount(@PathVariable String sessionToken) {
        int count = lockdownService.getViolationCount(sessionToken);
        return ResponseEntity.ok(Map.of("violationCount", count));
    }

    @GetMapping("/sessions/{sessionToken}/status")
    public ResponseEntity<Map<String, Object>> getSecurityStatus(@PathVariable String sessionToken) {
        boolean isSecure = lockdownService.isSessionSecure(sessionToken);
        String statusDetails = lockdownService.getSecurityStatus(sessionToken);
        
        return ResponseEntity.ok(Map.of(
            "secure", isSecure,
            "statusDetails", statusDetails
        ));
    }
} 