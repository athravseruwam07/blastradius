package com.blastradius.web.dto;

import com.blastradius.domain.Severity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record IncidentRequest(
        @NotBlank String serviceName,
        @NotNull Severity severity,
        String description,
        LocalDateTime timestamp,
        Long linkedDeployId) {
}
