package com.volunteer.volunteer_app_backend.controller;

import com.volunteer.volunteer_app_backend.model.User;
import com.volunteer.volunteer_app_backend.repository.UserRepository;
import com.volunteer.volunteer_app_backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> body) {

        String email = body.get("email");
        String password = body.get("password");

        if (email == null || password == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "email and password are required"
            );
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Invalid email or password"
                ));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password"
            );
        }

        String token = JwtUtil.generateToken(user.getId(), user.getRole());

        return Map.of(
                "token", token,
                "userId", user.getId(),
                "role", user.getRole()
        );
    }

    @PostMapping("/register")
    public User register(@RequestBody User user) {

        if (user.getEmail() == null
                || user.getPasswordHash() == null
                || user.getName() == null
                || user.getSurname() == null
                || user.getRole() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Required fields missing"
            );
        }

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email already exists"
            );
        }

        user.setPasswordHash(
                passwordEncoder.encode(user.getPasswordHash())
        );

        user.setCreatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
}
