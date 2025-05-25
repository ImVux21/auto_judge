package com.autojudge.backend.repository;

import com.autojudge.backend.model.Answer;
import com.autojudge.backend.model.InterviewSession;
import com.autojudge.backend.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {
    List<Answer> findBySession(InterviewSession session);
    Optional<Answer> findBySessionAndQuestion(InterviewSession session, Question question);
} 