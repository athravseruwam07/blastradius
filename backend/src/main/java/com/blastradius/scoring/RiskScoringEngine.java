package com.blastradius.scoring;

import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

/**
 * Deterministic, rule-based risk scoring engine.
 *
 * Spring injects every {@link RiskFactor} bean in the application context, so the
 * engine never needs to change when a new factor is added — drop in a new
 * {@code @Component implements RiskFactor} class and it participates automatically.
 *
 * The final score is the sum of factor contributions, clamped to 0–100. Factor
 * max-points are budgeted to sum to exactly 100 (25+20+15+15+15+10), so the clamp
 * is a safety net rather than an expected code path.
 */
@Component
public class RiskScoringEngine {

    public static final int MAX_SCORE = 100;

    private final List<RiskFactor> factors;

    public RiskScoringEngine(List<RiskFactor> factors) {
        // Stable ordering keeps breakdowns deterministic regardless of bean discovery order.
        this.factors = factors.stream()
                .sorted(Comparator.comparing(RiskFactor::name))
                .toList();
    }

    public ScoringResult score(ScoringContext context) {
        List<FactorScore> breakdown = factors.stream()
                .map(factor -> factor.evaluate(context))
                .toList();
        int total = breakdown.stream().mapToInt(FactorScore::points).sum();
        int clamped = Math.max(0, Math.min(MAX_SCORE, total));
        return new ScoringResult(clamped, RiskLevel.fromScore(clamped), breakdown);
    }

    public List<RiskFactor> getFactors() {
        return factors;
    }
}
