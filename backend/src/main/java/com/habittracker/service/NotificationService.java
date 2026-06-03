package com.habittracker.service;

import com.habittracker.entity.Notification;
import com.habittracker.exception.ResourceNotFoundException;
import com.habittracker.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public Notification createNotification(String userId, String title, String message, String type) {
        return createNotification(userId, title, message, type, null, null, Instant.now());
    }

    public Notification createNotification(String userId, String title, String message, String type,
                                            String scheduleId, String reminderKey, Instant scheduledFor) {
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .scheduleId(scheduleId)
                .reminderKey(reminderKey)
                .scheduledFor(scheduledFor)
                .createdAt(Instant.now())
                .build();
        return notificationRepository.save(notification);
    }


    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findActiveByUserId(userId, Instant.now());
    }

    public List<Notification> getUnreadNotifications(String userId) {
        return notificationRepository.findActiveByUserIdAndIsRead(userId, false, Instant.now());
    }

    public Notification markAsRead(String id, String userId) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        
        if (!notification.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Notification does not belong to this user.");
        }

        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findActiveByUserIdAndIsRead(userId, false, Instant.now());
        for (Notification notification : unread) {
            notification.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }
}
