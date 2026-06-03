package com.habittracker.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "habit_logs")
@CompoundIndex(name = "habit_date_idx", def = "{'habitId': 1, 'date': 1}", unique = true)
public class HabitLog {
    @Id
    private String id;

    @Indexed
    private String habitId;

    @Indexed
    private String userId;

    private LocalDate date;
    
    private String status; // COMPLETED, SKIPPED, PENDING
    
    private Integer loggedValue; // Numerical status (e.g. 5 glasses, 20 minutes)

    @CreatedDate
    private Instant createdAt;
}
