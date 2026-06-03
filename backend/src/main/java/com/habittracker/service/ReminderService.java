package com.habittracker.service;

import com.habittracker.entity.Schedule;
import com.habittracker.repository.NotificationRepository;
import com.habittracker.repository.ScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class ReminderService {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    public void generateReminders(Schedule event) {
        Instant start = event.getStartTime();
        Instant end = event.getEndTime();
        String userId = event.getUserId();
        String scheduleId = event.getId();
        String title = event.getTitle();

        // Every 15 minutes: generate reminders from start to end
        Instant cursor = start.truncatedTo(ChronoUnit.MINUTES);
        while (cursor.isBefore(end)) {
            String key = "EVENT_15MIN_" + scheduleId + "_" + cursor.toString();
            if (!notificationRepository.existsByScheduleIdAndReminderKey(scheduleId, key)) {
                notificationService.createNotification(
                    userId,
                    "Event Reminder",
                    "\"" + title + "\" is currently active.",
                    "EVENT_REMINDER",
                    scheduleId,
                    key,
                    cursor
                );
            }
            cursor = cursor.plus(15, ChronoUnit.MINUTES);
            if (cursor.isAfter(end)) break;
        }

        // 1 hour before end
        Instant oneHourBefore = end.minus(1, ChronoUnit.HOURS);
        String oneHourKey = "EVENT_1HR_BEFORE_" + scheduleId;
        if (start.isBefore(oneHourBefore) && !notificationRepository.existsByScheduleIdAndReminderKey(scheduleId, oneHourKey)) {
            notificationService.createNotification(
                userId,
                "Event Ending Soon",
                "\"" + title + "\" will end in 1 hour.",
                "EVENT_REMINDER",
                scheduleId,
                oneHourKey,
                oneHourBefore
            );
        }
    }

    public void generateDailyReminder(Schedule event) {
        String userId = event.getUserId();
        String scheduleId = event.getId();
        String title = event.getTitle();
        String key = "EVENT_DAY_" + scheduleId;

        if (notificationRepository.existsByScheduleIdAndReminderKey(scheduleId, key)) return;

        // Start of the event day
        Instant start = event.getStartTime();
        Instant dayStart = start.truncatedTo(ChronoUnit.DAYS);

        java.time.LocalTime eventTime = java.time.LocalTime.ofInstant(start, java.time.ZoneId.systemDefault());
        String timeStr = eventTime.format(java.time.format.DateTimeFormatter.ofPattern("hh:mm a"));

        notificationService.createNotification(
            userId,
            "Upcoming Event Reminder",
            "\"" + title + "\" is scheduled today at " + timeStr + ".",
            "EVENT_REMINDER",
            scheduleId,
            key,
            dayStart
        );
    }

    public void checkMissedReminders() {
        Instant now = Instant.now();
        List<Schedule> upcomingEvents = scheduleRepository.findByStartTimeBetween(now.minus(1, ChronoUnit.DAYS), now.plus(7, ChronoUnit.DAYS));
        for (Schedule event : upcomingEvents) {
            generateReminders(event);
            generateDailyReminder(event);
        }
    }
}
