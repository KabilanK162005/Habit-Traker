package com.habittracker.service;

import com.habittracker.entity.Habit;
import com.habittracker.entity.HabitLog;
import com.habittracker.repository.HabitLogRepository;
import com.habittracker.repository.HabitRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private static final Logger log = LoggerFactory.getLogger(DashboardService.class);

    @Autowired
    private HabitRepository habitRepository;

    @Autowired
    private HabitLogRepository habitLogRepository;

    public Map<String, Object> getDashboardMetrics(String userId) {
        try {
            List<Habit> habits = safeList(habitRepository.findByUserId(userId));
            List<Habit> activeHabits = habits.stream().filter(h -> h != null && !h.isArchived()).collect(Collectors.toList());

            int totalHabits = habits.size();
            int activeCount = activeHabits.size();
            int maxStreak = 0;

            for (Habit habit : habits) {
                if (habit != null) {
                    maxStreak = Math.max(maxStreak, habit.getCurrentStreak());
                }
            }

            LocalDate monthStart = LocalDate.now().withDayOfMonth(1);
            LocalDate monthEnd = LocalDate.now();
            List<HabitLog> monthLogs = safeList(habitLogRepository.findByUserIdAndDateBetween(userId, monthStart, monthEnd));

            long completedCount = monthLogs.stream()
                    .filter(l -> l != null && "COMPLETED".equals(l.getStatus()))
                    .count();

            long daysElapsed = monthEnd.getDayOfMonth();
            long totalExpected = (long) activeCount * daysElapsed;

            double successRate = 0.0;
            if (totalExpected > 0) {
                successRate = ((double) completedCount / totalExpected) * 100.0;
            }

            Map<String, Object> metrics = new HashMap<>();
            metrics.put("totalHabits", totalHabits);
            metrics.put("activeHabits", activeCount);
            metrics.put("completedHabits", completedCount);
            metrics.put("successRate", Math.round(successRate * 10.0) / 10.0);
            metrics.put("totalStreak", maxStreak);

            return metrics;
        } catch (Exception e) {
            log.error("Error computing dashboard metrics for user {}: {}", userId, e.getMessage(), e);
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("totalHabits", 0);
            fallback.put("activeHabits", 0);
            fallback.put("completedHabits", 0);
            fallback.put("successRate", 0.0);
            fallback.put("totalStreak", 0);
            return fallback;
        }
    }

    public Map<String, Object> getAnalyticsData(String userId) {
        try {
            List<Habit> allHabits = safeList(habitRepository.findByUserId(userId));
            List<Habit> activeHabits = allHabits.stream()
                    .filter(h -> h != null && !h.isArchived())
                    .collect(Collectors.toList());

            List<Map<String, Object>> weeklyProgress = buildWeeklyProgress(activeHabits, userId);
            List<Map<String, Object>> consistencyTrend = buildConsistencyTrend(activeHabits, userId);

            LocalDate today = LocalDate.now();
            LocalDate monthStart = today.withDayOfMonth(1);
            LocalDate monthEnd = today.with(TemporalAdjusters.lastDayOfMonth());
            List<Map<String, Object>> heatmapData = buildHeatmap(userId, monthStart, monthEnd);

            Map<String, Object> analytics = new HashMap<>();
            analytics.put("weeklyProgress", weeklyProgress);
            analytics.put("consistencyTrend", consistencyTrend);
            analytics.put("heatmapData", heatmapData);
            analytics.put("currentMonth", monthStart.getMonthValue());
            analytics.put("currentYear", monthStart.getYear());

            return analytics;
        } catch (Exception e) {
            log.error("Error computing analytics for user {}: {}", userId, e.getMessage(), e);
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("weeklyProgress", Collections.emptyList());
            fallback.put("consistencyTrend", Collections.emptyList());
            fallback.put("heatmapData", Collections.emptyList());
            return fallback;
        }
    }

    public Map<String, Object> getWeeklyProgressData(String userId, String weekStartStr) {
        try {
            LocalDate monday = LocalDate.parse(weekStartStr);
            List<Habit> allHabits = safeList(habitRepository.findByUserId(userId));
            List<Habit> activeHabits = allHabits.stream()
                    .filter(h -> h != null && !h.isArchived())
                    .collect(Collectors.toList());

            List<Map<String, Object>> weeklyProgress = buildWeeklyProgress(activeHabits, userId, monday);

            Map<String, Object> result = new HashMap<>();
            result.put("weeklyProgress", weeklyProgress);
            result.put("weekStart", monday.toString());
            result.put("weekEnd", monday.plusDays(6).toString());
            return result;
        } catch (Exception e) {
            log.error("Error computing weekly progress for user {} week {}: {}", userId, weekStartStr, e.getMessage(), e);
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("weeklyProgress", Collections.emptyList());
            fallback.put("weekStart", weekStartStr);
            return fallback;
        }
    }

    public Map<String, Object> getHeatmapData(String userId, int year, int month) {
        try {
            LocalDate monthStart = LocalDate.of(year, month, 1);
            LocalDate monthEnd = monthStart.with(TemporalAdjusters.lastDayOfMonth());
            List<Map<String, Object>> heatmapData = buildHeatmap(userId, monthStart, monthEnd);

            Map<String, Object> result = new HashMap<>();
            result.put("heatmapData", heatmapData);
            result.put("month", month);
            result.put("year", year);
            return result;
        } catch (Exception e) {
            log.error("Error computing heatmap for user {} year {} month {}: {}", userId, year, month, e.getMessage(), e);
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("heatmapData", Collections.emptyList());
            fallback.put("month", month);
            fallback.put("year", year);
            return fallback;
        }
    }

    // ── Private Helpers ──

    private List<Map<String, Object>> buildWeeklyProgress(List<Habit> activeHabits, String userId) {
        LocalDate today = LocalDate.now();
        LocalDate monday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        return buildWeeklyProgress(activeHabits, userId, monday);
    }

    private List<Map<String, Object>> buildWeeklyProgress(List<Habit> activeHabits, String userId, LocalDate monday) {
        List<Map<String, Object>> weeklyProgress = new ArrayList<>();

        for (int i = 0; i < 7; i++) {
            LocalDate date = monday.plusDays(i);

            long activeOnDay = activeHabits.stream()
                    .filter(h -> h.getStartDate() != null && !h.getStartDate().isAfter(date))
                    .count();

            List<HabitLog> dailyLogs = safeList(habitLogRepository.findByUserIdAndDate(userId, date));
            long completed = dailyLogs.stream()
                    .filter(l -> l != null && "COMPLETED".equals(l.getStatus()))
                    .count();

            double rate = 0.0;
            if (activeOnDay > 0) {
                rate = ((double) completed / activeOnDay) * 100.0;
            }

            String dayName = date.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);

            Map<String, Object> dayData = new HashMap<>();
            dayData.put("day", dayName);
            dayData.put("date", date.toString());
            dayData.put("rate", Math.round(rate));
            dayData.put("completed", completed);
            dayData.put("total", activeOnDay);
            weeklyProgress.add(dayData);
        }

        return weeklyProgress;
    }

    private List<Map<String, Object>> buildConsistencyTrend(List<Habit> activeHabits, String userId) {
        List<Map<String, Object>> trend = new ArrayList<>();
        LocalDate today = LocalDate.now();
        LocalDate monthStart = today.withDayOfMonth(1);
        LocalDate monthEnd = today;

        LocalDate cursor = monthStart;
        int weekIndex = 1;

        while (!cursor.isAfter(monthEnd)) {
            LocalDate weekMon = cursor.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            if (weekMon.isBefore(monthStart)) {
                weekMon = monthStart;
            }
            LocalDate weekSun = weekMon.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
            if (weekSun.isAfter(monthEnd)) {
                weekSun = monthEnd;
            }

            List<HabitLog> weekLogs = safeList(habitLogRepository.findByUserIdAndDateBetween(userId, weekMon, weekSun));
            long completed = weekLogs.stream()
                    .filter(l -> l != null && "COMPLETED".equals(l.getStatus()))
                    .count();

            long daysInRange = weekMon.datesUntil(weekSun.plusDays(1)).count();
            long totalPossible = (long) activeHabits.size() * daysInRange;

            double rate = 0.0;
            if (totalPossible > 0) {
                rate = ((double) completed / totalPossible) * 100.0;
            }

            Map<String, Object> weekData = new HashMap<>();
            weekData.put("week", "Week " + weekIndex);
            weekData.put("rate", Math.round(rate));
            weekData.put("completed", (int) completed);
            weekData.put("total", (int) totalPossible);
            trend.add(weekData);

            cursor = weekSun.plusDays(1);
            weekIndex++;
        }

        return trend;
    }

    private List<Map<String, Object>> buildHeatmap(String userId, LocalDate start, LocalDate end) {
        List<HabitLog> logs = safeList(habitLogRepository.findByUserIdAndDateBetween(userId, start, end));

        Map<LocalDate, Long> completedByDate = logs.stream()
                .filter(l -> l != null && "COMPLETED".equals(l.getStatus()) && l.getDate() != null)
                .collect(Collectors.groupingBy(HabitLog::getDate, Collectors.counting()));

        List<Map<String, Object>> heatmapData = new ArrayList<>();
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            long count = completedByDate.getOrDefault(date, 0L);
            int intensity = getHeatmapIntensity(count);
            Map<String, Object> item = new HashMap<>();
            item.put("date", date.toString());
            item.put("day", date.getDayOfMonth());
            item.put("count", count);
            item.put("intensity", intensity);
            heatmapData.add(item);
        }

        return heatmapData;
    }

    private int getHeatmapIntensity(long count) {
        if (count == 0) return 0;
        if (count <= 2) return 1;
        if (count <= 4) return 2;
        if (count <= 7) return 3;
        return 4;
    }

    private <T> List<T> safeList(List<T> list) {
        return list != null ? list : Collections.emptyList();
    }
}
