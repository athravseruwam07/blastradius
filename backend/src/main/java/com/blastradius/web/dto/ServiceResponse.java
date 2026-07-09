package com.blastradius.web.dto;

import java.util.List;

public record ServiceResponse(
        Long id,
        String name,
        int criticalityWeight,
        List<String> sensitivePathPatterns) {
}
