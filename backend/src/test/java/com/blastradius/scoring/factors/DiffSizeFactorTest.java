package com.blastradius.scoring.factors;

import com.blastradius.domain.MonitoredService;
import com.blastradius.scoring.FactorScore;
import com.blastradius.scoring.ScoringContext;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class DiffSizeFactorTest {

    private final DiffSizeFactor factor = new DiffSizeFactor();

    private ScoringContext contextFor(int diffLines) {
        MonitoredService service = new MonitoredService("svc", 5, List.of());
        return new ScoringContext(service,
                LocalDateTime.of(2026, 7, 8, 10, 0), diffLines, diffLines, 0, List.of());
    }

    @Test
    void tinyDiffScoresZero() {
        FactorScore score = factor.evaluate(contextFor(49));
        assertThat(score.triggered()).isFalse();
        assertThat(score.points()).isZero();
    }

    @Test
    void mediumDiffScoresLinearly() {
        assertThat(factor.evaluate(contextFor(500)).points()).isEqualTo(10);
    }

    @Test
    void hugeDiffIsCappedAtMax() {
        FactorScore score = factor.evaluate(contextFor(50_000));
        assertThat(score.points()).isEqualTo(factor.maxPoints());
    }

    @Test
    void zeroLinesNotTriggered() {
        assertThat(factor.evaluate(contextFor(0)).triggered()).isFalse();
    }
}
