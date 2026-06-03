package com.habittracker.service;

import com.habittracker.dto.JwtResponse;
import com.habittracker.dto.LoginRequest;
import com.habittracker.dto.RegisterRequest;
import com.habittracker.entity.User;
import com.habittracker.exception.BadRequestException;
import com.habittracker.repository.UserRepository;
import com.habittracker.security.JwtUtils;
import com.habittracker.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private NotificationService notificationService;

    public User registerUser(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Error: Email is already in use!");
        }

        User user = User.builder()
                .name(registerRequest.getName())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .avatarUrl("https://api.dicebear.com/7.x/adventurer/svg?seed=" + UUID.randomUUID())
                .themePreference("DARK")
                .languagePreference("en")
                .timezone("UTC")
                .build();

        User savedUser = userRepository.save(user);

        // Send a welcome notification
        notificationService.createNotification(
                savedUser.getId(),
                "Welcome to HabitFlow!",
                "Get started by creating your first daily habit and checking it off!",
                "REMINDER"
        );

        return savedUser;
    }

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findByEmail(userPrincipal.getUsername())
                .orElseThrow(() -> new BadRequestException("User record not found."));

        JwtResponse.UserResponse userResponse = JwtResponse.UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .themePreference(user.getThemePreference())
                .build();

        return JwtResponse.builder()
                .accessToken(jwt)
                .refreshToken(jwtUtils.generateTokenFromUsername(userPrincipal.getUsername())) // Simply using a refreshed claims JWT for now
                .user(userResponse)
                .build();
    }
}
