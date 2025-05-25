package com.autojudge.backend.repository;

import com.autojudge.backend.model.Interview;
import com.autojudge.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByCreatedBy(User user);
    List<Interview> findByActiveTrue();
} 