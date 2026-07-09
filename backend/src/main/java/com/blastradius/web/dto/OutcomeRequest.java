package com.blastradius.web.dto;

import com.blastradius.domain.DeployStatus;
import com.blastradius.domain.Severity;
import jakarta.validation.constraints.NotNull;

/**
 * Records what actually happened to a deploy. If {@code incidentSeverity} is present,
 * an Incident linked to this deploy is created (feedback loop).
 */
public record OutcomeRequest(
        @NotNull DeployStatus status,
        Severity incidentSeverity,
        String incidentDescription) {
}
