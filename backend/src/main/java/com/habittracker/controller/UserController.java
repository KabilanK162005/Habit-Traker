package com.habittracker.controller;

import com.habittracker.security.UserDetailsImpl;
import com.habittracker.service.HabitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private HabitService habitService;

    private String getAuthenticatedUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userDetails.getId();
    }

    @PostMapping("/reset-progress")
    public ResponseEntity<Map<String, String>> resetProgress() {
        String userId = getAuthenticatedUserId();
        habitService.resetUserProgress(userId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Progress reset successfully. Start your journey again from today.");
        return ResponseEntity.ok(response);
    }
}
