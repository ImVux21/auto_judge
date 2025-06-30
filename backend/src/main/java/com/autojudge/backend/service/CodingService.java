package com.autojudge.backend.service;

import com.autojudge.backend.mapper.CodingMapper;
import com.autojudge.backend.model.*;
import com.autojudge.backend.payload.dto.CodingSubmissionDto;
import com.autojudge.backend.payload.dto.CodingTaskDto;
import com.autojudge.backend.payload.dto.TestCaseDto;
import com.autojudge.backend.payload.dto.TestCaseResultDto;
import com.autojudge.backend.payload.request.ExecuteCodeRequest;
import com.autojudge.backend.payload.request.SaveProgressRequest;
import com.autojudge.backend.payload.response.ExecuteCodeResponse;
import com.autojudge.backend.repository.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CodingService {
    
    private final CodingTaskRepository codingTaskRepository;
    private final TestCaseRepository testCaseRepository;
    private final CodingSubmissionRepository codingSubmissionRepository;
    private final TestCaseResultRepository testCaseResultRepository;
    private final InterviewSessionRepository interviewSessionRepository;
    private final CodeExecutionService codeExecutionService;
    private final CodingMapper codingMapper;
    private final InterviewRepository interviewRepository;
    
    @Autowired
    public CodingService(CodingTaskRepository codingTaskRepository,
                         TestCaseRepository testCaseRepository,
                         CodingSubmissionRepository codingSubmissionRepository,
                         TestCaseResultRepository testCaseResultRepository,
                         InterviewSessionRepository interviewSessionRepository,
                         CodeExecutionService codeExecutionService,
                         CodingMapper codingMapper,
                         InterviewRepository interviewRepository) {
        this.codingTaskRepository = codingTaskRepository;
        this.testCaseRepository = testCaseRepository;
        this.codingSubmissionRepository = codingSubmissionRepository;
        this.testCaseResultRepository = testCaseResultRepository;
        this.interviewSessionRepository = interviewSessionRepository;
        this.codeExecutionService = codeExecutionService;
        this.codingMapper = codingMapper;
        this.interviewRepository = interviewRepository;
    }
    
    // Get all tasks
    public List<CodingTaskDto> getAllTasks() {
        List<CodingTask> tasks = codingTaskRepository.findByOrderByCreatedAtDesc();
        return tasks.stream()
                .map(codingMapper::toDto)
                .collect(Collectors.toList());
    }
    
    // Get task by ID
    public CodingTaskDto getTaskById(Long taskId) {
        CodingTask task = codingTaskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Coding task not found with ID: " + taskId));
        return codingMapper.toDto(task);
    }
    
    // Create new task
    @Transactional
    public CodingTaskDto createTask(CodingTaskDto taskDto) {
        CodingTask task = codingMapper.toEntity(taskDto);
        task = codingTaskRepository.save(task);
        
        // Save the test cases
        if (taskDto.getTestCases() != null && !taskDto.getTestCases().isEmpty()) {
            List<TestCase> testCases = new ArrayList<>();
            for (TestCaseDto testCaseDto : taskDto.getTestCases()) {
                TestCase testCase = codingMapper.toEntity(testCaseDto);
                testCase.setCodingTask(task);
                testCases.add(testCase);
            }
            testCaseRepository.saveAll(testCases);
            task.setTestCases(testCases);
        }
        
        return codingMapper.toDto(task);
    }
    
    // Update task
    @Transactional
    public CodingTaskDto updateTask(Long taskId, CodingTaskDto taskDto) {
        CodingTask existingTask = codingTaskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Coding task not found with ID: " + taskId));
        
        // Update fields
        existingTask.setTitle(taskDto.getTitle());
        existingTask.setDescription(taskDto.getDescription());
        existingTask.setInstructions(taskDto.getInstructions());
        existingTask.setDifficulty(taskDto.getDifficulty());
        existingTask.setTimeLimit(taskDto.getTimeLimit());
        existingTask.setLanguage(taskDto.getLanguage());
        existingTask.setTaskType(taskDto.getTaskType());
        existingTask.setInitialCode(taskDto.getInitialCode());
        existingTask.setSolutionCode(taskDto.getSolutionCode());
        
        // Update test cases
        if (taskDto.getTestCases() != null) {
            // Remove old test cases
            testCaseRepository.deleteAll(existingTask.getTestCases());
            existingTask.getTestCases().clear();
            
            // Add new test cases
            List<TestCase> testCases = new ArrayList<>();
            for (TestCaseDto testCaseDto : taskDto.getTestCases()) {
                TestCase testCase = codingMapper.toEntity(testCaseDto);
                testCase.setCodingTask(existingTask);
                testCases.add(testCase);
            }
            testCaseRepository.saveAll(testCases);
            existingTask.setTestCases(testCases);
        }
        
        existingTask = codingTaskRepository.save(existingTask);
        return codingMapper.toDto(existingTask);
    }
    
    // Delete task
    @Transactional
    public void deleteTask(Long taskId) {
        CodingTask task = codingTaskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Coding task not found with ID: " + taskId));
        codingTaskRepository.delete(task);
    }
    
    // Get task for a specific session
    public CodingTaskDto getTaskForSession(String sessionToken) {
        InterviewSession session = interviewSessionRepository.findByAccessToken(sessionToken)
                .orElseThrow(() -> new EntityNotFoundException("Interview session not found with token: " + sessionToken));
        
        // Get the associated interview
        Interview interview = session.getInterview();
        
        // Check if this interview has a coding task assigned
        if (interview.getCodingTask() == null) {
            throw new EntityNotFoundException("No coding task assigned to this interview");
        }
        
        CodingTask task = interview.getCodingTask();
        CodingTaskDto taskDto = codingMapper.toDto(task);
        
        // For candidates, don't return the solution code
        taskDto.setSolutionCode(null);
        
        // Filter out hidden test cases for candidates
        if (taskDto.getTestCases() != null) {
            taskDto.setTestCases(taskDto.getTestCases().stream()
                    .filter(tc -> !tc.getIsHidden())
                    .collect(Collectors.toList()));
        }
        
        return taskDto;
    }
    
    // Execute code
    public ExecuteCodeResponse executeCode(ExecuteCodeRequest request) {
        return codeExecutionService.executeCode(
                request.getCode(), 
                request.getLanguage(), 
                request.getTestCases()
        );
    }
    
    // Save progress
    @Transactional
    public void saveProgress(String sessionToken, SaveProgressRequest request) {
        InterviewSession session = interviewSessionRepository.findByAccessToken(sessionToken)
                .orElseThrow(() -> new EntityNotFoundException("Interview session not found with token: " + sessionToken));
        
        CodingTask task = codingTaskRepository.findById(request.getTaskId())
                .orElseThrow(() -> new EntityNotFoundException("Coding task not found with ID: " + request.getTaskId()));
        
        // Check if there's an existing incomplete submission
        CodingSubmission submission = codingSubmissionRepository.findFirstByInterviewSessionAndCodingTaskAndIsCompleteTrue(session, task)
                .orElse(null);
        
        if (submission == null) {
            // Create a new submission
            submission = new CodingSubmission();
            submission.setInterviewSession(session);
            submission.setCodingTask(task);
            submission.setLanguage(task.getLanguage());
            submission.setIsComplete(false);
        }
        
        submission.setCode(request.getCode());
        codingSubmissionRepository.save(submission);
    }
    
    // Submit solution
    @Transactional
    public CodingSubmissionDto submitSolution(CodingSubmissionDto submissionDto) {
        InterviewSession session = interviewSessionRepository.findByAccessToken(submissionDto.getSessionId())
                .orElseThrow(() -> new EntityNotFoundException("Interview session not found with token: " + submissionDto.getSessionId()));
        
        CodingTask task = codingTaskRepository.findById(submissionDto.getTaskId())
                .orElseThrow(() -> new EntityNotFoundException("Coding task not found with ID: " + submissionDto.getTaskId()));
        
        // Create or update submission
        CodingSubmission submission = new CodingSubmission();
        submission.setInterviewSession(session);
        submission.setCodingTask(task);
        submission.setCode(submissionDto.getCode());
        submission.setLanguage(submissionDto.getLanguage());
        submission.setIsComplete(true);
        submission.setCandidateNotes(submissionDto.getCandidateNotes());
        
        submission = codingSubmissionRepository.save(submission);
        
        // Execute code against all test cases (including hidden ones)
        List<TestCase> testCases = testCaseRepository.findByCodingTaskOrderBySequence(task);
        List<TestCaseDto> testCaseDtos = testCases.stream()
                .map(codingMapper::toDto)
                .collect(Collectors.toList());
        
        ExecuteCodeResponse executionResult = codeExecutionService.executeCode(
                submission.getCode(),
                submission.getLanguage(),
                testCaseDtos
        );
        
        // Save test case results
        if (executionResult.getResults() != null) {
            List<TestCaseResult> results = new ArrayList<>();
            
            for (TestCaseResultDto resultDto : executionResult.getResults()) {
                TestCase testCase = testCases.stream()
                        .filter(tc -> tc.getId().equals(resultDto.getTestCaseId()))
                        .findFirst()
                        .orElse(null);
                
                if (testCase != null) {
                    TestCaseResult result = new TestCaseResult();
                    result.setCodingSubmission(submission);
                    result.setTestCase(testCase);
                    result.setPassed(resultDto.getPassed());
                    result.setInput(resultDto.getInput());
                    result.setExpectedOutput(resultDto.getExpectedOutput());
                    result.setActualOutput(resultDto.getActualOutput());
                    result.setExecutionTimeMs(resultDto.getExecutionTimeMs());
                    
                    results.add(result);
                }
            }
            
            if (!results.isEmpty()) {
                testCaseResultRepository.saveAll(results);
                submission.setTestCaseResults(results);
            }
        }
        
        return codingMapper.toDto(submission);
    }
    
    // Get submission by ID
    public CodingSubmissionDto getSubmissionById(Long submissionId) {
        CodingSubmission submission = codingSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new EntityNotFoundException("Coding submission not found with ID: " + submissionId));
        return codingMapper.toDto(submission);
    }
    
    // Get submissions for a session
    public List<CodingSubmissionDto> getSubmissionsForSession(String sessionToken) {
        InterviewSession session = interviewSessionRepository.findByAccessToken(sessionToken)
                .orElseThrow(() -> new EntityNotFoundException("Interview session not found with token: " + sessionToken));
        
        List<CodingSubmission> submissions = codingSubmissionRepository.findByInterviewSessionOrderBySubmittedAtDesc(session);
        return submissions.stream()
                .map(codingMapper::toDto)
                .collect(Collectors.toList());
    }
    
    // Get submissions for a task
    public List<CodingSubmissionDto> getSubmissionsForTask(Long taskId) {
        CodingTask task = codingTaskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Coding task not found with ID: " + taskId));
        
        List<CodingSubmission> submissions = codingSubmissionRepository.findByCodingTaskOrderBySubmittedAtDesc(task);
        return submissions.stream()
                .map(codingMapper::toDto)
                .collect(Collectors.toList());
    }
    
    // Assign a coding task to an interview
    @Transactional
    public void assignCodingTaskToInterview(Long interviewId, Long taskId) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new EntityNotFoundException("Interview not found with ID: " + interviewId));
                
        CodingTask task = codingTaskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Coding task not found with ID: " + taskId));
                
        // For backward compatibility, still set the single task reference
        interview.setCodingTask(task);
        
        // Also add to the multiple tasks collection
        interview.getCodingTasks().add(task);
        interview.setHasCodingChallenge(true);
        interviewRepository.save(interview);
    }
    
    // Assign multiple coding tasks to an interview
    @Transactional
    public void assignMultipleCodingTasksToInterview(Long interviewId, List<Long> taskIds) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new EntityNotFoundException("Interview not found with ID: " + interviewId));
        
        // Clear existing tasks if needed
        interview.getCodingTasks().clear();
        
        // Add all new tasks
        for (Long taskId : taskIds) {
            CodingTask task = codingTaskRepository.findById(taskId)
                    .orElseThrow(() -> new EntityNotFoundException("Coding task not found with ID: " + taskId));
            interview.getCodingTasks().add(task);
        }
        
        // For backward compatibility, set the first task as the single task reference if available
        if (!taskIds.isEmpty()) {
            CodingTask firstTask = codingTaskRepository.findById(taskIds.get(0))
                    .orElseThrow(() -> new EntityNotFoundException("Coding task not found with ID: " + taskIds.get(0)));
            interview.setCodingTask(firstTask);
        } else {
            interview.setCodingTask(null);
        }
        
        interview.setHasCodingChallenge(!taskIds.isEmpty());
        interviewRepository.save(interview);
    }
    
    // Remove coding task from an interview
    @Transactional
    public void removeCodingTaskFromInterview(Long interviewId) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new EntityNotFoundException("Interview not found with ID: " + interviewId));
                
        interview.setCodingTask(null);
        interview.getCodingTasks().clear();
        interview.setHasCodingChallenge(false);
        interviewRepository.save(interview);
    }
    
    // Get all coding tasks for an interview
    public List<CodingTaskDto> getCodingTasksForInterview(Long interviewId) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new EntityNotFoundException("Interview not found with ID: " + interviewId));
        
        return interview.getCodingTasks().stream()
                .map(codingMapper::toDto)
                .collect(Collectors.toList());
    }
} 