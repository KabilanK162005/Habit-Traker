package com.habittracker.controller;

import com.habittracker.dto.PasswordUpdateRequest;
import com.habittracker.dto.ProfileUpdateRequest;
import com.habittracker.entity.Achievement;
import com.habittracker.entity.Habit;
import com.habittracker.entity.User;
import com.habittracker.exception.BadRequestException;
import com.habittracker.exception.ResourceNotFoundException;
import com.habittracker.repository.UserRepository;
import com.habittracker.security.UserDetailsImpl;
import com.habittracker.service.AchievementService;
import com.habittracker.service.HabitService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AchievementService achievementService;

    @Autowired
    private HabitService habitService;

    private String getAuthenticatedUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userDetails.getId();
    }

    @GetMapping
    public ResponseEntity<User> getProfile() {
        String userId = getAuthenticatedUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        // Never return password hashes in JSON response
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    @PutMapping
    public ResponseEntity<User> updateProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        String userId = getAuthenticatedUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }
        if (request.getThemePreference() != null) {
            user.setThemePreference(request.getThemePreference().toUpperCase());
        }
        if (request.getLanguagePreference() != null) {
            user.setLanguagePreference(request.getLanguagePreference());
        }
        if (request.getTimezone() != null) {
            user.setTimezone(request.getTimezone());
        }

        User updatedUser = userRepository.save(user);
        updatedUser.setPassword(null);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/password")
    public ResponseEntity<?> updatePassword(@Valid @RequestBody PasswordUpdateRequest request) {
        String userId = getAuthenticatedUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BadRequestException("Current password does not match.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password updated successfully.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/achievements")
    public ResponseEntity<List<Achievement>> getAchievements() {
        String userId = getAuthenticatedUserId();
        List<Achievement> achievements = achievementService.getUserAchievements(userId);
        return ResponseEntity.ok(achievements);
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportData() {
        String userId = getAuthenticatedUserId();
        List<Habit> habits = habitService.getUserHabits(userId, null, null, "name");

        StringBuilder csvBuilder = new StringBuilder();
        csvBuilder.append("Habit Name,Category,Goal,Unit,Reminder,Streak,Longest Streak,Total Completions,Archived\n");

        for (Habit habit : habits) {
            csvBuilder.append(String.format("\"%s\",\"%s\",%d,\"%s\",\"%s\",%d,%d,%d,%s\n",
                    habit.getName().replace("\"", "\"\""),
                    habit.getCategory(),
                    habit.getGoal(),
                    habit.getGoalUnit(),
                    habit.getReminderTime() != null ? habit.getReminderTime() : "None",
                    habit.getCurrentStreak(),
                    habit.getLongestStreak(),
                    habit.getTotalCompletions(),
                    habit.isArchived() ? "Yes" : "No"
            ));
        }

        byte[] csvData = csvBuilder.toString().getBytes();
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=habit_flow_export.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvData);
    }
}
