package com.autojudge.backend.repository;

import com.autojudge.backend.model.Option;
import com.autojudge.backend.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OptionRepository extends JpaRepository<Option, Long> {
    List<Option> findByQuestion(Question question);
    List<Option> findByQuestionAndCorrectTrue(Question question);
} 