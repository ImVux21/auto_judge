package com.autojudge.backend.controller;

import com.autojudge.backend.mapper.EntityMapper;
import com.autojudge.backend.model.*;
import com.autojudge.backend.payload.dto.InterviewDto;
import com.autojudge.backend.payload.dto.InterviewSessionDto;
import com.autojudge.backend.payload.dto.AnswerPerformanceDto;
import com.autojudge.backend.repository.*;
import com.autojudge.backend.security.services.UserDetailsImpl;
import com.autojudge.backend.service.ProctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/analytics")
@PreAuthorize("hasRole('INTERVIEWER') or hasRole('ADMIN')")
@RequiredArgsConstructor
public class AnalyticsController {
    private final InterviewRepository interviewRepository;
    private final InterviewSessionRepository sessionRepository;
    private final AnswerRepository answerRepository;
    private final QuestionRepository questionRepository;
    private final OptionRepository optionRepository;
    private final ProctorService proctorService;
    private final ProctorSnapshotRepository proctorSnapshotRepository;
    private final EntityMapper entityMapper;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardData() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        // Get all interviews created by the user
        List<Interview> interviews = interviewRepository.findAll();
        
        // Get all sessions
        List<InterviewSession> sessions = sessionRepository.findAll();
        
        // Calculate analytics
        Map<String, Object> analytics = new HashMap<>();
        
        // Total interviews
        analytics.put("totalInterviews", interviews.size());
        
        // Total sessions
        analytics.put("totalSessions", sessions.size());
        
        // Completed sessions
        long completedSessions = sessions.stream()
                .filter(s -> "COMPLETED".equals(s.getStatus()) || "EVALUATED".equals(s.getStatus()))
                .count();
        analytics.put("completedSessions", completedSessions);
        
        // Average score
        double avgScore = sessions.stream()
                .filter(s -> s.getScore() != null)
                .mapToDouble(InterviewSession::getScore)
                .average()
                .orElse(0.0);
        analytics.put("averageScore", avgScore);
        
        // Recent interviews
        List<Interview> recentInterviews = interviews.stream()
                .sorted(Comparator.comparing(Interview::getCreatedAt).reversed())
                .limit(5)
                .collect(Collectors.toList());
        
        // Convert to DTOs
        List<InterviewDto> recentInterviewDtos = entityMapper.toInterviewDtoList(recentInterviews);
        analytics.put("recentInterviews", recentInterviewDtos);
        
        // Recent sessions
        List<InterviewSession> recentSessions = sessions.stream()
                .sorted(Comparator.comparing(InterviewSession::getStartTime).reversed())
                .limit(5)
                .collect(Collectors.toList());
        
        // Convert to DTOs
        List<InterviewSessionDto> recentSessionDtos = entityMapper.toInterviewSessionDtoList(recentSessions);
        analytics.put("recentSessions", recentSessionDtos);
        
