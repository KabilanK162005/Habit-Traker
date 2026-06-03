package com.habittracker.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "achievements")
@CompoundIndex(name = "user_achievement_type_idx", def = "{'userId': 1, 'type': 1}", unique = true)
public class Achievement {
    @Id
    private String id;

    @Indexed
    private String userId;

    private String title;
    private String description;
    private String type; // FIRST_HABIT, STREAK_7, STREAK_30, COMPLETIONS_100, PRODUCTIVITY_MASTER
    
    private Instant unlockedAt;
}
