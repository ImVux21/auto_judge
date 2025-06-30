package com.autojudge.backend.repository;

import com.autojudge.backend.model.CodingSubmission;
import com.autojudge.backend.model.CodingTask;
import com.autojudge.backend.model.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CodingSubmissionRepository extends JpaRepository<CodingSubmission, Long> {
    List<CodingSubmission> findByInterviewSessionOrderBySubmittedAtDesc(InterviewSession interviewSession);
    List<CodingSubmission> findByCodingTaskOrderBySubmittedAtDesc(CodingTask codingTask);
    Optional<CodingSubmission> findFirstByInterviewSessionAndCodingTaskAndIsCompleteTrue(
            InterviewSession interviewSession, CodingTask codingTask);
} 