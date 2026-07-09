package com.blastradius.domain;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;

/**
 * A tracked microservice. The spec calls this entity "Service"; the Java class is named
 * MonitoredService to avoid colliding with Spring's @Service annotation, but the JPA
 * entity name and table remain "Service"/"services".
 */
@Entity(name = "Service")
@Table(name = "services")
public class MonitoredService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    /**
     * Business criticality on a 1–10 scale (10 = revenue-critical, e.g. payments).
     * Consumed by CriticalityFactor.
     */
    @Column(nullable = false)
    private int criticalityWeight;

    /**
     * Path prefixes considered sensitive for this service (e.g. /auth/, /payment/).
     * A deploy touching any file under one of these prefixes triggers SensitivePathFactor.
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "service_sensitive_paths", joinColumns = @JoinColumn(name = "service_id"))
    @Column(name = "path_pattern")
    private List<String> sensitivePathPatterns = new ArrayList<>();

    protected MonitoredService() {
        // for JPA
    }

    public MonitoredService(String name, int criticalityWeight, List<String> sensitivePathPatterns) {
        this.name = name;
        this.criticalityWeight = criticalityWeight;
        this.sensitivePathPatterns = new ArrayList<>(sensitivePathPatterns);
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public int getCriticalityWeight() {
        return criticalityWeight;
    }

    public List<String> getSensitivePathPatterns() {
        return sensitivePathPatterns;
    }
}
