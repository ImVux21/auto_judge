package com.autojudge.backend.service;

import com.autojudge.backend.model.InterviewSession;
import com.autojudge.backend.payload.request.StartSessionRequest.DeviceInfo;
import com.autojudge.backend.repository.InterviewSessionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProctorService {

    private final InterviewSessionRepository sessionRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // Store IP and device info for sessions
    private final Map<String, String> sessionIpMap = new HashMap<>();
    private final Map<String, DeviceInfo> sessionDeviceMap = new HashMap<>();

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
     * @return true if recorded successfully
     */
    public boolean recordWebcamSnapshot(InterviewSession session, String imageBase64, long timestamp) {
        // In a real implementation, you would:
        // 1. Store the image in a blob storage or file system
        // 2. Record metadata in the database
        // 3. Potentially analyze the image with AI for suspicious activity
        
        // For this implementation, we'll just validate the image format
        try {
            // Check if it's a valid Base64 image
            Base64.getDecoder().decode(imageBase64.split(",")[1]);
            return true;
        } catch (Exception e) {
            return false;
        }
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
} 