        return ResponseEntity.ok(analytics);
    }
    
    @GetMapping("/interview/{id}")
    public ResponseEntity<?> getInterviewAnalytics(@PathVariable Long id) {
        Optional<Interview> interviewOpt = interviewRepository.findById(id);
        
        if (interviewOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Interview interview = interviewOpt.get();
        List<InterviewSession> sessions = sessionRepository.findByInterview(interview);
        
        Map<String, Object> analytics = new HashMap<>();
        
        // Interview details
        analytics.put("interview", entityMapper.toInterviewDto(interview));
        
        // Total sessions
        analytics.put("totalSessions", sessions.size());
        
        // Completed sessions
        long completedSessions = sessions.stream()
                .filter(s -> "COMPLETED".equals(s.getStatus()) || "EVALUATED".equals(s.getStatus()))
                .count();
        analytics.put("completedSessions", completedSessions);
        
        // Average score
        double avgScore = sessions.stream()
                .filter(s -> s.getScore() != null)
                .mapToDouble(InterviewSession::getScore)
                .average()
                .orElse(0.0);
        analytics.put("averageScore", avgScore);
        
        // Score distribution
        Map<String, Long> scoreDistribution = new HashMap<>();
        scoreDistribution.put("0-20", sessions.stream()
                .filter(s -> s.getScore() != null && s.getScore() < 0.2)
                .count());
        scoreDistribution.put("20-40", sessions.stream()
                .filter(s -> s.getScore() != null && s.getScore() >= 0.2 && s.getScore() < 0.4)
                .count());
        scoreDistribution.put("40-60", sessions.stream()
                .filter(s -> s.getScore() != null && s.getScore() >= 0.4 && s.getScore() < 0.6)
                .count());
        scoreDistribution.put("60-80", sessions.stream()
                .filter(s -> s.getScore() != null && s.getScore() >= 0.6 && s.getScore() < 0.8)
                .count());
        scoreDistribution.put("80-100", sessions.stream()
                .filter(s -> s.getScore() != null && s.getScore() >= 0.8)
                .count());
        analytics.put("scoreDistribution", scoreDistribution);
        
        // Question performance
        List<Question> questions = questionRepository.findByInterviewOrderByOrderIndexAsc(interview);
        List<Map<String, Object>> questionPerformance = new ArrayList<>();
        
        for (Question question : questions) {
            Map<String, Object> qp = new HashMap<>();
            qp.put("questionId", question.getId());
            qp.put("questionText", question.getText());
            qp.put("type", question.getType());
            
            List<Answer> answers = answerRepository.findAll().stream()
                    .filter(a -> a.getQuestion().getId().equals(question.getId()))
                    .toList();
            
            double avgQuestionScore = answers.stream()
                    .filter(a -> a.getScore() != null)
                    .mapToDouble(Answer::getScore)
                    .average()
                    .orElse(0.0);
            
            qp.put("averageScore", avgQuestionScore);
            qp.put("attemptCount", answers.size());
            
            questionPerformance.add(qp);
        }
        
        analytics.put("questionPerformance", questionPerformance);
        
        // Sessions as DTOs
        List<InterviewSessionDto> sessionDtos = entityMapper.toInterviewSessionDtoList(sessions);
        analytics.put("sessions", sessionDtos);
        
        return ResponseEntity.ok(analytics);
    }
    
    @GetMapping("/session/{id}")
    @Transactional
    public ResponseEntity<?> getSessionAnalytics(@PathVariable Long id) {
        Optional<InterviewSession> sessionOpt = sessionRepository.findById(id);
        
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        InterviewSession session = sessionOpt.get();
        List<Answer> answers = answerRepository.findBySession(session);
        
        Map<String, Object> analytics = new HashMap<>();
        
        // Session details as DTO
        analytics.put("session", entityMapper.toInterviewSessionDto(session));
        
        // Answer performance using DTOs
        List<AnswerPerformanceDto> answerPerformanceDtos = entityMapper.toAnswerPerformanceDtoList(answers);
        analytics.put("answerPerformance", answerPerformanceDtos);
        
        // Category performance
        Map<String, Double> categoryPerformance = new HashMap<>();
        Map<String, Integer> categoryCounts = new HashMap<>();
        
        for (Answer answer : answers) {
            String category = answer.getQuestion().getCategory();
            Double score = answer.getScore();
            
            if (score != null) {
                categoryPerformance.put(category, 
                    categoryPerformance.getOrDefault(category, 0.0) + score);
                categoryCounts.put(category, 
                    categoryCounts.getOrDefault(category, 0) + 1);
            }
        }
        
        // Calculate average score per category
        Map<String, Double> categoryAverages = new HashMap<>();
        for (String category : categoryPerformance.keySet()) {
            categoryAverages.put(category, 
                categoryPerformance.get(category) / categoryCounts.get(category));
        }
        
        analytics.put("categoryPerformance", categoryAverages);
        
        // Proctoring data
        Map<String, Object> proctorData = new HashMap<>();
        long totalSnapshots = proctorSnapshotRepository.countBySession(session);
        long flaggedSnapshots = proctorSnapshotRepository.countBySessionAndFlaggedTrue(session);
        
        proctorData.put("totalSnapshots", totalSnapshots);
        proctorData.put("flaggedSnapshots", flaggedSnapshots);
        proctorData.put("proctorNotes", session.getProctorNotes());
        
        // Event type statistics
        Map<String, Long> eventTypeStats = new HashMap<>();
        eventTypeStats.put("NORMAL", proctorSnapshotRepository.countBySessionAndEventType(session, "NORMAL"));
        eventTypeStats.put("INITIAL", proctorSnapshotRepository.countBySessionAndEventType(session, "INITIAL"));
        eventTypeStats.put("SCHEDULED", proctorSnapshotRepository.countBySessionAndEventType(session, "SCHEDULED"));
        eventTypeStats.put("VISIBILITY_HIDDEN", proctorSnapshotRepository.countBySessionAndEventType(session, "VISIBILITY_HIDDEN"));
        eventTypeStats.put("VISIBILITY_VISIBLE", proctorSnapshotRepository.countBySessionAndEventType(session, "VISIBILITY_VISIBLE"));
        eventTypeStats.put("KEYBOARD_SHORTCUT", proctorSnapshotRepository.countBySessionAndEventType(session, "KEYBOARD_SHORTCUT"));
        eventTypeStats.put("PRINT_SCREEN", proctorSnapshotRepository.countBySessionAndEventType(session, "PRINT_SCREEN"));
        eventTypeStats.put("QUESTION_NAVIGATION", proctorSnapshotRepository.countBySessionAndEventType(session, "QUESTION_NAVIGATION"));
        eventTypeStats.put("ANSWER_SUBMISSION", proctorSnapshotRepository.countBySessionAndEventType(session, "ANSWER_SUBMISSION"));
        
        proctorData.put("eventTypeStats", eventTypeStats);
        
        analytics.put("proctorData", proctorData);
        
        return ResponseEntity.ok(analytics);
    }
    
    @GetMapping("/session/{id}/proctor/snapshots")
    @Transactional
    public ResponseEntity<?> getSessionProctorSnapshots(
            @PathVariable Long id,
            @RequestParam(required = false) String eventType) {
        Optional<InterviewSession> sessionOpt = sessionRepository.findById(id);
        
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        InterviewSession session = sessionOpt.get();
        List<ProctorSnapshot> snapshots;
        
        // Filter by event type if provided
        if (eventType != null && !eventType.isEmpty()) {
            snapshots = proctorService.getSessionSnapshotsByEventType(session, eventType);
        } else {
            snapshots = proctorService.getSessionSnapshots(session);
        }
        
        // Convert to DTOs or simplified format
        List<Map<String, Object>> snapshotData = snapshots.stream()
            .map(snapshot -> {
                Map<String, Object> data = new HashMap<>();
                data.put("id", snapshot.getId());
                data.put("timestamp", snapshot.getTimestamp());
                data.put("createdAt", snapshot.getCreatedAt());
                data.put("flagged", snapshot.getFlagged());
                data.put("flagReason", snapshot.getFlagReason());
                data.put("eventType", snapshot.getEventType());
                // Don't include the actual image data in the list to reduce payload size
                return data;
            })
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(snapshotData);
    }
    
    @GetMapping("/session/{id}/proctor/snapshots/suspicious")
    @Transactional
    public ResponseEntity<?> getSuspiciousSnapshots(@PathVariable Long id) {
        Optional<InterviewSession> sessionOpt = sessionRepository.findById(id);
        
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        InterviewSession session = sessionOpt.get();
        List<ProctorSnapshot> snapshots = proctorService.getSuspiciousSnapshots(session);
        
        // Convert to DTOs or simplified format
        List<Map<String, Object>> snapshotData = snapshots.stream()
            .map(snapshot -> {
                Map<String, Object> data = new HashMap<>();
                data.put("id", snapshot.getId());
                data.put("timestamp", snapshot.getTimestamp());
                data.put("createdAt", snapshot.getCreatedAt());
                data.put("flagged", snapshot.getFlagged());
                data.put("flagReason", snapshot.getFlagReason());
                data.put("eventType", snapshot.getEventType());
                // Don't include the actual image data in the list to reduce payload size
                return data;
            })
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(snapshotData);
    }
    
    @GetMapping("/session/{sessionId}/proctor/snapshots/{snapshotId}")
    @Transactional
    public ResponseEntity<?> getProctorSnapshot(
            @PathVariable Long sessionId, 
            @PathVariable Long snapshotId) {
        Optional<InterviewSession> sessionOpt = sessionRepository.findById(sessionId);
        
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Optional<ProctorSnapshot> snapshotOpt = proctorSnapshotRepository.findById(snapshotId);
        
        if (snapshotOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        ProctorSnapshot snapshot = snapshotOpt.get();
        
        // Verify that the snapshot belongs to the specified session
        if (!snapshot.getSession().getId().equals(sessionId)) {
            return ResponseEntity.badRequest().body("Snapshot does not belong to the specified session");
        }
        
        // Return the full snapshot data including the image
        Map<String, Object> snapshotData = new HashMap<>();
        snapshotData.put("id", snapshot.getId());
        snapshotData.put("timestamp", snapshot.getTimestamp());
        snapshotData.put("createdAt", snapshot.getCreatedAt());
        snapshotData.put("flagged", snapshot.getFlagged());
        snapshotData.put("flagReason", snapshot.getFlagReason());
        snapshotData.put("eventType", snapshot.getEventType());
        snapshotData.put("imageData", snapshot.getImageData());
        
        return ResponseEntity.ok(snapshotData);
    }
} 