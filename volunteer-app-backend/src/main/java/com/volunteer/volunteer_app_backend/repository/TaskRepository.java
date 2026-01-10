package com.volunteer.volunteer_app_backend.repository;

import com.volunteer.volunteer_app_backend.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectId(Long projectId);

    List<Task> findByProjectOrganizerId(Long organizerId);

    @Query("""
            select distinct t
            from Task t
            join ProjectParticipant pp on pp.project = t.project
            where pp.user.id = :userId
            """)
    List<Task> findByProjectParticipantId(@Param("userId") Long userId);
}
