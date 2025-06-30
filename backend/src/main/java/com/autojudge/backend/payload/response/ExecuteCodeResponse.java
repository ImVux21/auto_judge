package com.autojudge.backend.payload.response;

import com.autojudge.backend.payload.dto.TestCaseResultDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExecuteCodeResponse {
    private Boolean success;
    private List<TestCaseResultDto> results;
    private String compilationError;
    private String executionError;
} 