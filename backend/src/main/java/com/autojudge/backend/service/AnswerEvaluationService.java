package com.autojudge.backend.service;

import com.autojudge.backend.dto.OpenAiAnswerDto;
import com.autojudge.backend.model.Answer;
import com.autojudge.backend.model.Option;
import com.autojudge.backend.model.Question;
import com.autojudge.backend.model.QuestionType;
import com.autojudge.backend.repository.OptionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnswerEvaluationService {
    private final ChatClient chatClient;
    private final OptionRepository optionRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public void evaluateAnswer(Answer answer) {
        Question question = answer.getQuestion();
        
        if (question.getType() == QuestionType.MULTIPLE_CHOICE) {
            evaluateMCQAnswer(answer);
        } else {
            evaluateOpenEndedAnswer(answer);
        }
    }
    
    private void evaluateMCQAnswer(Answer answer) {
        Question question = answer.getQuestion();
        List<Option> correctOptions = optionRepository.findByQuestionAndCorrectTrue(question);
        List<Option> selectedOptions = answer.getSelectedOptions();
        
        // Simple scoring: 1.0 if all correct options are selected and no incorrect ones
        if (selectedOptions.size() == correctOptions.size() && 
            selectedOptions.containsAll(correctOptions)) {
            answer.setScore(1.0);
            answer.setAiEvaluation("All correct options selected.");
        } else {
            // Calculate partial score
            int totalOptions = question.getOptions().size();
            int correctlySelected = 0;
            int incorrectlySelected = 0;
            
            Map<Long, Option> optionMap = question.getOptions().stream()
                .collect(Collectors.toMap(Option::getId, o -> o));
                
            for (Option selected : selectedOptions) {
                if (correctOptions.contains(selected)) {
                    correctlySelected++;
                } else {
                    incorrectlySelected++;
                }
            }
            
            // Penalize for incorrect selections and missing correct ones
            double score = (double) correctlySelected / correctOptions.size();
            score = Math.max(0, score - (double) incorrectlySelected / totalOptions);
            
            answer.setScore(score);
            answer.setAiEvaluation(String.format(
                "Selected %d out of %d correct options. Selected %d incorrect options.",
                correctlySelected, correctOptions.size(), incorrectlySelected));
        }
    }
    
    private void evaluateOpenEndedAnswer(Answer answer) {
        Question question = answer.getQuestion();
        String candidateAnswer = answer.getTextAnswer();
        String modelAnswer = question.getModelAnswer();
        
        String systemPrompt = """
            You are an expert evaluator for technical interviews. 
            You will be given a question, a model answer, and a candidate's answer.
            
            Your task is to:
            1. Evaluate the candidate's answer against the model answer
            2. Assign a score from 0.0 to 1.0 where:
               - 0.0 means completely incorrect or irrelevant
               - 0.5 means partially correct with significant gaps
               - 1.0 means fully correct and comprehensive
            3. Provide a brief explanation (2-3 sentences) for your score
            
            Format your response as JSON:
            {
              "score": 0.85,
              "evaluation": "Brief explanation of the score"
            }
            """;
        
        String userPrompt = String.format("""
            Question: %s
            
            Model Answer: %s
            
            Candidate Answer: %s
            
            Evaluate the candidate's answer:
            """, question.getText(), modelAnswer, candidateAnswer);

        // For Spring AI Chat Client
        String responseContent = chatClient
                .prompt()
                .system(systemPrompt)
                .user(userPrompt)
                .call()
                .content();
        // For HuggingFace
//        Message userMessage = new UserMessage(userPrompt);
//        Message systemMessage = new SystemMessage(systemPrompt);
//        ChatOptions chatOptions = ChatOptions.builder().model("deepseek/deepseek-r1-0528").build();
//        Prompt prompt = new Prompt(List.of(userMessage, systemMessage), chatOptions);
//
//        ChatResponse response = chatModel.call(prompt);
//        String responseContent = response.getResult().getOutput().getText();

        // Parse JSON response using ObjectMapper and DTO
        try {
            // Clean up the response if it contains markdown code blocks
            String cleanedResponse = responseContent.replaceAll("```json|```", "").trim();
            
            // Parse the JSON response into our DTO
            OpenAiAnswerDto aiAnswer = objectMapper.readValue(cleanedResponse, OpenAiAnswerDto.class);
            
            // Set the score and evaluation from the parsed DTO
            answer.setScore(aiAnswer.getScore() != null ? aiAnswer.getScore() : 0.0);
            answer.setAiEvaluation(aiAnswer.getEvaluation());
        } catch (Exception e) {
            answer.setScore(0.0);
            answer.setAiEvaluation("Error evaluating answer: " + e.getMessage());
        }
    }
} 