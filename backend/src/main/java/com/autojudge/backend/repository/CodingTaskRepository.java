package com.autojudge.backend.repository;

import com.autojudge.backend.model.CodingTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CodingTaskRepository extends JpaRepository<CodingTask, Long> {
    List<CodingTask> findByOrderByCreatedAtDesc();
} 