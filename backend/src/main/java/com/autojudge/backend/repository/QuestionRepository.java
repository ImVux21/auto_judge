package com.autojudge.backend.repository;

import com.autojudge.backend.model.Interview;
import com.autojudge.backend.model.Question;
import com.autojudge.backend.model.QuestionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByInterviewOrderByOrderIndexAsc(Interview interview);
    List<Question> findByInterviewAndType(Interview interview, QuestionType type);
} 