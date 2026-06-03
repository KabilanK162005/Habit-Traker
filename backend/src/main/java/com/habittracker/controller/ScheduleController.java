package com.habittracker.controller;

import com.habittracker.dto.ScheduleRequest;
import com.habittracker.entity.Schedule;
import com.habittracker.security.UserDetailsImpl;
import com.habittracker.service.ScheduleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    @Autowired
    private ScheduleService scheduleService;

    private String getAuthenticatedUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userDetails.getId();
    }

    @GetMapping
    public ResponseEntity<List<Schedule>> getEvents(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        String userId = getAuthenticatedUserId();
        Instant start = Instant.parse(startDate);
        Instant end = Instant.parse(endDate);
        List<Schedule> events = scheduleService.getEventsInRange(start, end, userId);
        return ResponseEntity.ok(events);
    }

    @PostMapping
    public ResponseEntity<Schedule> createEvent(@Valid @RequestBody ScheduleRequest request) {
        String userId = getAuthenticatedUserId();
        Schedule event = scheduleService.createEvent(request, userId);
        return new ResponseEntity<>(event, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Schedule> updateEvent(
            @PathVariable String id,
            @Valid @RequestBody ScheduleRequest request) {
        String userId = getAuthenticatedUserId();
        Schedule event = scheduleService.updateEvent(id, request, userId);
        return ResponseEntity.ok(event);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable String id) {
        String userId = getAuthenticatedUserId();
        scheduleService.deleteEvent(id, userId);
        return ResponseEntity.noContent().build();
    }
}
