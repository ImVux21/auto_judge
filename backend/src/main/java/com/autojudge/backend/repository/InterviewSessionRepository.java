package com.autojudge.backend.repository;

import com.autojudge.backend.model.Interview;
import com.autojudge.backend.model.InterviewSession;
import com.autojudge.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {
    List<InterviewSession> findByCandidate(User candidate);
    List<InterviewSession> findByInterview(Interview interview);
    Optional<InterviewSession> findByAccessToken(String accessToken);
} 