package com.volunteer.volunteer_app_backend.repository;

import com.volunteer.volunteer_app_backend.model.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {

    boolean existsByGroup_IdAndUser_Id(Long groupId, Long userId);

    Optional<GroupMember> findByGroup_IdAndUser_Id(Long groupId, Long userId);

    List<GroupMember> findAllByGroup_Id(Long groupId);
}
