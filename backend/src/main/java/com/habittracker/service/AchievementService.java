package com.habittracker.service;

import com.habittracker.entity.Achievement;
import com.habittracker.entity.Habit;
import com.habittracker.repository.AchievementRepository;
import com.habittracker.repository.HabitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class AchievementService {

    @Autowired
    private AchievementRepository achievementRepository;

    @Autowired
    private HabitRepository habitRepository;

    @Autowired
    private NotificationService notificationService;

    public List<Achievement> getUserAchievements(String userId) {
        return achievementRepository.findByUserId(userId);
    }

    public void checkAndUnlockAchievements(String userId) {
        List<Habit> habits = habitRepository.findByUserId(userId);
        
        int totalCompletions = 0;
        int maxStreak = 0;
        int activeHabitsWithStreak5 = 0;

        for (Habit habit : habits) {
            totalCompletions += habit.getTotalCompletions();
            maxStreak = Math.max(maxStreak, habit.getCurrentStreak());
            if (habit.getCurrentStreak() >= 5) {
                activeHabitsWithStreak5++;
            }
        }

        // 1. FIRST_HABIT
        if (totalCompletions >= 1) {
            unlock(userId, "First Steps", "Completed your very first habit log entry! Keep it up!", "FIRST_HABIT");
        }

        // 2. STREAK_7
        if (maxStreak >= 7) {
            unlock(userId, "7-Day Warrior", "Kept up a streak for 7 days straight! Outstanding consistency!", "STREAK_7");
        }

        // 3. STREAK_30
        if (maxStreak >= 30) {
            unlock(userId, "30-Day Legend", "Hit a 30-day streak on a habit. You are now in the elite group!", "STREAK_30");
        }

        // 4. COMPLETIONS_100
        if (totalCompletions >= 100) {
            unlock(userId, "Centurion", "Completed habit goals 100 times! Consistency has become your superpower.", "COMPLETIONS_100");
        }

        // 5. PRODUCTIVITY_MASTER
        if (activeHabitsWithStreak5 >= 5) {
            unlock(userId, "Productivity Master", "Maintained streaks of 5+ days across 5 different habits simultaneously!", "PRODUCTIVITY_MASTER");
        }
    }

    private void unlock(String userId, String title, String description, String type) {
        if (!achievementRepository.existsByUserIdAndType(userId, type)) {
            Achievement achievement = Achievement.builder()
                    .userId(userId)
                    .title(title)
                    .description(description)
                    .type(type)
                    .unlockedAt(Instant.now())
                    .build();
            achievementRepository.save(achievement);

            // Notify user of their achievement
            notificationService.createNotification(
                    userId,
                    "🏆 Achievement Unlocked: " + title,
                    description,
                    "ACHIEVEMENT"
            );
        }
    }
}
