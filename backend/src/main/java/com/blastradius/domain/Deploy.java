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
@Table(name = "deploys")
public class Deploy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "service_id")
    private MonitoredService service;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    /** Total lines changed in the deploy's diff. */
    @Column(nullable = false)
    private int diffSize;

    /** Ratio of test lines changed to production lines changed (0 when no prod lines changed). */
    @Column(nullable = false)
    private double testProdRatio;

    @Column(nullable = false)
    private int riskScore;

    /** Full factor-by-factor breakdown, serialized as JSON. */
    @Column(nullable = false, columnDefinition = "text")
    private String scoreBreakdown;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeployStatus status = DeployStatus.PENDING;

    protected Deploy() {
        // for JPA
    }

    public Deploy(MonitoredService service, LocalDateTime timestamp, int diffSize,
                  double testProdRatio, int riskScore, String scoreBreakdown) {
        this.service = service;
        this.timestamp = timestamp;
        this.diffSize = diffSize;
        this.testProdRatio = testProdRatio;
        this.riskScore = riskScore;
        this.scoreBreakdown = scoreBreakdown;
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

    public int getDiffSize() {
        return diffSize;
    }

    public double getTestProdRatio() {
        return testProdRatio;
    }

    public int getRiskScore() {
        return riskScore;
    }

    public String getScoreBreakdown() {
        return scoreBreakdown;
    }

    public DeployStatus getStatus() {
        return status;
    }

    public void setStatus(DeployStatus status) {
        this.status = status;
    }
}
