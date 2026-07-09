package com.blastradius.web.dto;

import com.blastradius.domain.DeployStatus;
import com.blastradius.scoring.FactorScore;
import com.blastradius.scoring.RiskLevel;

import java.time.LocalDateTime;
import java.util.List;

public record DeployResponse(
        Long id,
        String serviceName,
        LocalDateTime timestamp,
        int diffSize,
        double testProdRatio,
        int riskScore,
        RiskLevel riskLevel,
        DeployStatus status,
        List<FactorScore> breakdown) {
}
