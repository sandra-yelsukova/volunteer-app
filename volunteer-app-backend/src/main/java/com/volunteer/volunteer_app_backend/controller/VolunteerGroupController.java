package com.volunteer.volunteer_app_backend.controller;

import com.volunteer.volunteer_app_backend.model.User;
import com.volunteer.volunteer_app_backend.model.VolunteerGroup;
import com.volunteer.volunteer_app_backend.service.GroupMemberService;
import com.volunteer.volunteer_app_backend.service.VolunteerGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class VolunteerGroupController {

    private final VolunteerGroupService groupService;
    private final GroupMemberService groupMemberService;

    @GetMapping
    public List<VolunteerGroup> getAll() {
        return groupService.getAll();
    }

    @GetMapping("/{id}")
    public VolunteerGroup getById(@PathVariable Long id) {
        return groupService.getById(id);
    }

    @PostMapping
    public VolunteerGroup create(@RequestBody VolunteerGroup group) {
        return groupService.create(group);
    }

    @PatchMapping("/{id}")
    public VolunteerGroup update(@PathVariable Long id,
                                 @RequestBody VolunteerGroup group) {
        return groupService.update(id, group);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        groupService.delete(id);
    }

    @PostMapping("/{groupId}/members/{userId}")
    public void addMember(@PathVariable Long groupId,
                          @PathVariable Long userId) {
        groupMemberService.addMember(groupId, userId);
    }

    @DeleteMapping("/{groupId}/members/{userId}")
    public void removeMember(@PathVariable Long groupId,
                             @PathVariable Long userId) {
        groupMemberService.removeMember(groupId, userId);
    }

    @GetMapping("/{groupId}/members")
    public List<User> getMembers(@PathVariable Long groupId) {
        return groupMemberService.getMembers(groupId);
    }

    @GetMapping("/by-organizer/{organizerId}")
    public List<VolunteerGroup> getByOrganizer(@PathVariable Long organizerId) {
        return groupService.getByOrganizerId(organizerId);
    }
}
