package com.autojudge.backend.controller;

import com.autojudge.backend.payload.dto.CodingSubmissionDto;
import com.autojudge.backend.payload.dto.CodingTaskDto;
import com.autojudge.backend.payload.request.AssignTaskRequest;
import com.autojudge.backend.payload.request.ExecuteCodeRequest;
import com.autojudge.backend.payload.request.SaveProgressRequest;
import com.autojudge.backend.payload.response.ExecuteCodeResponse;
import com.autojudge.backend.payload.response.MessageResponse;
import com.autojudge.backend.service.CodingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coding")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CodingController {

    private final CodingService codingService;

    @Autowired
    public CodingController(CodingService codingService) {
        this.codingService = codingService;
    }

    @GetMapping("/tasks")
    @PreAuthorize("hasRole('INTERVIEWER') or hasRole('ADMIN')")
    public ResponseEntity<List<CodingTaskDto>> getAllTasks() {
        return ResponseEntity.ok(codingService.getAllTasks());
    }
    
    @GetMapping("/tasks/{id}")
    @PreAuthorize("hasRole('INTERVIEWER') or hasRole('ADMIN')")
    public ResponseEntity<CodingTaskDto> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(codingService.getTaskById(id));
    }
    
    @PostMapping("/tasks")
    @PreAuthorize("hasRole('INTERVIEWER') or hasRole('ADMIN')")
    public ResponseEntity<CodingTaskDto> createTask(@RequestBody CodingTaskDto taskDto) {
        return ResponseEntity.ok(codingService.createTask(taskDto));
    }
    
    @PutMapping("/tasks/{id}")
    @PreAuthorize("hasRole('INTERVIEWER') or hasRole('ADMIN')")
    public ResponseEntity<CodingTaskDto> updateTask(@PathVariable Long id, @RequestBody CodingTaskDto taskDto) {
        return ResponseEntity.ok(codingService.updateTask(id, taskDto));
    }
    
    @DeleteMapping("/tasks/{id}")
    @PreAuthorize("hasRole('INTERVIEWER') or hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteTask(@PathVariable Long id) {
        codingService.deleteTask(id);
        return ResponseEntity.ok(new MessageResponse("Task deleted successfully"));
    }
    
    @GetMapping("/tasks/{id}/submissions")
    @PreAuthorize("hasRole('INTERVIEWER') or hasRole('ADMIN')")
    public ResponseEntity<List<CodingSubmissionDto>> getSubmissionsForTask(@PathVariable Long id) {
        return ResponseEntity.ok(codingService.getSubmissionsForTask(id));
    }
    
    // Candidate endpoints
    
    @GetMapping("/sessions/{sessionToken}/task")
    public ResponseEntity<CodingTaskDto> getTaskForSession(@PathVariable String sessionToken) {
        return ResponseEntity.ok(codingService.getTaskForSession(sessionToken));
    }
    
    @PostMapping("/sessions/{sessionToken}/progress")
    public ResponseEntity<MessageResponse> saveProgress(@PathVariable String sessionToken, @RequestBody SaveProgressRequest request) {
        codingService.saveProgress(sessionToken, request);
        return ResponseEntity.ok(new MessageResponse("Progress saved successfully"));
    }
    
    @GetMapping("/sessions/{sessionToken}/submissions")
    public ResponseEntity<List<CodingSubmissionDto>> getSubmissionsForSession(@PathVariable String sessionToken) {
        return ResponseEntity.ok(codingService.getSubmissionsForSession(sessionToken));
    }
    
    // Shared endpoints
    
    @PostMapping("/execute")
    public ResponseEntity<ExecuteCodeResponse> executeCode(@RequestBody ExecuteCodeRequest request) {
        return ResponseEntity.ok(codingService.executeCode(request));
    }
    
    @PostMapping("/submissions")
    public ResponseEntity<CodingSubmissionDto> submitSolution(@RequestBody CodingSubmissionDto submissionDto) {
        return ResponseEntity.ok(codingService.submitSolution(submissionDto));
    }
    
    @GetMapping("/submissions/{id}")
    public ResponseEntity<CodingSubmissionDto> getSubmissionById(@PathVariable Long id) {
        return ResponseEntity.ok(codingService.getSubmissionById(id));
    }

    @PostMapping("/interviews/{interviewId}/assign-task")
    @PreAuthorize("hasRole('INTERVIEWER') or hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> assignCodingTaskToInterview(@PathVariable Long interviewId, @RequestBody AssignTaskRequest request) {
        // For backward compatibility
        if (request.getTaskId() != null && (request.getTaskIds() == null || request.getTaskIds().isEmpty())) {
            codingService.assignCodingTaskToInterview(interviewId, request.getTaskId());
            return ResponseEntity.ok(new MessageResponse("Coding task assigned to interview successfully"));
        }
        
        // Use the new method for multiple tasks
        codingService.assignMultipleCodingTasksToInterview(interviewId, request.getTaskIds());
        return ResponseEntity.ok(new MessageResponse("Multiple coding tasks assigned to interview successfully"));
    }
    
    @GetMapping("/interviews/{interviewId}/tasks")
    @PreAuthorize("hasRole('INTERVIEWER') or hasRole('ADMIN')")
    public ResponseEntity<List<CodingTaskDto>> getCodingTasksForInterview(@PathVariable Long interviewId) {
        return ResponseEntity.ok(codingService.getCodingTasksForInterview(interviewId));
    }
    
    @DeleteMapping("/interviews/{interviewId}/remove-task")
    @PreAuthorize("hasRole('INTERVIEWER') or hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> removeCodingTaskFromInterview(@PathVariable Long interviewId) {
        codingService.removeCodingTaskFromInterview(interviewId);
        return ResponseEntity.ok(new MessageResponse("Coding tasks removed from interview successfully"));
    }
} 