package com.habittracker.repository;

import com.habittracker.entity.Achievement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AchievementRepository extends MongoRepository<Achievement, String> {
    List<Achievement> findByUserId(String userId);
    Optional<Achievement> findByUserIdAndType(String userId, String type);
    boolean existsByUserIdAndType(String userId, String type);
}
