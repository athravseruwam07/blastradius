package com.blastradius.scoring.factors;

import com.blastradius.domain.MonitoredService;
import com.blastradius.scoring.FactorScore;
import com.blastradius.scoring.ScoringContext;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class SensitivePathFactorTest {

    private final SensitivePathFactor factor = new SensitivePathFactor();

    private ScoringContext contextFor(List<String> patterns, List<String> changedPaths) {
        MonitoredService service = new MonitoredService("svc", 5, patterns);
        return new ScoringContext(service,
                LocalDateTime.of(2026, 7, 8, 10, 0), 100, 80, 40, changedPaths);
    }

    @Test
    void touchingSensitivePathScoresFullPoints() {
        FactorScore score = factor.evaluate(contextFor(
                List.of("/payment/", "/auth/"),
                List.of("src/main/java/payment/Charge.java", "/payment/gateway/Retry.java")));
        assertThat(score.triggered()).isTrue();
        assertThat(score.points()).isEqualTo(factor.maxPoints());
    }

    @Test
    void isFlatNotScaledByHitCount() {
        FactorScore oneHit = factor.evaluate(contextFor(
                List.of("/payment/"), List.of("/payment/a.java")));
        FactorScore threeHits = factor.evaluate(contextFor(
                List.of("/payment/"),
                List.of("/payment/a.java", "/payment/b.java", "/payment/c.java")));
        assertThat(oneHit.points()).isEqualTo(threeHits.points());
    }

    @Test
    void noSensitivePathsTouchedNotTriggered() {
        FactorScore score = factor.evaluate(contextFor(
                List.of("/payment/"), List.of("docs/readme.md")));
        assertThat(score.triggered()).isFalse();
        assertThat(score.points()).isZero();
    }

    @Test
    void serviceWithoutPatternsNeverTriggers() {
        FactorScore score = factor.evaluate(contextFor(
                List.of(), List.of("/payment/a.java")));
        assertThat(score.triggered()).isFalse();
    }
}
