package com.habittracker.repository;

import com.habittracker.entity.Analytics;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AnalyticsRepository extends MongoRepository<Analytics, String> {
    Optional<Analytics> findByUserId(String userId);
}
