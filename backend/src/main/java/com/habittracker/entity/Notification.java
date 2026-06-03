package com.habittracker.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "notifications")
@CompoundIndex(name = "schedule_reminder_idx", def = "{'scheduleId': 1, 'reminderKey': 1}")
public class Notification {
    @Id
    private String id;

    @Indexed
    private String userId;

    private String title;
    private String message;
    private String type; // REMINDER, DAILY_SUMMARY, WEEKLY_SUMMARY, STREAK_WARNING, ACHIEVEMENT, EVENT_REMINDER
    
    @Builder.Default
    private boolean isRead = false;

    private String scheduleId;
    private String reminderKey;
    private Instant scheduledFor;

    @CreatedDate
    private Instant createdAt;
}
