package com.volunteer.volunteer_app_backend.repository;

import com.volunteer.volunteer_app_backend.model.VolunteerGroup;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VolunteerGroupRepository extends JpaRepository<VolunteerGroup, Long> {

    boolean existsByName(String name);
}
