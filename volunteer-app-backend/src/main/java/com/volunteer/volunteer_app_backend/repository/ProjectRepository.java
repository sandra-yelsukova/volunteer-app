package com.volunteer.volunteer_app_backend.repository;

import com.volunteer.volunteer_app_backend.model.Project;
import com.volunteer.volunteer_app_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByOrganizerId(Long organizerId);

    boolean existsByTitleIgnoreCase(String title);

    @Query("""
        select distinct u
        from Project p
        join ProjectParticipant pp on pp.project.id = p.id
        join User u on u.id = pp.user.id
        where p.organizer.id = :organizerId
    """)
    List<User> findAllParticipantsByOrganizerId(@Param("organizerId") Long organizerId);
}
