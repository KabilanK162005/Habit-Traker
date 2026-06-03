package com.habittracker.repository;

import com.habittracker.entity.HabitLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HabitLogRepository extends MongoRepository<HabitLog, String> {
    Optional<HabitLog> findByHabitIdAndDate(String habitId, LocalDate date);
    List<HabitLog> findByUserIdAndDate(String userId, LocalDate date);
    List<HabitLog> findByUserIdAndDateBetween(String userId, LocalDate startDate, LocalDate endDate);
    List<HabitLog> findByHabitId(String habitId);
    void deleteByHabitId(String habitId);
    List<HabitLog> findByHabitIdOrderByDateAsc(String habitId);
    void deleteByUserId(String userId);
}
