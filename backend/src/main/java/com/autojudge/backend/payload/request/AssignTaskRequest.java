package com.autojudge.backend.payload.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class AssignTaskRequest {
    // Keep for backward compatibility
    private Long taskId;
    
    @NotEmpty
    private List<Long> taskIds;

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }
    
    public List<Long> getTaskIds() {
        return taskIds;
    }
    
    public void setTaskIds(List<Long> taskIds) {
        this.taskIds = taskIds;
    }
} 