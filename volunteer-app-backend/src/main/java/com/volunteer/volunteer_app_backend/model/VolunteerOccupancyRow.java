package com.volunteer.volunteer_app_backend.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class VolunteerOccupancyRow {

    private final Long volunteerId;
    private final String fullName;
    private final String email;
    private final int totalTasks;
    private final int activeTasks;
    private final int completedTasks;
}