package com.volunteer.volunteer_app_backend.service;

import com.volunteer.volunteer_app_backend.model.User;
import com.volunteer.volunteer_app_backend.model.VolunteerGroup;
import com.volunteer.volunteer_app_backend.repository.UserRepository;
import com.volunteer.volunteer_app_backend.repository.VolunteerGroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VolunteerGroupService {

    private final VolunteerGroupRepository groupRepository;
    private final UserRepository userRepository;

    public List<VolunteerGroup> getAll() {
        return groupRepository.findAll();
    }

    public VolunteerGroup getById(Long id) {
        return groupRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Group not found"
                ));
    }

    public VolunteerGroup create(VolunteerGroup group) {
        if (group.getName() == null || group.getName().trim().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Group name is required"
            );
        }

        if (group.getOrganizer() == null || group.getOrganizer().getId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "organizer.id is required"
            );
        }

        if (groupRepository.existsByName(group.getName())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Group with this name already exists"
            );
        }

        attachOrganizer(group);
        group.setName(group.getName().trim());

        return groupRepository.save(group);
    }

    public VolunteerGroup update(Long id, VolunteerGroup updated) {
        VolunteerGroup existing = getById(id);

        if (updated.getName() != null) {
            existing.setName(updated.getName().trim());
        }

        if (updated.getOrganizer() != null) {
            if (updated.getOrganizer().getId() == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "organizer.id is required"
                );
            }
            attachOrganizer(updated);
            existing.setOrganizer(updated.getOrganizer());
        }

        return groupRepository.save(existing);
    }

    public void delete(Long id) {
        if (!groupRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Group not found"
            );
        }
        groupRepository.deleteById(id);
    }

    private void attachOrganizer(VolunteerGroup group) {
        Long organizerId = group.getOrganizer().getId();

        User organizer = userRepository.findById(organizerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Organizer not found: " + organizerId
                ));

        group.setOrganizer(organizer);
    }

    public List<VolunteerGroup> getByOrganizerId(Long organizerId) {
        if (organizerId == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "organizerId is required"
            );
        }

        return groupRepository.findByOrganizerId(organizerId);
    }
}
