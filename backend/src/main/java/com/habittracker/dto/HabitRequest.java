package com.habittracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class HabitRequest {
    @NotBlank
    private String name;
    
    private String description;
    
    @NotBlank
    private String category;
    
    @NotBlank
    private String color;
    
    @NotBlank
    private String icon;
    
    @NotBlank
    private String frequency; // DAILY, WEEKLY, MONTHLY, CUSTOM
    
    private List<String> customDays;
    
    @NotNull
    private Integer goal;
    
    @NotBlank
    private String goalUnit;
    
    private String reminderTime; // "HH:mm"
    
    private LocalDate startDate;
    
    private LocalDate endDate;
}
