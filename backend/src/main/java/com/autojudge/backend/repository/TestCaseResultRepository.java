package com.autojudge.backend.repository;

import com.autojudge.backend.model.CodingSubmission;
import com.autojudge.backend.model.TestCase;
import com.autojudge.backend.model.TestCaseResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TestCaseResultRepository extends JpaRepository<TestCaseResult, Long> {
    List<TestCaseResult> findByCodingSubmissionOrderByTestCaseSequence(CodingSubmission codingSubmission);
    Optional<TestCaseResult> findByCodingSubmissionAndTestCase(CodingSubmission codingSubmission, TestCase testCase);
} 