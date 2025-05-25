package com.autojudge.backend.service;

import com.autojudge.backend.model.*;
import com.autojudge.backend.repository.InterviewRepository;
import com.autojudge.backend.repository.InterviewSessionRepository;
import com.autojudge.backend.repository.QuestionRepository;
import com.autojudge.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class InterviewService {

    @Autowired
    public InterviewRepository interviewRepository;
    
    @Autowired
    private QuestionRepository questionRepository;
    
    @Autowired
    private InterviewSessionRepository sessionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private QuestionGenerationService questionGenerationService;

    @Transactional
    public Interview createInterview(String title, String jobRole, String description, Integer timeLimit, 
                                   User createdBy, int mcqCount, int openEndedCount) {
        Interview interview = new Interview();
        interview.setTitle(title);
        interview.setJobRole(jobRole);
        interview.setDescription(description);
        interview.setTimeLimit(timeLimit);
        interview.setCreatedBy(createdBy);
        interview.setCreatedAt(LocalDateTime.now());
        interview.setActive(true);
        
        // Save the interview first to get an ID
        Interview savedInterview = interviewRepository.save(interview);
        
        // Generate questions
        List<Question> questions = questionGenerationService.generateQuestionsForInterview(
            savedInterview, mcqCount, openEndedCount);
        
        // Save questions
        questions.forEach(question -> questionRepository.save(question));
        
        return savedInterview;
    }
    
    public List<Interview> getInterviewsByUser(User user) {
        return interviewRepository.findByCreatedBy(user);
    }
    
    public List<Interview> getActiveInterviews() {
        return interviewRepository.findByActiveTrue();
    }
    
    public Optional<Interview> getInterviewById(Long id) {
        return interviewRepository.findById(id);
    }
    
    @Transactional
    public InterviewSession createInterviewSession(Interview interview, User candidate) {
        InterviewSession session = new InterviewSession();
        session.setInterview(interview);
        session.setCandidate(candidate);
        session.setStartTime(LocalDateTime.now());
        session.setStatus("PENDING");
        session.setAccessToken(generateUniqueToken());
        session.setIpAddress(""); // Will be set when candidate starts
        session.setProctored(true);
        
        return sessionRepository.save(session);
    }
    
    public Optional<InterviewSession> getSessionByToken(String token) {
        return sessionRepository.findByAccessToken(token);
    }
    
    public List<InterviewSession> getSessionsByInterview(Interview interview) {
        return sessionRepository.findByInterview(interview);
    }
    
    public List<InterviewSession> getSessionsByCandidate(User candidate) {
        return sessionRepository.findByCandidate(candidate);
    }
    
    @Transactional
    public void updateSessionStatus(InterviewSession session, String status) {
        session.setStatus(status);
        if (status.equals("COMPLETED")) {
            session.setEndTime(LocalDateTime.now());
        }
        sessionRepository.save(session);
    }
    
    @Transactional
    public void updateSessionScore(InterviewSession session, Double score, String evaluationSummary) {
        session.setScore(score);
        session.setEvaluationSummary(evaluationSummary);
        session.setStatus("EVALUATED");
        sessionRepository.save(session);
    }
    
    private String generateUniqueToken() {
        return UUID.randomUUID().toString();
    }
} 