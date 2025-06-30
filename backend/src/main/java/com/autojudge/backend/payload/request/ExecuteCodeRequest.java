package com.autojudge.backend.payload.request;

import com.autojudge.backend.payload.dto.TestCaseDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExecuteCodeRequest {
    private String code;
    private String language;
    private List<TestCaseDto> testCases;
} 