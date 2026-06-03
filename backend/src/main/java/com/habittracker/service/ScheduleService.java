package com.habittracker.service;

import com.habittracker.dto.ScheduleRequest;
import com.habittracker.entity.Schedule;
import com.habittracker.exception.ResourceNotFoundException;
import com.habittracker.repository.ScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class ScheduleService {

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private ReminderService reminderService;

    public Schedule createEvent(ScheduleRequest request, String userId) {
        Schedule event = Schedule.builder()
                .userId(userId)
                .title(request.getTitle())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .type("EVENT")
                .color("#6D5DFE")
                .build();

        event = scheduleRepository.save(event);
        reminderService.generateReminders(event);
        reminderService.generateDailyReminder(event);
        return event;
    }

    public Schedule updateEvent(String id, ScheduleRequest request, String userId) {
        Schedule event = getEventById(id, userId);

        event.setTitle(request.getTitle());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());

        if (request.getIsCompleted() != null) {
            event.setCompleted(request.getIsCompleted());
        }

        return scheduleRepository.save(event);
    }

    public void deleteEvent(String id, String userId) {
        Schedule event = getEventById(id, userId);
        scheduleRepository.delete(event);
    }

    public List<Schedule> getEventsInRange(Instant start, Instant end, String userId) {
        return scheduleRepository.findByUserIdAndStartTimeBetweenOrderByStartTimeAsc(userId, start, end);
    }

    public Schedule getEventById(String id, String userId) {
        Schedule event = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

        if (!event.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Event does not belong to this user.");
        }

        return event;
    }
}
