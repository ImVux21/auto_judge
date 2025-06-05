package com.autojudge.backend;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class AutoJudgeApplication {

    public static void main(String[] args) {
        SpringApplication.run(AutoJudgeApplication.class, args);
    }

    @Bean
    public CommandLineRunner testOllama(ChatClient chatClient) {
        return args -> {
            ChatResponse response = chatClient.prompt(new Prompt("Hello!")).call().chatResponse();
            System.out.println("Ollama says: " + response.getResult().getOutput().getText());
        };
    }

} 