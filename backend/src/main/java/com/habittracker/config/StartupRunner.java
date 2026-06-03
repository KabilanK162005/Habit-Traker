package com.habittracker.config;

import com.habittracker.service.ReminderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class StartupRunner implements CommandLineRunner {

    @Autowired
    private ReminderService reminderService;

    @Override
    public void run(String... args) {
        reminderService.checkMissedReminders();
    }
}
