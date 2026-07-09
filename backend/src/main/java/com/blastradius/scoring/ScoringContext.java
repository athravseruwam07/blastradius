package com.blastradius.scoring;

import com.blastradius.domain.MonitoredService;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Immutable snapshot of everything a risk factor may inspect for one deploy.
 * Factors receive only this context, which keeps them independent of the web
 * layer and trivially unit-testable.
 *
 * @param service          the service being deployed
 * @param timestamp        when the deploy happens (used by time-based factors)
 * @param diffLinesChanged total lines changed in the diff
 * @param prodLinesChanged production (non-test) lines changed
 * @param testLinesChanged test lines changed
 * @param changedPaths     repository paths touched by the diff
 */
public record ScoringContext(
        MonitoredService service,
        LocalDateTime timestamp,
        int diffLinesChanged,
        int prodLinesChanged,
        int testLinesChanged,
        List<String> changedPaths) {

    /**
     * Test-to-prod ratio. Returns 0 when no production lines changed; factors that care
     * about the ratio must check {@link #prodLinesChanged()} first (test-only diffs are
     * not penalized).
     */
    public double testProdRatio() {
        if (prodLinesChanged <= 0) {
            return 0.0;
        }
        return (double) testLinesChanged / prodLinesChanged;
    }
}
