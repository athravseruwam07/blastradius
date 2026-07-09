package com.blastradius.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "incidents")
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "service_id")
    private MonitoredService service;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Severity severity;

    @Column
    private String description;

    /** Optional link back to the deploy that caused this incident (feedback loop). */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "deploy_id")
    private Deploy linkedDeploy;

    protected Incident() {
        // for JPA
    }

    public Incident(MonitoredService service, LocalDateTime timestamp, Severity severity,
                    String description, Deploy linkedDeploy) {
        this.service = service;
        this.timestamp = timestamp;
        this.severity = severity;
        this.description = description;
        this.linkedDeploy = linkedDeploy;
    }

    public Long getId() {
        return id;
    }

    public MonitoredService getService() {
        return service;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public Severity getSeverity() {
        return severity;
    }

    public String getDescription() {
        return description;
    }

    public Deploy getLinkedDeploy() {
        return linkedDeploy;
    }
}
