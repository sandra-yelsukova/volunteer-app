package com.volunteer.volunteer_app_backend.service;

import com.volunteer.volunteer_app_backend.model.GroupMember;
import com.volunteer.volunteer_app_backend.model.User;
import com.volunteer.volunteer_app_backend.model.VolunteerGroup;
import com.volunteer.volunteer_app_backend.repository.GroupMemberRepository;
import com.volunteer.volunteer_app_backend.repository.UserRepository;
import com.volunteer.volunteer_app_backend.repository.VolunteerGroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GroupMemberService {

    private final GroupMemberRepository groupMemberRepository;
    private final VolunteerGroupRepository groupRepository;
    private final UserRepository userRepository;

    public void addMember(Long groupId, Long userId) {
        VolunteerGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Group not found"
                ));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"
                ));

        if (groupMemberRepository.existsByGroup_IdAndUser_Id(groupId, userId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "User already in group"
            );
        }

        GroupMember member = new GroupMember();
        member.setGroup(group);
        member.setUser(user);

        groupMemberRepository.save(member);
    }

    public void removeMember(Long groupId, Long userId) {
        GroupMember member = groupMemberRepository
                .findByGroup_IdAndUser_Id(groupId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User is not a member of this group"
                ));

        groupMemberRepository.delete(member);
    }

    public List<User> getMembers(Long groupId) {
        if (!groupRepository.existsById(groupId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Group not found"
            );
        }

        return groupMemberRepository.findAllByGroup_Id(groupId)
                .stream()
                .map(GroupMember::getUser)
                .toList();
    }
}
