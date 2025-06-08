package com.autojudge.backend.service;

import com.autojudge.backend.model.Interview;
import com.autojudge.backend.model.Option;
import com.autojudge.backend.model.Question;
import com.autojudge.backend.model.QuestionType;
import com.autojudge.backend.repository.QuestionRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.ChatOptions;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionGenerationService {
    private final ChatClient chatClient;
    private final OllamaChatModel chatModel;
    private final QuestionRepository questionRepository;
    
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<Question> generateQuestionsForInterview(Interview interview, int mcqCount, int openEndedCount) {
        List<Question> generatedQuestions = new ArrayList<>();
        
        if (mcqCount > 0) {
            generatedQuestions.addAll(generateMCQs(interview, mcqCount));
        }
        
        if (openEndedCount > 0) {
            generatedQuestions.addAll(generateOpenEndedQuestions(interview, openEndedCount));
        }
        
        for (int i = 0; i < generatedQuestions.size(); i++) {
            generatedQuestions.get(i).setOrderIndex(i);
        }
        
        return questionRepository.saveAll(generatedQuestions);
    }
    
    private List<Question> generateMCQs(Interview interview, int count) {
        String systemPrompt = """
            You are an expert technical interviewer specialized in creating multiple-choice questions.
            Generate %d multiple-choice questions for a %s role.
            
            For each question:
            1. Create a clear, concise question text
            2. Provide exactly 4 options
            3. Indicate which option is correct
            4. Assign a difficulty level from 1-5
            5. Provide a category for the question (e.g., "Java Basics", "React Fundamentals", etc.)
            
            Format your response as a JSON array with this structure:
            [
              {
                "questionText": "Question text here",
                "options": [
                  {"text": "Option 1", "correct": false},
                  {"text": "Option 2", "correct": true},
                  {"text": "Option 3", "correct": false},
                  {"text": "Option 4", "correct": false}
                ],
                "difficultyLevel": 3,
                "category": "Category name"
              }
            ]
            """;
        String formattedSystemPrompt = String.format(systemPrompt, count, interview.getJobRole());
        // For Spring AI Chat Client
//        String responseContent = chatClient
//                .prompt()
//                .system(formattedSystemPrompt)
//                .user("Generate the questions now")
//                .call()
//                .content();

        // For HuggingFace
        Message userMessage = new UserMessage("Generate the questions now");
        Message systemMessage = new SystemMessage(formattedSystemPrompt);
        Prompt prompt = new Prompt(List.of(userMessage, systemMessage));

        ChatResponse response = chatModel.call(prompt);
        String responseContent = response.getResult().getOutput().getText();
        try {
            JsonNode questionsArray = objectMapper.readTree(responseContent);
            List<Question> questions = new ArrayList<>();
            
            for (JsonNode questionNode : questionsArray) {
                Question question = new Question();
                question.setInterview(interview);
                question.setText(questionNode.get("questionText").asText());
                question.setType(QuestionType.MULTIPLE_CHOICE);
                question.setDifficultyLevel(questionNode.get("difficultyLevel").asInt());
                question.setCategory(questionNode.get("category").asText());
                
                List<Option> options = new ArrayList<>();
                JsonNode optionsArray = questionNode.get("options");
                
                for (JsonNode optionNode : optionsArray) {
                    Option option = new Option();
                    option.setText(optionNode.get("text").asText());
                    option.setCorrect(optionNode.get("correct").asBoolean());
                    option.setQuestion(question);
                    options.add(option);
                }
                
                question.setOptions(options);
                questions.add(question);
            }
            
            return questions;
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to parse AI response for MCQ generation", e);
        }
    }
    
    private List<Question> generateOpenEndedQuestions(Interview interview, int count) {
        String systemPrompt = """
            You are an expert technical interviewer specialized in creating open-ended questions.
            Generate %d open-ended questions for a %s role.
            
            For each question:
            1. Create a challenging, thought-provoking question
            2. Provide a model answer that would be considered excellent
            3. Assign a difficulty level from 1-5
            4. Provide a category for the question (e.g., "System Design", "Problem Solving", etc.)
            
            Format your response as a JSON array with this structure:
            [
              {
                "questionText": "Question text here",
                "modelAnswer": "A detailed model answer that would be considered excellent",
                "difficultyLevel": 4,
                "category": "Category name"
              }
            ]
            """;
        String formattedSystemPrompt = String.format(systemPrompt, count, interview.getJobRole());
        
        String responseContent = chatClient
                .prompt()
                .system(formattedSystemPrompt)
                .user("Generate the questions now")
                .call()
                .content();
        try {
            JsonNode questionsArray = objectMapper.readTree(responseContent);
            List<Question> questions = new ArrayList<>();
            
            for (JsonNode questionNode : questionsArray) {
                Question question = new Question();
                question.setInterview(interview);
                question.setText(questionNode.get("questionText").asText());
                question.setType(QuestionType.OPEN_ENDED);
                question.setDifficultyLevel(questionNode.get("difficultyLevel").asInt());
                question.setCategory(questionNode.get("category").asText());
                question.setModelAnswer(questionNode.get("modelAnswer").asText());
                
                questions.add(question);
            }
            
            return questions;
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to parse AI response for open-ended question generation", e);
        }
    }
} 