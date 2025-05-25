package com.autojudge.backend.controller;

import com.autojudge.backend.model.*;
import com.autojudge.backend.payload.request.CreateInterviewRequest;
import com.autojudge.backend.payload.request.CreateSessionRequest;
import com.autojudge.backend.payload.response.MessageResponse;
import com.autojudge.backend.repository.QuestionRepository;
import com.autojudge.backend.repository.UserRepository;
import com.autojudge.backend.security.services.UserDetailsImpl;
import com.autojudge.backend.service.InterviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/interview")
public class InterviewController {

    @Autowired
    private InterviewService interviewService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private QuestionRepository questionRepository;

    @PostMapping("/create")
    @PreAuthorize("hasRole('INTERVIEWER') or hasRole('ADMIN')")
    public ResponseEntity<?> createInterview(@Valid @RequestBody CreateInterviewRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow(() -> new RuntimeException("User not found"));
        
        Interview interview = interviewService.createInterview(
            request.getTitle(), 
            request.getJobRole(), 
            request.getDescription(), 
            request.getTimeLimit(),
            user,
            request.getMcqCount(),
            request.getOpenEndedCount()
        );
        
        return ResponseEntity.ok(interview);
    }
    
    @GetMapping("/list")
    @PreAuthorize("hasRole('INTERVIEWER') or hasRole('ADMIN')")
    public ResponseEntity<?> getInterviews() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Interview> interviews = interviewService.getInterviewsByUser(user);
        return ResponseEntity.ok(interviews);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('INTERVIEWER') or hasRole('ADMIN')")
    public ResponseEntity<?> getInterview(@PathVariable Long id) {
        Optional<Interview> interview = interviewService.getInterviewById(id);
        
        if (interview.isPresent()) {
            return ResponseEntity.ok(interview.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/{id}/questions")
    @PreAuthorize("hasRole('INTERVIEWER') or hasRole('ADMIN')")
    public ResponseEntity<?> getInterviewQuestions(@PathVariable Long id) {
        Optional<Interview> interviewOpt = interviewService.getInterviewById(id);
        
        if (interviewOpt.isPresent()) {
            Interview interview = interviewOpt.get();
            List<Question> questions = questionRepository.findByInterviewOrderByOrderIndexAsc(interview);
            return ResponseEntity.ok(questions);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/{id}/session/create")
    @PreAuthorize("hasRole('INTERVIEWER') or hasRole('ADMIN')")
    public ResponseEntity<?> createSession(@PathVariable Long id, @Valid @RequestBody CreateSessionRequest request) {
        Optional<Interview> interviewOpt = interviewService.getInterviewById(id);
        
        if (!interviewOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        Optional<User> candidateOpt = userRepository.findByEmail(request.getCandidateEmail());
        User candidate;
        
        if (candidateOpt.isPresent()) {
            candidate = candidateOpt.get();
        } else {
            // Create a new user with candidate role
            candidate = new User();
            candidate.setEmail(request.getCandidateEmail());
            candidate.setFirstName(request.getCandidateFirstName());
            candidate.setLastName(request.getCandidateLastName());
            candidate.setPassword("temporary"); // This should be a secure random password in production
            
            // Add candidate role
            Role candidateRole = new Role();
            candidateRole.setId(3L); // Assuming 3 is the ID for ROLE_CANDIDATE
            candidateRole.setName(ERole.ROLE_CANDIDATE);
            candidate.setRoles(java.util.Collections.singleton(candidateRole));
            
            candidate = userRepository.save(candidate);
        }
        
        InterviewSession session = interviewService.createInterviewSession(interviewOpt.get(), candidate);
        
        return ResponseEntity.ok(session);
    }
    
    @GetMapping("/{id}/sessions")
    @PreAuthorize("hasRole('INTERVIEWER') or hasRole('ADMIN')")
    public ResponseEntity<?> getInterviewSessions(@PathVariable Long id) {
        Optional<Interview> interviewOpt = interviewService.getInterviewById(id);
        
        if (interviewOpt.isPresent()) {
            Interview interview = interviewOpt.get();
            List<InterviewSession> sessions = interviewService.getSessionsByInterview(interview);
            return ResponseEntity.ok(sessions);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('INTERVIEWER') or hasRole('ADMIN')")
    public ResponseEntity<?> activateInterview(@PathVariable Long id) {
        Optional<Interview> interviewOpt = interviewService.getInterviewById(id);
        
        if (interviewOpt.isPresent()) {
            Interview interview = interviewOpt.get();
            interview.setActive(true);
            interview = interviewService.interviewRepository.save(interview);
            return ResponseEntity.ok(interview);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('INTERVIEWER') or hasRole('ADMIN')")
    public ResponseEntity<?> deactivateInterview(@PathVariable Long id) {
        Optional<Interview> interviewOpt = interviewService.getInterviewById(id);
        
        if (interviewOpt.isPresent()) {
            Interview interview = interviewOpt.get();
            interview.setActive(false);
            interview = interviewService.interviewRepository.save(interview);
            return ResponseEntity.ok(interview);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Public endpoints for candidates
    
    @GetMapping("/public/session/{token}")
    public ResponseEntity<?> getSessionByToken(@PathVariable String token) {
        Optional<InterviewSession> sessionOpt = interviewService.getSessionByToken(token);
        
        if (sessionOpt.isPresent()) {
            InterviewSession session = sessionOpt.get();
            return ResponseEntity.ok(session);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
} 