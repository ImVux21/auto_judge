package com.autojudge.backend.mapper;

import com.autojudge.backend.model.*;
import com.autojudge.backend.payload.dto.*;
import com.autojudge.backend.repository.OptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class EntityMapper {
    private final OptionRepository optionRepository;

    public UserDto toUserDto(User user) {
        if (user == null) {
            return null;
        }
        
        List<String> roles = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toList());
        
        return new UserDto(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                roles
        );
    }
    
    public InterviewDto toInterviewDto(Interview interview) {
        if (interview == null) {
            return null;
        }
        
        int mcqCount = 0;
        int openEndedCount = 0;
        
        for (Question question : interview.getQuestions()) {
            if (question.getType() == QuestionType.MULTIPLE_CHOICE) {
                mcqCount++;
            } else if (question.getType() == QuestionType.OPEN_ENDED) {
                openEndedCount++;
            }
        }
        
        return new InterviewDto(
                interview.getId(),
                interview.getTitle(),
                interview.getJobRole(),
                interview.getDescription(),
                interview.getTimeLimit(),
                interview.getCreatedAt(),
                interview.isActive(),
                toUserDto(interview.getCreatedBy()),
                interview.getQuestions().size(),
                mcqCount,
                openEndedCount
        );
    }
    
    public List<InterviewDto> toInterviewDtoList(List<Interview> interviews) {
        return interviews.stream()
                .map(this::toInterviewDto)
                .collect(Collectors.toList());
    }
    
    public OptionDto toOptionDto(Option option) {
        if (option == null) {
            return null;
        }
        
        return new OptionDto(
                option.getId(),
                option.getText(),
                option.isCorrect()
        );
    }
    
    public List<OptionDto> toOptionDtoList(List<Option> options) {
        return options.stream()
                .map(this::toOptionDto)
                .collect(Collectors.toList());
    }
    
    public QuestionDto toQuestionDto(Question question) {
        if (question == null) {
            return null;
        }
        
        QuestionDto dto = new QuestionDto(
                question.getId(),
                question.getText(),
                question.getType(),
                question.getDifficultyLevel(),
                question.getCategory(),
                question.getModelAnswer(),
                question.getOrderIndex(),
                toOptionDtoList(question.getOptions())
        );
        
        return dto;
    }
    
    public List<QuestionDto> toQuestionDtoList(List<Question> questions) {
        return questions.stream()
                .map(this::toQuestionDto)
                .collect(Collectors.toList());
    }
    
    public InterviewSessionDto toInterviewSessionDto(InterviewSession session) {
        if (session == null) {
            return null;
        }
        
        return new InterviewSessionDto(
                session.getId(),
                session.getAccessToken(),
                session.getStartTime(),
                session.getEndTime(),
                session.getStatus(),
                session.getScore(),
                session.getEvaluationSummary(),
                toInterviewDto(session.getInterview()),
                toUserDto(session.getCandidate()),
                session.getIpAddress(),
                session.getDeviceInfo(),
                session.isProctored(),
                session.getProctorNotes()
        );
    }
    
    public List<InterviewSessionDto> toInterviewSessionDtoList(List<InterviewSession> sessions) {
        return sessions.stream()
                .map(this::toInterviewSessionDto)
                .collect(Collectors.toList());
    }
    
    public AnswerDto toAnswerDto(Answer answer) {
        if (answer == null) {
            return null;
        }
        
        return new AnswerDto(
                answer.getId(),
                answer.getTextAnswer(),
                toOptionDtoList(answer.getSelectedOptions()),
                answer.getScore(),
                answer.getAiEvaluation(),
                answer.getSubmittedAt(),
                toQuestionDto(answer.getQuestion())
        );
    }
    
    public List<AnswerDto> toAnswerDtoList(List<Answer> answers) {
        return answers.stream()
                .map(this::toAnswerDto)
                .collect(Collectors.toList());
    }
    
    public AnswerPerformanceDto toAnswerPerformanceDto(Answer answer, List<Option> correctOptions) {
        if (answer == null) {
            return null;
        }
        
        // Get user's answer as text
        String answerText;
        if (answer.getQuestion().getType() == QuestionType.OPEN_ENDED) {
            answerText = answer.getTextAnswer();
        } else if (answer.getQuestion().getType() == QuestionType.MULTIPLE_CHOICE) {
            if (answer.getSelectedOptions() != null && !answer.getSelectedOptions().isEmpty()) {
                answerText = answer.getSelectedOptions().stream()
                        .map(Option::getText)
                        .collect(Collectors.joining(", "));
            } else {
                answerText = "No selection";
            }
        } else {
            answerText = answer.getId().toString();
        }
        
        // Get correct answer for reference
        String correctAnswer = "";
        if (correctOptions == null) {
            correctOptions = optionRepository.findByQuestionAndCorrectTrue(answer.getQuestion());
        }
        
        if (answer.getQuestion().getType() == QuestionType.OPEN_ENDED) {
            correctAnswer = answer.getQuestion().getModelAnswer();
        } else if (answer.getQuestion().getType() == QuestionType.MULTIPLE_CHOICE && !correctOptions.isEmpty()) {
            correctAnswer = correctOptions.stream()
                    .map(Option::getText)
                    .collect(Collectors.joining(", "));
        }
        
        return new AnswerPerformanceDto(
                answer.getId(),
                answerText,
                answer.getQuestion().getId(),
                answer.getQuestion().getText(),
                answer.getQuestion().getType(),
                answer.getScore(),
                answer.getAiEvaluation(),
                toOptionDtoList(answer.getSelectedOptions()),
                correctAnswer
        );
    }
    
    public List<AnswerPerformanceDto> toAnswerPerformanceDtoList(List<Answer> answers) {
        return answers.stream()
                .map(answer -> toAnswerPerformanceDto(answer, null))
                .collect(Collectors.toList());
    }
} 