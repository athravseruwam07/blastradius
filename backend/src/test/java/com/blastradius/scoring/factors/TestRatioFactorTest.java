package com.blastradius.scoring.factors;

import com.blastradius.domain.MonitoredService;
import com.blastradius.scoring.FactorScore;
import com.blastradius.scoring.ScoringContext;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class TestRatioFactorTest {

    private final TestRatioFactor factor = new TestRatioFactor();

    private ScoringContext contextFor(int prodLines, int testLines) {
        MonitoredService service = new MonitoredService("svc", 5, List.of());
        return new ScoringContext(service,
                LocalDateTime.of(2026, 7, 8, 10, 0),
                prodLines + testLines, prodLines, testLines, List.of());
    }

    @Test
    void prodChangeWithNoTestsScoresMax() {
        FactorScore score = factor.evaluate(contextFor(200, 0));
        assertThat(score.triggered()).isTrue();
        assertThat(score.points()).isEqualTo(factor.maxPoints());
    }

    @Test
    void partialCoverageScoresLinearly() {
        // ratio 0.25 → 15 * (1 - 0.25/0.5) = 7.5 → rounds to 8
        assertThat(factor.evaluate(contextFor(100, 25)).points()).isEqualTo(8);
    }

    @Test
    void wellTestedChangeNotTriggered() {
        FactorScore score = factor.evaluate(contextFor(100, 60));
        assertThat(score.triggered()).isFalse();
        assertThat(score.points()).isZero();
    }

    @Test
    void testOnlyChangeNotTriggered() {
        FactorScore score = factor.evaluate(contextFor(0, 300));
        assertThat(score.triggered()).isFalse();
    }
}
