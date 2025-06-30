package com.autojudge.backend.service;

import com.autojudge.backend.payload.dto.TestCaseDto;
import com.autojudge.backend.payload.dto.TestCaseResultDto;
import com.autojudge.backend.payload.response.ExecuteCodeResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

@Service
public class CodeExecutionService {

    // This is a simplified mock implementation of code execution
    // In a real-world scenario, you would use a secure code execution engine or a third-party service
    public ExecuteCodeResponse executeCode(String code, String language, List<TestCaseDto> testCases) {
        ExecuteCodeResponse response = new ExecuteCodeResponse();
        response.setSuccess(true);
        response.setResults(new ArrayList<>());
        
        // Simulate code compilation errors for certain languages
        if (language.equals("java") && !code.contains("class")) {
            response.setSuccess(false);
            response.setCompilationError("Missing class definition");
            return response;
        }
        
        // Execute test cases
        for (TestCaseDto testCase : testCases) {
            TestCaseResultDto result = executeTestCase(code, language, testCase);
            response.getResults().add(result);
            
            // If any test case fails with an error, mark as unsuccessful
            if (!result.getPassed() && result.getActualOutput().contains("ERROR:")) {
                response.setSuccess(false);
                if (response.getExecutionError() == null) {
                    response.setExecutionError(result.getActualOutput());
                }
            }
        }
        
        return response;
    }
    
    private TestCaseResultDto executeTestCase(String code, String language, TestCaseDto testCase) {
        TestCaseResultDto result = new TestCaseResultDto();
        result.setTestCaseId(testCase.getId());
        result.setInput(testCase.getInput());
        result.setExpectedOutput(testCase.getExpectedOutput());
        
        long startTime = System.currentTimeMillis();
        
        // For demonstration purposes, we'll mock the code execution with some simple rules
        try {
            // Use CompletableFuture with timeout to simulate code execution time limits
            String output = CompletableFuture.supplyAsync(() -> {
                // Simulate code execution based on language and input
                return mockExecuteCode(code, language, testCase.getInput());
            }).get(5, TimeUnit.SECONDS); // 5 second timeout
            
            result.setActualOutput(output);
            result.setPassed(output.trim().equals(testCase.getExpectedOutput().trim()));
            
        } catch (TimeoutException e) {
            result.setActualOutput("ERROR: Execution timed out");
            result.setPassed(false);
        } catch (Exception e) {
            result.setActualOutput("ERROR: " + e.getMessage());
            result.setPassed(false);
        }
        
        long endTime = System.currentTimeMillis();
        result.setExecutionTimeMs(endTime - startTime);
        
        return result;
    }
    
    // Mock code execution
    private String mockExecuteCode(String code, String language, String input) {
        // This is a very simple mock implementation
        // In a real scenario, you would use a secure code execution environment
        
        // Simple pattern-based "execution"
        if (code.contains("System.out.print") || code.contains("console.log") || code.contains("print(") || code.contains("printf")) {
            // Look for expected output patterns in the code
            String[] lines = code.split("\n");
            for (String line : lines) {
                if (line.contains("System.out.print") || line.contains("console.log") || line.contains("print(") || line.contains("printf")) {
                    // Extract what would be printed
                    int start = line.indexOf("\"");
                    int end = line.lastIndexOf("\"");
                    if (start >= 0 && end > start) {
                        return line.substring(start + 1, end);
                    } else if (line.contains("'")) {
                        start = line.indexOf("'");
                        end = line.lastIndexOf("'");
                        if (start >= 0 && end > start) {
                            return line.substring(start + 1, end);
                        }
                    }
                }
            }
            
            // If we can't extract directly, use the input transformed
            if (input.matches("\\d+") && code.contains("+")) {
                // Simple addition
                return String.valueOf(Integer.parseInt(input) + 1);
            } else if (input.matches("\\d+") && code.contains("*")) {
                // Simple multiplication
                return String.valueOf(Integer.parseInt(input) * 2);
            } else {
                // Default: return the input as output
                return input;
            }
        }
        
        // If there's no output logic, return a default message
        return "No output generated";
    }
} 