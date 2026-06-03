package com.habittracker.controller;

import com.habittracker.security.UserDetailsImpl;
import com.habittracker.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    private String getAuthenticatedUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userDetails.getId();
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardMetrics() {
        String userId = getAuthenticatedUserId();
        Map<String, Object> metrics = dashboardService.getDashboardMetrics(userId);
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalyticsData() {
        String userId = getAuthenticatedUserId();
        Map<String, Object> analytics = dashboardService.getAnalyticsData(userId);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/analytics/weekly")
    public ResponseEntity<Map<String, Object>> getWeeklyProgress(
            @RequestParam String weekStart) {
        String userId = getAuthenticatedUserId();
        Map<String, Object> data = dashboardService.getWeeklyProgressData(userId, weekStart);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/heatmap")
    public ResponseEntity<Map<String, Object>> getHeatmapData(
            @RequestParam int year,
            @RequestParam int month) {
        String userId = getAuthenticatedUserId();
        Map<String, Object> data = dashboardService.getHeatmapData(userId, year, month);
        return ResponseEntity.ok(data);
    }
}
