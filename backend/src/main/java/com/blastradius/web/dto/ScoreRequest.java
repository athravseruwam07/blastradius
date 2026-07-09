package com.blastradius.web.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Deploy metadata submitted for scoring. {@code timestamp} is optional and defaults
 * to "now" — CI passes the actual deploy time, the manual test form usually omits it.
 */
public record ScoreRequest(
        @NotBlank String serviceName,
        @Min(0) int diffLinesChanged,
        @Min(0) int prodLinesChanged,
        @Min(0) int testLinesChanged,
        List<String> changedPaths,
        LocalDateTime timestamp) {

    public List<String> changedPathsOrEmpty() {
        return changedPaths == null ? List.of() : changedPaths;
    }
}
