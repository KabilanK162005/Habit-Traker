package com.habittracker.service;

import com.habittracker.dto.HabitLogRequest;
import com.habittracker.dto.HabitRequest;
import com.habittracker.entity.Habit;
import com.habittracker.entity.HabitLog;
import com.habittracker.exception.BadRequestException;
import com.habittracker.exception.ResourceNotFoundException;
import com.habittracker.repository.HabitLogRepository;
import com.habittracker.repository.HabitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class HabitService {

    @Autowired
    private HabitRepository habitRepository;

    @Autowired
    private HabitLogRepository habitLogRepository;

    @Autowired
    private AchievementService achievementService;

    public Habit createHabit(HabitRequest request, String userId) {
        LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : LocalDate.now();
        Habit habit = Habit.builder()
                .userId(userId)
                .name(request.getName())
                .description(request.getDescription())
                .category(request.getCategory().toUpperCase())
                .color(request.getColor())
                .icon(request.getIcon())
                .frequency(request.getFrequency().toUpperCase())
                .customDays(request.getCustomDays() != null ? request.getCustomDays() : new ArrayList<>())
                .goal(request.getGoal())
                .goalUnit(request.getGoalUnit())
                .reminderTime(request.getReminderTime())
                .startDate(startDate)
                .endDate(request.getEndDate())
                .isArchived(false)
                .currentStreak(0)
                .longestStreak(0)
                .totalCompletions(0)
                .build();

        return habitRepository.save(habit);
    }

    public Habit updateHabit(String id, HabitRequest request, String userId) {
        Habit habit = getHabitById(id, userId);

        habit.setName(request.getName());
        habit.setDescription(request.getDescription());
        habit.setCategory(request.getCategory().toUpperCase());
        habit.setColor(request.getColor());
        habit.setIcon(request.getIcon());
        habit.setFrequency(request.getFrequency().toUpperCase());
        habit.setCustomDays(request.getCustomDays() != null ? request.getCustomDays() : new ArrayList<>());
        habit.setGoal(request.getGoal());
        habit.setGoalUnit(request.getGoalUnit());
        habit.setReminderTime(request.getReminderTime());
        habit.setStartDate(request.getStartDate());
        habit.setEndDate(request.getEndDate());

        return habitRepository.save(habit);
    }

    public void deleteHabit(String id, String userId) {
        Habit habit = getHabitById(id, userId);
        habitRepository.delete(habit);
        habitLogRepository.deleteByHabitId(id);
    }

    public Habit getHabitById(String id, String userId) {
        Habit habit = habitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found with id: " + id));

        if (!habit.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Habit does not belong to this user.");
        }

        return habit;
    }

    public List<Habit> getUserHabits(String userId, Boolean isArchived, String category, String sortBy) {
        boolean archivedVal = isArchived != null ? isArchived : false;
        List<Habit> habits;

        if (category != null && !category.isBlank()) {
            habits = habitRepository.findByUserIdAndCategoryAndIsArchived(userId, category.toUpperCase(), archivedVal);
        } else {
            habits = habitRepository.findByUserIdAndIsArchived(userId, archivedVal);
        }

        // Sorting logic
        if (sortBy != null) {
            switch (sortBy.toLowerCase()) {
                case "name":
                    habits.sort(Comparator.comparing(Habit::getName));
                    break;
                case "streak":
                    habits.sort(Comparator.comparing(Habit::getCurrentStreak).reversed());
                    break;
                case "oldest":
                    habits.sort(Comparator.comparing(Habit::getCreatedAt));
                    break;
                case "newest":
                default:
                    habits.sort(Comparator.comparing(Habit::getCreatedAt).reversed());
                    break;
            }
        }

        return habits;
    }

    public Habit archiveHabit(String id, String userId) {
        Habit habit = getHabitById(id, userId);
        habit.setArchived(!habit.isArchived());
        return habitRepository.save(habit);
    }

    public HabitLog logHabitProgress(String id, HabitLogRequest request, String userId) {
        Habit habit = getHabitById(id, userId);
        
        Optional<HabitLog> existingLogOpt = habitLogRepository.findByHabitIdAndDate(id, request.getDate());
        HabitLog log;

        if (existingLogOpt.isPresent()) {
            log = existingLogOpt.get();
            log.setStatus(request.getStatus().toUpperCase());
            log.setLoggedValue(request.getLoggedValue() != null ? request.getLoggedValue() : request.getLoggedValue());
        } else {
            log = HabitLog.builder()
                    .habitId(id)
                    .userId(userId)
                    .date(request.getDate())
                    .status(request.getStatus().toUpperCase())
                    .loggedValue(request.getLoggedValue())
                    .build();
        }

        HabitLog savedLog = habitLogRepository.save(log);

        // Recalculate Streaks and Total Completions
        recalculateHabitMetrics(habit);
        
        // Check gamification badges
        achievementService.checkAndUnlockAchievements(userId);

        return savedLog;
    }

    public List<HabitLog> getHabitLogs(String id, String userId) {
        getHabitById(id, userId); // check ownership
        return habitLogRepository.findByHabitIdOrderByDateAsc(id);
    }

    public List<HabitLog> getLogsForDate(LocalDate date, String userId) {
        return habitLogRepository.findByUserIdAndDate(userId, date);
    }

    public List<HabitLog> getLogsForDateRange(LocalDate start, LocalDate end, String userId) {
        return habitLogRepository.findByUserIdAndDateBetween(userId, start, end);
    }

    public void resetUserProgress(String userId) {
        List<Habit> userHabits = habitRepository.findByUserId(userId);

        habitLogRepository.deleteByUserId(userId);

        for (Habit habit : userHabits) {
            habit.setCurrentStreak(0);
            habit.setLongestStreak(0);
            habit.setTotalCompletions(0);
        }
        if (!userHabits.isEmpty()) {
            habitRepository.saveAll(userHabits);
        }
    }

    private void recalculateHabitMetrics(Habit habit) {
        List<HabitLog> logs = habitLogRepository.findByHabitIdOrderByDateAsc(habit.getId());

        int totalCompletions = 0;
        int currentStreak = 0;
        int longestStreak = 0;

        // Group status by date
        Map<LocalDate, String> logMap = logs.stream()
                .collect(Collectors.toMap(HabitLog::getDate, HabitLog::getStatus));

        if (!logMap.isEmpty()) {
            // Count total COMPLETED logs
            totalCompletions = (int) logs.stream()
                    .filter(log -> "COMPLETED".equals(log.getStatus()))
                    .count();

            // Consecutive-day streak calculation logic
            LocalDate today = LocalDate.now();
            LocalDate cursor = today;
            
            // First, find current active streak working backwards from today
            // If today is completed or pending (not yet missed), let's check yesterday
            boolean streakAlive = true;
            
            // Let's count current streak
            int activeStreak = 0;
            LocalDate checkDate = today;
            
            // If today is empty or skipped, check yesterday to start streak. 
            // If today is COMPLETED, streak is active.
            if ("COMPLETED".equals(logMap.get(checkDate))) {
                activeStreak++;
                checkDate = checkDate.minusDays(1);
            } else if ("SKIPPED".equals(logMap.get(checkDate))) {
                checkDate = checkDate.minusDays(1);
            } else {
                // If not logged yet today, the streak is still alive from yesterday
                checkDate = checkDate.minusDays(1);
            }

            while (streakAlive) {
                String status = logMap.get(checkDate);
                if ("COMPLETED".equals(status)) {
                    activeStreak++;
                    checkDate = checkDate.minusDays(1);
                } else if ("SKIPPED".equals(status)) {
                    // Ignored - does not break streak
                    checkDate = checkDate.minusDays(1);
                } else {
                    // Missed or not logged - breaks streak
                    streakAlive = false;
                }
            }
            currentStreak = activeStreak;

            // Longest streak calculation
            int tempStreak = 0;
            // Sort dates
            List<LocalDate> sortedDates = logMap.keySet().stream().sorted().collect(Collectors.toList());
            if (!sortedDates.isEmpty()) {
                LocalDate prevDate = null;
                for (LocalDate date : sortedDates) {
                    String status = logMap.get(date);
                    if ("COMPLETED".equals(status)) {
                        if (prevDate == null || date.minusDays(1).equals(prevDate)) {
                            tempStreak++;
                        } else {
                            // Checked if missing days were skipped
                            boolean allSkipped = true;
                            LocalDate fillDate = prevDate.plusDays(1);
                            while (fillDate.isBefore(date)) {
                                if (!"SKIPPED".equals(logMap.get(fillDate))) {
                                    allSkipped = false;
                                    break;
                                }
                                fillDate = fillDate.plusDays(1);
                            }
                            if (allSkipped) {
                                tempStreak++;
                            } else {
                                longestStreak = Math.max(longestStreak, tempStreak);
                                tempStreak = 1;
                            }
                        }
                        prevDate = date;
                    } else if ("SKIPPED".equals(status)) {
                        // Skip doesn't affect long streak counting logic
                        prevDate = date;
                    }
                }
                longestStreak = Math.max(longestStreak, tempStreak);
            }
        }

        habit.setTotalCompletions(totalCompletions);
        habit.setCurrentStreak(currentStreak);
        habit.setLongestStreak(Math.max(longestStreak, currentStreak));
        habitRepository.save(habit);
    }
}
