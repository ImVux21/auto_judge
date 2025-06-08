package com.autojudge.backend.controller;

import com.autojudge.backend.mapper.EntityMapper;
import com.autojudge.backend.model.*;
import com.autojudge.backend.payload.dto.AnswerDto;
import com.autojudge.backend.payload.dto.InterviewSessionDto;
import com.autojudge.backend.payload.dto.QuestionDto;
import com.autojudge.backend.payload.request.AnswerMCQRequest;
import com.autojudge.backend.payload.request.AnswerOpenEndedRequest;
import com.autojudge.backend.payload.request.StartSessionRequest;
import com.autojudge.backend.payload.response.MessageResponse;
import com.autojudge.backend.repository.AnswerRepository;
import com.autojudge.backend.repository.QuestionRepository;
import com.autojudge.backend.service.AnswerService;
import com.autojudge.backend.service.InterviewService;
import com.autojudge.backend.service.ProctorService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/candidate")
@RequiredArgsConstructor
public class CandidateController {

    private final InterviewService interviewService;
    private final QuestionRepository questionRepository;
    private final AnswerService answerService;
    private final ProctorService proctorService;
    private final AnswerRepository answerRepository;
    private final EntityMapper entityMapper;

    @PostMapping("/session/{token}/start")
    public ResponseEntity<?> startSession(
            @PathVariable String token, 
            @Valid @RequestBody StartSessionRequest request,
            HttpServletRequest httpRequest) {
        
        Optional<InterviewSession> sessionOpt = interviewService.getSessionByToken(token);
        
        if (!sessionOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        InterviewSession session = sessionOpt.get();
        
        // Get client IP address
        String ipAddress = httpRequest.getRemoteAddr();
        
        // Validate session start
        boolean valid = proctorService.validateSessionStart(session, ipAddress, request.getDeviceInfo());
        
        if (!valid) {
            return ResponseEntity.badRequest().body(new MessageResponse(
                "Session cannot be started from this device or IP address"));
        }
        
        interviewService.updateSessionStatus(session, "IN_PROGRESS");
        
        return ResponseEntity.ok(entityMapper.toInterviewSessionDto(session));
    }
    
    @GetMapping("/session/{token}/questions")
    public ResponseEntity<?> getSessionQuestions(@PathVariable String token) {
        Optional<InterviewSession> sessionOpt = interviewService.getSessionByToken(token);
        
        if (!sessionOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        InterviewSession session = sessionOpt.get();
        Interview interview = session.getInterview();
        
        List<Question> questions = questionRepository.findByInterviewOrderByOrderIndexAsc(interview);
        List<QuestionDto> questionDtos = entityMapper.toQuestionDtoList(questions);
        
        return ResponseEntity.ok(questionDtos);
    }
    
    @PostMapping("/session/{token}/answer/mcq")
    public ResponseEntity<?> submitMCQAnswer(
            @PathVariable String token, 
            @Valid @RequestBody AnswerMCQRequest request,
            HttpServletRequest httpRequest) {
        
        Optional<InterviewSession> sessionOpt = interviewService.getSessionByToken(token);
        
        if (!sessionOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        InterviewSession session = sessionOpt.get();
        
        // Validate session continuation
        String ipAddress = httpRequest.getRemoteAddr();
        boolean valid = proctorService.validateSessionContinuation(session, ipAddress);
        
        if (!valid) {
            return ResponseEntity.badRequest().body(new MessageResponse(
                "Session validation failed. Please contact support."));
        }
        
        Optional<Question> questionOpt = questionRepository.findById(request.getQuestionId());
        
        if (!questionOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        Question question = questionOpt.get();
        
        if (question.getType() != QuestionType.MULTIPLE_CHOICE) {
            return ResponseEntity.badRequest().body(new MessageResponse(
                "Question is not a multiple-choice question"));
        }
        
        Answer answer = answerService.submitMCQAnswer(session, question, request.getSelectedOptionIds());
        AnswerDto answerDto = entityMapper.toAnswerDto(answer);
        
        return ResponseEntity.ok(answerDto);
    }
    
    @PostMapping("/session/{token}/answer/open-ended")
    public ResponseEntity<?> submitOpenEndedAnswer(
            @PathVariable String token, 
            @Valid @RequestBody AnswerOpenEndedRequest request,
            HttpServletRequest httpRequest) {
        
        Optional<InterviewSession> sessionOpt = interviewService.getSessionByToken(token);
        
        if (!sessionOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        InterviewSession session = sessionOpt.get();
        
        // Validate session continuation
        String ipAddress = httpRequest.getRemoteAddr();
        boolean valid = proctorService.validateSessionContinuation(session, ipAddress);
        
        if (!valid) {
            return ResponseEntity.badRequest().body(new MessageResponse(
                "Session validation failed. Please contact support."));
        }
        
        Optional<Question> questionOpt = questionRepository.findById(request.getQuestionId());
        
        if (!questionOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        Question question = questionOpt.get();
        
        if (question.getType() != QuestionType.OPEN_ENDED) {
            return ResponseEntity.badRequest().body(new MessageResponse(
                "Question is not an open-ended question"));
        }
        
        // Check for potential copy-paste
        if (proctorService.detectCopyPaste(session, request.getTextAnswer())) {
            proctorService.recordProctorNote(session, "Potential copy-paste detected for question " + question.getId());
        }
        
        Answer answer = answerService.submitOpenEndedAnswer(session, question, request.getTextAnswer());
        AnswerDto answerDto = entityMapper.toAnswerDto(answer);
        
        return ResponseEntity.ok(answerDto);
    }
    
    @PostMapping("/session/{token}/proctor/snapshot")
    public ResponseEntity<?> submitProctorSnapshot(
            @PathVariable String token, 
            @RequestBody String imageBase64,
            @RequestParam long timestamp) {
        
        Optional<InterviewSession> sessionOpt = interviewService.getSessionByToken(token);
        
        if (!sessionOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        InterviewSession session = sessionOpt.get();
        
        boolean recorded = proctorService.recordWebcamSnapshot(session, imageBase64, timestamp);
        
        if (!recorded) {
            return ResponseEntity.badRequest().body(new MessageResponse(
                "Failed to record webcam snapshot"));
        }
        
        return ResponseEntity.ok(new MessageResponse("Snapshot recorded"));
    }
    
    @PostMapping("/session/{token}/complete")
    public ResponseEntity<?> completeSession(@PathVariable String token) {
        Optional<InterviewSession> sessionOpt = interviewService.getSessionByToken(token);
        
        if (!sessionOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        InterviewSession session = sessionOpt.get();
        
        // Calculate final score
        Double score = answerService.calculateSessionScore(session);
        String evaluationSummary = answerService.generateEvaluationSummary(session);
        
        // Update session
        interviewService.updateSessionStatus(session, "COMPLETED");
        interviewService.updateSessionScore(session, score, evaluationSummary);
        
        return ResponseEntity.ok(new MessageResponse("Interview completed successfully"));
    }
    
    @GetMapping("/session/{token}/answers")
    public ResponseEntity<?> getSessionAnswers(@PathVariable String token) {
        Optional<InterviewSession> sessionOpt = interviewService.getSessionByToken(token);
        
        if (!sessionOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        InterviewSession session = sessionOpt.get();
        List<Answer> answers = answerService.getAnswersBySession(session);
        List<AnswerDto> answerDtos = entityMapper.toAnswerDtoList(answers);
        
        return ResponseEntity.ok(answerDtos);
    }
} 