package com.habittracker.controller;

import com.habittracker.dto.HabitLogRequest;
import com.habittracker.dto.HabitRequest;
import com.habittracker.entity.Habit;
import com.habittracker.entity.HabitLog;
import com.habittracker.security.UserDetailsImpl;
import com.habittracker.service.HabitService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/habits")
public class HabitController {

    @Autowired
    private HabitService habitService;

    private String getAuthenticatedUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userDetails.getId();
    }

    @GetMapping
    public ResponseEntity<List<Habit>> getHabits(
            @RequestParam(required = false) Boolean isArchived,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String sortBy) {
        String userId = getAuthenticatedUserId();
        List<Habit> habits = habitService.getUserHabits(userId, isArchived, category, sortBy);
        return ResponseEntity.ok(habits);
    }

    @PostMapping
    public ResponseEntity<Habit> createHabit(@Valid @RequestBody HabitRequest request) {
        String userId = getAuthenticatedUserId();
        Habit habit = habitService.createHabit(request, userId);
        return new ResponseEntity<>(habit, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Habit> getHabitById(@PathVariable String id) {
        String userId = getAuthenticatedUserId();
        Habit habit = habitService.getHabitById(id, userId);
        return ResponseEntity.ok(habit);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Habit> updateHabit(@PathVariable String id, @Valid @RequestBody HabitRequest request) {
        String userId = getAuthenticatedUserId();
        Habit habit = habitService.updateHabit(id, request, userId);
        return ResponseEntity.ok(habit);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHabit(@PathVariable String id) {
        String userId = getAuthenticatedUserId();
        habitService.deleteHabit(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/archive")
    public ResponseEntity<Habit> archiveHabit(@PathVariable String id) {
        String userId = getAuthenticatedUserId();
        Habit habit = habitService.archiveHabit(id, userId);
        return ResponseEntity.ok(habit);
    }

    @PostMapping("/{id}/log")
    public ResponseEntity<HabitLog> logProgress(@PathVariable String id, @Valid @RequestBody HabitLogRequest request) {
        String userId = getAuthenticatedUserId();
        HabitLog log = habitService.logHabitProgress(id, request, userId);
        return ResponseEntity.ok(log);
    }

    @GetMapping("/{id}/logs")
    public ResponseEntity<List<HabitLog>> getHabitLogs(@PathVariable String id) {
        String userId = getAuthenticatedUserId();
        List<HabitLog> logs = habitService.getHabitLogs(id, userId);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/logs/date/{date}")
    public ResponseEntity<List<HabitLog>> getLogsForDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        String userId = getAuthenticatedUserId();
        List<HabitLog> logs = habitService.getLogsForDate(date, userId);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/logs/range")
    public ResponseEntity<List<HabitLog>> getLogsForRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        String userId = getAuthenticatedUserId();
        List<HabitLog> logs = habitService.getLogsForDateRange(startDate, endDate, userId);
        return ResponseEntity.ok(logs);
    }
}
