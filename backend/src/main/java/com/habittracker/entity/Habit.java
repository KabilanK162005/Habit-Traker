package com.habittracker.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "habits")
public class Habit {
    @Id
    private String id;

    @Indexed
    private String userId;

    private String name;
    private String description;
    private String category; // FITNESS, READING, MEDITATION, WATER_INTAKE, STUDY, CODING, JOURNAL, SLEEP, DIET
    private String color; // Hex color code
    private String icon; // Icon identifier
    private String frequency; // DAILY, WEEKLY, MONTHLY, CUSTOM
    
    @Builder.Default
    private List<String> customDays = new ArrayList<>(); // e.g. ["MON", "WED", "FRI"]
    
    private Integer goal; // e.g. 20
    private String goalUnit; // e.g. "minutes", "glasses", "pages"
    private String reminderTime; // "HH:mm"
    
    private LocalDate startDate;
    private LocalDate endDate;
    
    @Builder.Default
    private boolean isArchived = false;
    
    @Builder.Default
    private int currentStreak = 0;
    
    @Builder.Default
    private int longestStreak = 0;
    
    @Builder.Default
    private int totalCompletions = 0;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
