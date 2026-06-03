package com.habittracker.repository;

import com.habittracker.entity.Schedule;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface ScheduleRepository extends MongoRepository<Schedule, String> {
    List<Schedule> findByUserId(String userId);
    List<Schedule> findByUserIdAndStartTimeBetweenOrderByStartTimeAsc(String userId, Instant start, Instant end);
    List<Schedule> findByHabitId(String habitId);
    List<Schedule> findByStartTimeBetween(Instant start, Instant end);
}
