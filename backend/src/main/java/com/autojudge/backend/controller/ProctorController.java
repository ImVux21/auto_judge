package com.autojudge.backend.controller;

import com.autojudge.backend.model.InterviewSession;
import com.autojudge.backend.model.ProctorSnapshot;
import com.autojudge.backend.payload.dto.ProctorEventDto;
import com.autojudge.backend.payload.request.ProctorEventRequest;
import com.autojudge.backend.payload.response.MessageResponse;
import com.autojudge.backend.repository.InterviewSessionRepository;
import com.autojudge.backend.service.ProctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/proctor")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ProctorController {

    private final ProctorService proctorService;
    private final InterviewSessionRepository sessionRepository;

    @Autowired
    public ProctorController(ProctorService proctorService, InterviewSessionRepository sessionRepository) {
        this.proctorService = proctorService;
        this.sessionRepository = sessionRepository;
    }

    @PostMapping("/sessions/{sessionToken}/snapshots")
    public ResponseEntity<?> recordSnapshot(
            @PathVariable String sessionToken,
            @RequestBody String imageBase64,
            @RequestParam long timestamp,
            @RequestParam(required = false, defaultValue = "NORMAL") String eventType) {

        try {
            InterviewSession session = sessionRepository.findByAccessToken(sessionToken)
                    .orElseThrow(() -> new NoSuchElementException("Session not found"));

            boolean success = proctorService.recordWebcamSnapshot(session, imageBase64, timestamp, eventType);
            
            if (success) {
                return ResponseEntity.ok(new MessageResponse("Snapshot recorded successfully"));
            } else {
                return ResponseEntity.badRequest().body(new MessageResponse("Failed to record snapshot"));
            }
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/sessions/{sessionToken}/snapshots")
    @PreAuthorize("hasRole('INTERVIEWER') or hasRole('ADMIN')")
    public ResponseEntity<?> getSnapshots(@PathVariable String sessionToken) {
        try {
            InterviewSession session = sessionRepository.findByAccessToken(sessionToken)
                    .orElseThrow(() -> new NoSuchElementException("Session not found"));
            
            List<ProctorSnapshot> snapshots = proctorService.getSessionSnapshots(session);
            return ResponseEntity.ok(snapshots);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/sessions/{sessionToken}/snapshots/flagged")
    @PreAuthorize("hasRole('INTERVIEWER') or hasRole('ADMIN')")
    public ResponseEntity<?> getFlaggedSnapshots(@PathVariable String sessionToken) {
        try {
            InterviewSession session = sessionRepository.findByAccessToken(sessionToken)
                    .orElseThrow(() -> new NoSuchElementException("Session not found"));
            
            List<ProctorSnapshot> snapshots = proctorService.getFlaggedSnapshots(session);
            return ResponseEntity.ok(snapshots);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/sessions/{sessionToken}/snapshots/suspicious")
    @PreAuthorize("hasRole('INTERVIEWER') or hasRole('ADMIN')")
    public ResponseEntity<?> getSuspiciousSnapshots(@PathVariable String sessionToken) {
        try {
            InterviewSession session = sessionRepository.findByAccessToken(sessionToken)
                    .orElseThrow(() -> new NoSuchElementException("Session not found"));
            
            List<ProctorSnapshot> snapshots = proctorService.getSuspiciousSnapshots(session);
            return ResponseEntity.ok(snapshots);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/sessions/{sessionToken}/events")
    public ResponseEntity<?> recordProctorEvent(
            @PathVariable String sessionToken,
            @RequestBody ProctorEventRequest request) {
        
        try {
            proctorService.recordProctorEvent(sessionToken, request);
            return ResponseEntity.ok(new MessageResponse("Event recorded successfully"));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/sessions/{sessionToken}/events")
    @PreAuthorize("hasRole('INTERVIEWER') or hasRole('ADMIN')")
    public ResponseEntity<?> getProctorEvents(@PathVariable String sessionToken) {
        try {
            List<ProctorEventDto> events = proctorService.getProctorEvents(sessionToken);
            return ResponseEntity.ok(events);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/sessions/{sessionToken}/security/status")
    public ResponseEntity<?> getSecurityStatus(@PathVariable String sessionToken) {
        try {
            boolean isSecure = proctorService.isSessionSecure(sessionToken);
            int violationCount = proctorService.getSecurityViolationCount(sessionToken);
            
            return ResponseEntity.ok(Map.of(
                "secure", isSecure,
                "violationCount", violationCount
            ));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/sessions/{sessionToken}/notes")
    @PreAuthorize("hasRole('INTERVIEWER') or hasRole('ADMIN')")
    public ResponseEntity<?> addProctorNote(
            @PathVariable String sessionToken,
            @RequestBody Map<String, String> payload) {
        
        try {
            InterviewSession session = sessionRepository.findByAccessToken(sessionToken)
                    .orElseThrow(() -> new NoSuchElementException("Session not found"));
            
            String note = payload.get("note");
            if (note == null || note.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Note cannot be empty"));
            }
            
            proctorService.recordProctorNote(session, note);
            return ResponseEntity.ok(new MessageResponse("Note added successfully"));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
} 