package com.autojudge.backend.service;

import com.autojudge.backend.model.*;
import com.autojudge.backend.repository.AnswerRepository;
import com.autojudge.backend.repository.OptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnswerService {

    private final AnswerRepository answerRepository;
    private final OptionRepository optionRepository;
    private final AnswerEvaluationService evaluationService;

    @Transactional
    public Answer submitMCQAnswer(InterviewSession session, Question question, List<Long> optionIds) {
        // Check if answer already exists
        Optional<Answer> existingAnswer = answerRepository.findBySessionAndQuestion(session, question);
        Answer answer;
        
        if (existingAnswer.isPresent()) {
            answer = existingAnswer.get();
            answer.getSelectedOptions().clear(); // Clear previous selections
        } else {
            answer = new Answer();
            answer.setSession(session);
            answer.setQuestion(question);
            answer.setSubmittedAt(LocalDateTime.now());
        }
        
        // Set selected options
        List<Option> selectedOptions = optionIds.stream()
                .map(id -> optionRepository.findById(id).orElse(null))
                .filter(option -> option != null)
                .collect(Collectors.toList());
        
        answer.setSelectedOptions(selectedOptions);
        
        // Save answer
        Answer savedAnswer = answerRepository.save(answer);
        
        // Evaluate answer
        evaluationService.evaluateAnswer(savedAnswer);
        
        return answerRepository.save(savedAnswer);
    }
    
    @Transactional
    public Answer submitOpenEndedAnswer(InterviewSession session, Question question, String textAnswer) {
        // Check if answer already exists
        Optional<Answer> existingAnswer = answerRepository.findBySessionAndQuestion(session, question);
        Answer answer;
        
        if (existingAnswer.isPresent()) {
            answer = existingAnswer.get();
        } else {
            answer = new Answer();
            answer.setSession(session);
            answer.setQuestion(question);
            answer.setSubmittedAt(LocalDateTime.now());
        }
        
        answer.setTextAnswer(textAnswer);
        
        // Save answer
        Answer savedAnswer = answerRepository.save(answer);
        
        // Evaluate answer
        evaluationService.evaluateAnswer(savedAnswer);
        
        return answerRepository.save(savedAnswer);
    }
    
    public List<Answer> getAnswersBySession(InterviewSession session) {
        return answerRepository.findBySession(session);
    }
    
    public Optional<Answer> getAnswerById(Long id) {
        return answerRepository.findById(id);
    }
    
    public Double calculateSessionScore(InterviewSession session) {
        List<Answer> answers = answerRepository.findBySession(session);
        
        if (answers.isEmpty()) {
            return 0.0;
        }
        
        double totalScore = answers.stream()
                .mapToDouble(answer -> answer.getScore() != null ? answer.getScore() : 0.0)
                .sum();
        
        return totalScore / answers.size();
    }
    
    public String generateEvaluationSummary(InterviewSession session) {
        List<Answer> answers = answerRepository.findBySession(session);
        
        if (answers.isEmpty()) {
            return "No answers submitted.";
        }
        
        double mcqScore = answers.stream()
                .filter(a -> a.getQuestion().getType() == QuestionType.MULTIPLE_CHOICE)
                .mapToDouble(a -> a.getScore() != null ? a.getScore() : 0.0)
                .average()
                .orElse(0.0);
                
        double openEndedScore = answers.stream()
                .filter(a -> a.getQuestion().getType() == QuestionType.OPEN_ENDED)
                .mapToDouble(a -> a.getScore() != null ? a.getScore() : 0.0)
                .average()
                .orElse(0.0);
        
        int mcqCount = (int) answers.stream()
                .filter(a -> a.getQuestion().getType() == QuestionType.MULTIPLE_CHOICE)
                .count();
                
        int openEndedCount = (int) answers.stream()
                .filter(a -> a.getQuestion().getType() == QuestionType.OPEN_ENDED)
                .count();
        
        return String.format(
            "Overall Score: %.2f\n" +
            "MCQ Score: %.2f (%d questions)\n" +
            "Open-ended Score: %.2f (%d questions)\n",
            (mcqScore * mcqCount + openEndedScore * openEndedCount) / (mcqCount + openEndedCount),
            mcqScore, mcqCount,
            openEndedScore, openEndedCount
        );
    }
} 