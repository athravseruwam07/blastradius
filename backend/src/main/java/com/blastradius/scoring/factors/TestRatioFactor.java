package com.blastradius.scoring.factors;

import com.blastradius.scoring.FactorScore;
import com.blastradius.scoring.RiskFactor;
import com.blastradius.scoring.ScoringContext;
import org.springframework.stereotype.Component;

/**
 * Test-to-production change ratio: production changes shipped without accompanying
 * test changes are a classic leading indicator of regressions.
 *
 * WEIGHT RATIONALE: max 15 of 100. Full 15 points when prod code changed with zero
 * test changes; scales down linearly until the diff contains at least half as many
 * test lines as prod lines (ratio >= 0.5), at which point the factor is silent.
 * The 0.5 threshold is deliberately forgiving — plenty of safe changes (config,
 * copy) legitimately need few tests, so only clearly test-free prod changes are
 * penalized hard.
 */
@Component
public class TestRatioFactor implements RiskFactor {

    public static final int MAX_POINTS = 15;
    /** Ratio at (or above) which the factor contributes nothing. */
    public static final double SAFE_RATIO = 0.5;

    @Override
    public String name() {
        return "test_ratio";
    }

    @Override
    public int maxPoints() {
        return MAX_POINTS;
    }

    @Override
    public FactorScore evaluate(ScoringContext context) {
        if (context.prodLinesChanged() <= 0) {
            return FactorScore.notTriggered(name(),
                    "No production lines changed — test-only or empty diff");
        }
        double ratio = context.testProdRatio();
        if (ratio >= SAFE_RATIO) {
            return FactorScore.notTriggered(name(),
                    "Test/prod ratio %.2f ≥ %.1f — change is adequately tested".formatted(ratio, SAFE_RATIO));
        }
        // Linear: ratio 0.0 → 15 points, ratio 0.5 → 0 points.
        int points = (int) Math.round(MAX_POINTS * (1.0 - ratio / SAFE_RATIO));
        String detail = "%d prod lines vs %d test lines (ratio %.2f < %.1f) → %d points"
                .formatted(context.prodLinesChanged(), context.testLinesChanged(), ratio, SAFE_RATIO, points);
        return points > 0 ? FactorScore.triggered(name(), points, detail)
                : FactorScore.notTriggered(name(), detail);
    }
}
