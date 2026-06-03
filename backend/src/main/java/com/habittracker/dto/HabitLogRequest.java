package com.habittracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class HabitLogRequest {
    @NotNull
    private LocalDate date;

    @NotBlank
    private String status; // COMPLETED, SKIPPED, PENDING

    private Integer loggedValue;
}
