package com.blastradius.scoring;

import java.util.List;

/** Final engine output: total score, band, and per-factor explanation. */
public record ScoringResult(int score, RiskLevel riskLevel, List<FactorScore> breakdown) {
}
