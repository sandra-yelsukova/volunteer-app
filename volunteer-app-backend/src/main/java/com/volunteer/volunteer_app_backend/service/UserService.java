package com.volunteer.volunteer_app_backend.service;

import com.volunteer.volunteer_app_backend.model.User;
import com.volunteer.volunteer_app_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<User> getAll() {
        return userRepository.findAll();
    }

    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"
                ));
    }

    public User save(User user) {
        if (user.getEmail() == null
                || user.getName() == null
                || user.getSurname() == null
                || user.getPasswordHash() == null
                || user.getRole() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "email, name, surname, passwordHash and role are required"
            );
        }

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email already exists"
            );
        }

        user.setCreatedAt(java.time.LocalDateTime.now());
        return userRepository.save(user);
    }

    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "User not found"
            );
        }
        userRepository.deleteById(id);
    }

    public User update(Long id, User updated) {
        User existing = getById(id);

        if (updated.getEmail() != null) {
            existing.setEmail(updated.getEmail());
        }

        if (updated.getName() != null) {
            existing.setName(updated.getName());
        }

        if (updated.getSurname() != null) {
            existing.setSurname(updated.getSurname());
        }

        if (updated.getPatronymic() != null) {
            existing.setPatronymic(updated.getPatronymic());
        }

        if (updated.getPhone() != null) {
            existing.setPhone(updated.getPhone());
        }

        if (updated.getPasswordHash() != null) {
            existing.setPasswordHash(updated.getPasswordHash());
        }

        if (updated.getRole() != null) {
            existing.setRole(updated.getRole());
        }

        return userRepository.save(existing);
    }
}
