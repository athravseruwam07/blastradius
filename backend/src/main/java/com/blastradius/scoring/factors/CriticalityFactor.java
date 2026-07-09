package com.blastradius.scoring.factors;

import com.blastradius.scoring.FactorScore;
import com.blastradius.scoring.RiskFactor;
import com.blastradius.scoring.ScoringContext;
import org.springframework.stereotype.Component;

/**
 * Service criticality: how much business damage a bad deploy to this service causes.
 *
 * WEIGHT RATIONALE: this is the largest single factor (max 25 of 100) because the same
 * change is fundamentally more dangerous on a payment service than on a marketing page —
 * blast radius is dominated by *what* you deploy to, not how big the change is.
 * Each criticality point (1–10 scale, set per service) is worth 2.5 risk points.
 */
@Component
public class CriticalityFactor implements RiskFactor {

    public static final int MAX_POINTS = 25;
    /** Risk points per criticality point on the service's 1–10 scale. */
    public static final double POINTS_PER_CRITICALITY = 2.5;

    @Override
    public String name() {
        return "service_criticality";
    }

    @Override
    public int maxPoints() {
        return MAX_POINTS;
    }

    @Override
    public FactorScore evaluate(ScoringContext context) {
        int criticality = context.service().getCriticalityWeight();
        int points = (int) Math.min(MAX_POINTS, Math.round(criticality * POINTS_PER_CRITICALITY));
        String detail = "Service '%s' has criticality %d/10 → %d points"
                .formatted(context.service().getName(), criticality, points);
        return points > 0 ? FactorScore.triggered(name(), points, detail)
                : FactorScore.notTriggered(name(), detail);
    }
}
