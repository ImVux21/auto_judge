package com.autojudge.backend.service;

import com.autojudge.backend.model.InterviewSession;
import com.autojudge.backend.model.ProctorEvent;
import com.autojudge.backend.model.ProctorSnapshot;
import com.autojudge.backend.payload.dto.ProctorEventDto;
import com.autojudge.backend.payload.request.ProctorEventRequest;
import com.autojudge.backend.payload.request.StartSessionRequest.DeviceInfo;
import com.autojudge.backend.repository.InterviewSessionRepository;
import com.autojudge.backend.repository.ProctorEventRepository;
import com.autojudge.backend.repository.ProctorSnapshotRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Arrays;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProctorService {

    private final InterviewSessionRepository sessionRepository;
    private final ProctorSnapshotRepository snapshotRepository;
    private final ProctorEventRepository eventRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // Store IP and device info for sessions
    private final Map<String, String> sessionIpMap = new HashMap<>();
    private final Map<String, DeviceInfo> sessionDeviceMap = new HashMap<>();
    
    // List of event types that should be flagged for review
    private final List<String> suspiciousEventTypes = Arrays.asList(
        "VISIBILITY_HIDDEN", 
        "KEYBOARD_SHORTCUT", 
        "PRINT_SCREEN"
    );

    /**
     * Validates if the session can be started from the given IP and device
     * @param session The interview session
     * @param ipAddress Client IP address
     * @param deviceInfo Device information
     * @return true if session can be started, false otherwise
     */
    @Transactional
    public boolean validateSessionStart(InterviewSession session, String ipAddress, DeviceInfo deviceInfo) {
        String token = session.getAccessToken();
        
        try {
            String deviceInfoJson = objectMapper.writeValueAsString(deviceInfo);
            
            // First time this session is accessed
            if (session.getIpAddress() == null || session.getIpAddress().isEmpty()) {
                session.setIpAddress(ipAddress);
                session.setDeviceInfo(deviceInfoJson);
                session.setStatus("IN_PROGRESS");
                sessionRepository.save(session);
                
                sessionIpMap.put(token, ipAddress);
                sessionDeviceMap.put(token, deviceInfo);
                return true;
            }
            
            // Check if IP matches and device fingerprint is similar
            DeviceInfo storedDeviceInfo = objectMapper.readValue(session.getDeviceInfo(), DeviceInfo.class);
            return session.getIpAddress().equals(ipAddress) && 
                  isDeviceInfoSimilar(storedDeviceInfo, deviceInfo);
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Checks if two device info objects are similar enough to be considered the same device
     */
    private boolean isDeviceInfoSimilar(DeviceInfo stored, DeviceInfo current) {
        // Platform must match exactly
        if (!stored.getPlatform().equals(current.getPlatform())) {
            return false;
        }
        
        // User agent should contain the stored user agent string
        if (!current.getUserAgent().contains(stored.getUserAgent())) {
            return false;
        }
        
        // Screen dimensions might vary slightly due to browser resize, but should be close
        int heightDiff = Math.abs(stored.getScreenHeight() - current.getScreenHeight());
        int widthDiff = Math.abs(stored.getScreenWidth() - current.getScreenWidth());
        
        // Allow for some difference in screen dimensions (e.g., due to browser resize)
        return heightDiff < 100 && widthDiff < 100;
    }
    
    /**
     * Records a webcam snapshot for proctoring
     * @param session The interview session
     * @param imageBase64 Base64 encoded webcam image
     * @param timestamp Timestamp when the image was taken
     * @param eventType Type of event that triggered the snapshot
     * @return true if recorded successfully
     */
    @Transactional
    public boolean recordWebcamSnapshot(InterviewSession session, String imageBase64, long timestamp, String eventType) {
        try {
            // Validate the image format
            if (!isValidBase64Image(imageBase64)) {
                return false;
            }
            
            // Check if this is a suspicious event type
            boolean shouldFlag = suspiciousEventTypes.contains(eventType);
            String flagReason = shouldFlag ? "Suspicious activity: " + eventType : null;
            
            // Create and save the snapshot
            ProctorSnapshot snapshot = ProctorSnapshot.builder()
                    .session(session)
                    .timestamp(timestamp)
                    .imageData(imageBase64)
                    .eventType(eventType)
                    .flagged(shouldFlag)
                    .flagReason(flagReason)
                    .build();
            
            snapshotRepository.save(snapshot);
            
            // If this is a suspicious event, add a note to the session
            if (shouldFlag) {
                recordProctorNote(session, "Suspicious activity detected: " + eventType + " at timestamp " + timestamp);
            }
            
            // Optionally analyze the image for suspicious activity
            analyzeSnapshot(snapshot);
            
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    // For backward compatibility
    @Transactional
    public boolean recordWebcamSnapshot(InterviewSession session, String imageBase64, long timestamp) {
        return recordWebcamSnapshot(session, imageBase64, timestamp, "NORMAL");
    }
    
    /**
     * Validates if the provided string is a valid Base64 image
     */
    private boolean isValidBase64Image(String imageBase64) {
        try {
            // Check if it's a valid Base64 image
            if (imageBase64 == null || imageBase64.isEmpty()) {
                return false;
            }
            
            // Handle data URLs (e.g., "data:image/jpeg;base64,...")
            String base64Data = imageBase64;
            if (imageBase64.contains(",")) {
                base64Data = imageBase64.split(",")[1];
            }
            
            Base64.getDecoder().decode(base64Data);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Analyzes a snapshot for suspicious activity
     * This is a placeholder for more advanced AI-based analysis
     */
    private void analyzeSnapshot(ProctorSnapshot snapshot) {
        // In a real implementation, you would:
        // 1. Use computer vision to detect multiple people
        // 2. Check for suspicious objects
        // 3. Verify the candidate's identity
        // 4. Flag the snapshot if issues are detected
        
        // For now, we'll just implement a placeholder
        // In a real implementation, this would be an asynchronous process
    }
    
    /**
     * Gets all snapshots for a session
     * @param session The interview session
     * @return List of snapshots
     */
    public List<ProctorSnapshot> getSessionSnapshots(InterviewSession session) {
        return snapshotRepository.findBySessionOrderByTimestampAsc(session);
    }
    
    /**
     * Gets flagged snapshots for a session
     * @param session The interview session
     * @return List of flagged snapshots
     */
    public List<ProctorSnapshot> getFlaggedSnapshots(InterviewSession session) {
        return snapshotRepository.findBySessionAndFlaggedTrue(session);
    }
    
    /**
     * Detects if the candidate is trying to copy content
     * @param session The interview session
     * @param content Content that might be copied
     * @return true if content appears to be copied
     */
    public boolean detectCopyPaste(InterviewSession session, String content) {
        // Simple heuristic: Check if the content contains code blocks or complex technical terms
        // that would be unlikely to be typed during an interview
        
        // Check for code patterns
        boolean containsCodePatterns = content.contains("public class") || 
                                      content.contains("function(") ||
                                      content.contains("import ") ||
                                      content.contains("SELECT * FROM");
        
        // Check for suspiciously long content that was submitted quickly
        boolean suspiciouslyLong = content.length() > 500; // Adjust threshold as needed
        
        return containsCodePatterns && suspiciouslyLong;
    }
    
    /**
     * Records a proctoring note for the session
     * @param session The interview session
     * @param note The proctoring note
     */
    @Transactional
    public void recordProctorNote(InterviewSession session, String note) {
        String existingNotes = session.getProctorNotes();
        String updatedNotes = existingNotes == null ? note : existingNotes + "\n" + note;
        session.setProctorNotes(updatedNotes);
        sessionRepository.save(session);
    }
    
    /**
     * Validates if the session can continue based on proctoring rules
     * @param session The interview session
     * @param ipAddress Current IP address
     * @return true if session can continue, false if it should be terminated
     */
    public boolean validateSessionContinuation(InterviewSession session, String ipAddress) {
        String token = session.getAccessToken();
        
        // Check if IP has changed during the session
        if (sessionIpMap.containsKey(token) && !sessionIpMap.get(token).equals(ipAddress)) {
            recordProctorNote(session, "IP address changed during session. Original: " + 
                             sessionIpMap.get(token) + ", Current: " + ipAddress);
            return false;
        }
        
        return true;
    }
    
    /**
     * Gets snapshots for a session by event type
     * @param session The interview session
     * @param eventType The event type to filter by
     * @return List of snapshots with the specified event type
     */
    public List<ProctorSnapshot> getSessionSnapshotsByEventType(InterviewSession session, String eventType) {
        return snapshotRepository.findBySessionAndEventType(session, eventType);
    }
    
    /**
     * Gets snapshots for a session by multiple event types
     * @param session The interview session
     * @param eventTypes List of event types to filter by
     * @return List of snapshots with any of the specified event types
     */
    public List<ProctorSnapshot> getSessionSnapshotsByEventTypes(InterviewSession session, List<String> eventTypes) {
        return snapshotRepository.findBySessionAndEventTypeIn(session, eventTypes);
    }
    
    /**
     * Gets all suspicious snapshots for a session
     * @param session The interview session
     * @return List of suspicious snapshots
     */
    public List<ProctorSnapshot> getSuspiciousSnapshots(InterviewSession session) {
        return snapshotRepository.findBySessionAndEventTypeIn(session, suspiciousEventTypes);
    }

    public void saveSnapshot(String sessionToken, byte[] imageData) {
        InterviewSession session = findSessionByToken(sessionToken);

        ProctorSnapshot snapshot = new ProctorSnapshot();
        snapshot.setSession(session);
        snapshot.setImageData(Base64.getEncoder().encodeToString(imageData));
        snapshot.setTimestamp(System.currentTimeMillis());

        snapshotRepository.save(snapshot);
    }

    public List<ProctorSnapshot> getSnapshots(String sessionToken) {
        InterviewSession session = findSessionByToken(sessionToken);
        return snapshotRepository.findBySession(session);
    }
    
    public void recordProctorEvent(String sessionToken, ProctorEventRequest request) {
        InterviewSession session = findSessionByToken(sessionToken);
        
        ProctorEvent event = new ProctorEvent();
        event.setInterviewSession(session);
        event.setEventType(request.getEventType());
        event.setEventDetails(request.getEventDetails());
        event.setSeverity(request.getSeverity());
        
        eventRepository.save(event);
    }
    
    public List<ProctorEventDto> getProctorEvents(String sessionToken) {
        InterviewSession session = findSessionByToken(sessionToken);
        List<ProctorEvent> events = eventRepository.findByInterviewSessionOrderByTimestampDesc(session);
        
        return events.stream().map(this::mapToDto).collect(Collectors.toList());
    }
    
    public int getSecurityViolationCount(String sessionToken) {
        InterviewSession session = findSessionByToken(sessionToken);
        
        int tabSwitchViolations = eventRepository.countByInterviewSessionAndEventType(session, "TAB_SWITCH");
        int fullscreenExitViolations = eventRepository.countByInterviewSessionAndEventType(session, "FULLSCREEN_EXIT");
        int copyPasteViolations = eventRepository.countByInterviewSessionAndEventType(session, "COPY_PASTE");
        
        return tabSwitchViolations + fullscreenExitViolations + copyPasteViolations;
    }
    
    public boolean isSessionSecure(String sessionToken) {
        int violationCount = getSecurityViolationCount(sessionToken);
        
        // Define a threshold for security violations
        // This is a simplified implementation - in a real application you might use
        // more complex criteria based on violation types, timing, etc.
        return violationCount <= 3; // Allow up to 3 violations before marking as insecure
    }
    
    private InterviewSession findSessionByToken(String sessionToken) {
        return sessionRepository.findByAccessToken(sessionToken)
                .orElseThrow(() -> new NoSuchElementException("Interview session not found"));
    }
    
    private ProctorEventDto mapToDto(ProctorEvent event) {
        ProctorEventDto dto = new ProctorEventDto();
        dto.setId(event.getId());
        dto.setSessionId(event.getInterviewSession().getAccessToken());
        dto.setEventType(event.getEventType());
        dto.setTimestamp(event.getTimestamp());
        dto.setEventDetails(event.getEventDetails());
        dto.setSeverity(event.getSeverity());
        return dto;
    }
} 