package com.habittracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;

@Data
public class ScheduleRequest {
    @NotBlank
    private String title;
    
    @NotNull
    private Instant startTime;
    
    @NotNull
    private Instant endTime;

    private Boolean isCompleted;
}
