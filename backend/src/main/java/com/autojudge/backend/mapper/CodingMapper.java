package com.autojudge.backend.mapper;

import com.autojudge.backend.model.CodingSubmission;
import com.autojudge.backend.model.CodingTask;
import com.autojudge.backend.model.TestCase;
import com.autojudge.backend.model.TestCaseResult;
import com.autojudge.backend.payload.dto.CodingSubmissionDto;
import com.autojudge.backend.payload.dto.CodingTaskDto;
import com.autojudge.backend.payload.dto.TestCaseDto;
import com.autojudge.backend.payload.dto.TestCaseResultDto;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class CodingMapper {

    public CodingTaskDto toDto(CodingTask codingTask) {
        if (codingTask == null) {
            return null;
        }

        CodingTaskDto dto = new CodingTaskDto();
        dto.setId(codingTask.getId());
        dto.setTitle(codingTask.getTitle());
        dto.setDescription(codingTask.getDescription());
        dto.setInstructions(codingTask.getInstructions());
        dto.setDifficulty(codingTask.getDifficulty());
        dto.setTimeLimit(codingTask.getTimeLimit());
        dto.setLanguage(codingTask.getLanguage());
        dto.setTaskType(codingTask.getTaskType());
        dto.setInitialCode(codingTask.getInitialCode());
        dto.setSolutionCode(codingTask.getSolutionCode());
        dto.setCreatedAt(codingTask.getCreatedAt());
        dto.setUpdatedAt(codingTask.getUpdatedAt());

        if (codingTask.getTestCases() != null) {
            dto.setTestCases(codingTask.getTestCases().stream()
                    .map(this::toDto)
                    .collect(Collectors.toList()));
        } else {
            dto.setTestCases(new ArrayList<>());
        }

        return dto;
    }

    public TestCaseDto toDto(TestCase testCase) {
        if (testCase == null) {
            return null;
        }

        TestCaseDto dto = new TestCaseDto();
        dto.setId(testCase.getId());
        dto.setInput(testCase.getInput());
        dto.setExpectedOutput(testCase.getExpectedOutput());
        dto.setIsHidden(testCase.getIsHidden());
        dto.setSequence(testCase.getSequence());

        return dto;
    }

    public CodingSubmissionDto toDto(CodingSubmission submission) {
        if (submission == null) {
            return null;
        }

        CodingSubmissionDto dto = new CodingSubmissionDto();
        dto.setId(submission.getId());
        dto.setSessionId(submission.getInterviewSession().getAccessToken());
        dto.setTaskId(submission.getCodingTask().getId());
        dto.setCode(submission.getCode());
        dto.setLanguage(submission.getLanguage());
        dto.setSubmittedAt(submission.getSubmittedAt());
        dto.setIsComplete(submission.getIsComplete());
        dto.setCandidateNotes(submission.getCandidateNotes());

        if (submission.getTestCaseResults() != null) {
            dto.setExecutionResults(submission.getTestCaseResults().stream()
                    .map(this::toDto)
                    .collect(Collectors.toList()));
        } else {
            dto.setExecutionResults(new ArrayList<>());
        }

        return dto;
    }

    public TestCaseResultDto toDto(TestCaseResult result) {
        if (result == null) {
            return null;
        }

        TestCaseResultDto dto = new TestCaseResultDto();
        dto.setTestCaseId(result.getTestCase().getId());
        dto.setPassed(result.getPassed());
        dto.setInput(result.getInput());
        dto.setExpectedOutput(result.getExpectedOutput());
        dto.setActualOutput(result.getActualOutput());
        dto.setExecutionTimeMs(result.getExecutionTimeMs());

        return dto;
    }

    public CodingTask toEntity(CodingTaskDto dto) {
        if (dto == null) {
            return null;
        }

        CodingTask entity = new CodingTask();
        entity.setId(dto.getId());
        entity.setTitle(dto.getTitle());
        entity.setDescription(dto.getDescription());
        entity.setInstructions(dto.getInstructions());
        entity.setDifficulty(dto.getDifficulty());
        entity.setTimeLimit(dto.getTimeLimit());
        entity.setLanguage(dto.getLanguage());
        entity.setTaskType(dto.getTaskType());
        entity.setInitialCode(dto.getInitialCode());
        entity.setSolutionCode(dto.getSolutionCode());

        return entity;
    }

    public TestCase toEntity(TestCaseDto dto) {
        if (dto == null) {
            return null;
        }

        TestCase entity = new TestCase();
        entity.setId(dto.getId());
        entity.setInput(dto.getInput());
        entity.setExpectedOutput(dto.getExpectedOutput());
        entity.setIsHidden(dto.getIsHidden());
        entity.setSequence(dto.getSequence());

        return entity;
    }
} 