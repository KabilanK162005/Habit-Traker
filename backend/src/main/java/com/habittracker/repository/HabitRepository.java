package com.habittracker.repository;

import com.habittracker.entity.Habit;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HabitRepository extends MongoRepository<Habit, String> {
    List<Habit> findByUserId(String userId);
    List<Habit> findByUserIdAndIsArchived(String userId, boolean isArchived);
    List<Habit> findByUserIdAndCategoryAndIsArchived(String userId, String category, boolean isArchived);
}
