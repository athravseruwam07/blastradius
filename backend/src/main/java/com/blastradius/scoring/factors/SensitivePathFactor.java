package com.blastradius.scoring.factors;

import com.blastradius.scoring.FactorScore;
import com.blastradius.scoring.RiskFactor;
import com.blastradius.scoring.ScoringContext;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Sensitive paths: some code paths (auth, payment, billing) are disproportionately
 * dangerous to touch regardless of diff size, because failures there mean locked-out
 * users or money moving wrongly.
 *
 * WEIGHT RATIONALE: max 10 of 100, all-or-nothing. This factor is deliberately a flat
 * flag rather than scaled by how many sensitive files changed: touching one line of
 * payment code deserves the same extra scrutiny as touching fifty. The per-service
 * pattern list lives on the Service entity so teams can tune it without code changes.
 */
@Component
public class SensitivePathFactor implements RiskFactor {

    public static final int MAX_POINTS = 10;

    @Override
    public String name() {
        return "sensitive_paths";
    }

    @Override
    public int maxPoints() {
        return MAX_POINTS;
    }

    @Override
    public FactorScore evaluate(ScoringContext context) {
        List<String> patterns = context.service().getSensitivePathPatterns();
        List<String> hits = context.changedPaths().stream()
                .filter(path -> patterns.stream().anyMatch(path::contains))
                .toList();
        if (hits.isEmpty()) {
            return FactorScore.notTriggered(name(), "No sensitive paths touched");
        }
        return FactorScore.triggered(name(), MAX_POINTS,
                "Touches sensitive path(s) %s → %d points".formatted(hits, MAX_POINTS));
    }
}
