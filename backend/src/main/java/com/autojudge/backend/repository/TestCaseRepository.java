package com.autojudge.backend.repository;

import com.autojudge.backend.model.CodingTask;
import com.autojudge.backend.model.TestCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestCaseRepository extends JpaRepository<TestCase, Long> {
    List<TestCase> findByCodingTaskOrderBySequence(CodingTask codingTask);
    List<TestCase> findByCodingTaskAndIsHiddenFalseOrderBySequence(CodingTask codingTask);
} 