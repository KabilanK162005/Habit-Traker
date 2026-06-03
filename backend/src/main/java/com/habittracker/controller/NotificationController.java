package com.habittracker.controller;

import com.habittracker.entity.Notification;
import com.habittracker.security.UserDetailsImpl;
import com.habittracker.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    private String getAuthenticatedUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userDetails.getId();
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(@RequestParam(required = false) Boolean unreadOnly) {
        String userId = getAuthenticatedUserId();
        List<Notification> notifications;
        if (unreadOnly != null && unreadOnly) {
            notifications = notificationService.getUnreadNotifications(userId);
        } else {
            notifications = notificationService.getUserNotifications(userId);
        }
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable String id) {
        String userId = getAuthenticatedUserId();
        Notification notification = notificationService.markAsRead(id, userId);
        return ResponseEntity.ok(notification);
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead() {
        String userId = getAuthenticatedUserId();
        notificationService.markAllAsRead(userId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "All notifications marked as read.");
        return ResponseEntity.ok(response);
    }
}
