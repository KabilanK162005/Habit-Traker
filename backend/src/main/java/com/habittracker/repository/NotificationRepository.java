package com.habittracker.repository;

import com.habittracker.entity.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    @Query("{'userId': ?0, $or: [{'scheduledFor': null}, {'scheduledFor': {$lte: ?1}}]}")
    List<Notification> findActiveByUserId(String userId, Instant now);

    @Query("{'userId': ?0, 'isRead': ?1, $or: [{'scheduledFor': null}, {'scheduledFor': {$lte: ?2}}]}")
    List<Notification> findActiveByUserIdAndIsRead(String userId, boolean isRead, Instant now);

    long countByUserIdAndIsRead(String userId, boolean isRead);
    boolean existsByScheduleIdAndReminderKey(String scheduleId, String reminderKey);
}
