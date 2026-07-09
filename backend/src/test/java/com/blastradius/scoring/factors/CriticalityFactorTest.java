package com.blastradius.scoring.factors;

import com.blastradius.domain.MonitoredService;
import com.blastradius.scoring.FactorScore;
import com.blastradius.scoring.ScoringContext;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CriticalityFactorTest {

    private final CriticalityFactor factor = new CriticalityFactor();

    private ScoringContext contextFor(int criticality) {
        MonitoredService service = new MonitoredService("svc", criticality, List.of());
        return new ScoringContext(service,
                LocalDateTime.of(2026, 7, 8, 10, 0), 100, 80, 40, List.of());
    }

    @Test
    void maxCriticalityScoresMaxPoints() {
        FactorScore score = factor.evaluate(contextFor(10));
        assertThat(score.triggered()).isTrue();
        assertThat(score.points()).isEqualTo(25);
    }

    @Test
    void lowCriticalityScoresProportionally() {
        FactorScore score = factor.evaluate(contextFor(2));
        assertThat(score.points()).isEqualTo(5);
    }

    @Test
    void midCriticalityRoundsToNearestPoint() {
        // 7 * 2.5 = 17.5 → rounds to 18
        assertThat(factor.evaluate(contextFor(7)).points()).isEqualTo(18);
    }

    @Test
    void neverExceedsMaxPoints() {
        assertThat(factor.evaluate(contextFor(10)).points()).isLessThanOrEqualTo(factor.maxPoints());
    }
}
