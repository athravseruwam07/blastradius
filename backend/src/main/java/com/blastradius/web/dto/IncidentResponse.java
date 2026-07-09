package com.blastradius.web.dto;

import com.blastradius.domain.Severity;

import java.time.LocalDateTime;

public record IncidentResponse(
        Long id,
        String serviceName,
        LocalDateTime timestamp,
        Severity severity,
        String description,
        Long linkedDeployId) {
}
