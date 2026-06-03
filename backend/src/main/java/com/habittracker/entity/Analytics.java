package com.habittracker.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "analytics")
public class Analytics {
    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private int totalHabits;
    private int activeHabits;
    private int completedHabits;
    private int missedHabits;
    private double successRate;
    private int totalStreak;
    private int longestStreak;
    
    private Instant lastUpdated;
}
