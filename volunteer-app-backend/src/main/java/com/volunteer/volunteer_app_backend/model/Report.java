package com.volunteer.volunteer_app_backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "reports")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "birt_template")
    private String birtTemplate;

    @Column(columnDefinition = "TEXT")
    private String description;
}
