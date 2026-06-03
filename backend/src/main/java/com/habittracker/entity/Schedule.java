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

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "schedules")
public class Schedule {
    @Id
    private String id;

    @Indexed
    private String userId;

    private String title;
    private String description;
    private String type; // HABIT, MEETING, STUDY_SESSION, WORKOUT, PERSONAL_TASK
    
    @Indexed
    private Instant startTime;
    private Instant endTime;
    
    private boolean allDay;
    private String color;
    
    @JsonProperty("isCompleted")
    @Builder.Default
    private boolean isCompleted = false;
    
    private String habitId; // Optional link to a specific habit

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
