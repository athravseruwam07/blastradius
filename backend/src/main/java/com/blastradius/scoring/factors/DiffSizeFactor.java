package com.blastradius.scoring.factors;

import com.blastradius.scoring.FactorScore;
import com.blastradius.scoring.RiskFactor;
import com.blastradius.scoring.ScoringContext;
import org.springframework.stereotype.Component;

/**
 * Diff size: bigger changes carry more risk, but the relationship saturates —
 * a 5,000-line change is not 10x riskier than a 500-line one, review quality
 * has already collapsed at both sizes.
 *
 * WEIGHT RATIONALE: max 20 of 100. One point per 50 lines changed, capped at 1,000
 * lines. 50 lines/point roughly matches the size at which a change stops being
 * reviewable "at a glance"; the 1,000-line cap encodes the saturation above.
 */
@Component
public class DiffSizeFactor implements RiskFactor {

    public static final int MAX_POINTS = 20;
    /** Lines changed per risk point; chosen so ~1,000 changed lines saturates the factor. */
    public static final int LINES_PER_POINT = 50;

    @Override
    public String name() {
        return "diff_size";
    }

    @Override
    public int maxPoints() {
        return MAX_POINTS;
    }

    @Override
    public FactorScore evaluate(ScoringContext context) {
        int lines = context.diffLinesChanged();
        int points = Math.min(MAX_POINTS, lines / LINES_PER_POINT);
        String detail = "%d lines changed (1 point per %d lines, capped at %d) → %d points"
                .formatted(lines, LINES_PER_POINT, MAX_POINTS, points);
        return points > 0 ? FactorScore.triggered(name(), points, detail)
                : FactorScore.notTriggered(name(), detail);
    }
}
