package com.habittracker.dto;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String name;
    private String themePreference;
    private String languagePreference;
    private String timezone;
}
