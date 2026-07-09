package com.blastradius.scoring;

import com.blastradius.domain.MonitoredService;
import com.blastradius.repository.IncidentRepository;
import com.blastradius.scoring.factors.CriticalityFactor;
import com.blastradius.scoring.factors.DeployTimingFactor;
import com.blastradius.scoring.factors.DiffSizeFactor;
import com.blastradius.scoring.factors.RecentIncidentsFactor;
import com.blastradius.scoring.factors.SensitivePathFactor;
import com.blastradius.scoring.factors.TestRatioFactor;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Combined-engine test with all six real factors wired in (incident repository mocked).
 */
class RiskScoringEngineTest {

    private final IncidentRepository incidentRepository = mock(IncidentRepository.class);

    private RiskScoringEngine engine() {
        return new RiskScoringEngine(List.of(
                new CriticalityFactor(),
                new DiffSizeFactor(),
                new TestRatioFactor(),
                new DeployTimingFactor(),
                new RecentIncidentsFactor(incidentRepository),
                new SensitivePathFactor()));
    }

    @Test
    void worstCaseDeployScoresFullHundred() {
        when(incidentRepository.countByServiceIdAndTimestampAfter(any(), any())).thenReturn(5L);
        MonitoredService payments = new MonitoredService("payment-service", 10, List.of("/payment/"));
        // Friday 17:00, huge untested diff on a critical service with recent incidents.
        ScoringContext worstCase = new ScoringContext(
                payments,
                LocalDateTime.of(2026, 7, 10, 17, 0),
                5_000, 5_000, 0,
                List.of("/payment/Charge.java"));

        ScoringResult result = engine().score(worstCase);

        // 25 (criticality) + 20 (diff) + 15 (tests) + 15 (Friday evening) + 15 (incidents) + 10 (paths)
        assertThat(result.score()).isEqualTo(100);
        assertThat(result.riskLevel()).isEqualTo(RiskLevel.HIGH);
        assertThat(result.breakdown()).hasSize(6);
        assertThat(result.breakdown()).allMatch(FactorScore::triggered);
    }

    @Test
    void benignDeployScoresLow() {
        when(incidentRepository.countByServiceIdAndTimestampAfter(any(), any())).thenReturn(0L);
        MonitoredService marketing = new MonitoredService("marketing-site", 2, List.of());
        // Tuesday morning, small well-tested change, no sensitive paths, no incidents.
        ScoringContext benign = new ScoringContext(
                marketing,
                LocalDateTime.of(2026, 7, 7, 10, 0),
                40, 20, 20,
                List.of("pages/pricing.tsx"));

        ScoringResult result = engine().score(benign);

        // Only criticality contributes: 2 * 2.5 = 5.
        assertThat(result.score()).isEqualTo(5);
        assertThat(result.riskLevel()).isEqualTo(RiskLevel.LOW);
    }

    @Test
    void scoreIsSumOfBreakdownPoints() {
        when(incidentRepository.countByServiceIdAndTimestampAfter(any(), any())).thenReturn(1L);
        MonitoredService orders = new MonitoredService("order-service", 7, List.of("/checkout/"));
        ScoringContext context = new ScoringContext(
                orders,
                LocalDateTime.of(2026, 7, 8, 20, 30),
                600, 500, 100,
                List.of("/checkout/Cart.java"));

        ScoringResult result = engine().score(context);

        int breakdownSum = result.breakdown().stream().mapToInt(FactorScore::points).sum();
        assertThat(result.score()).isEqualTo(breakdownSum);
        assertThat(result.breakdown()).hasSize(6);
    }

    @Test
    void factorMaxPointsBudgetSumsToExactlyOneHundred() {
        int budget = engine().getFactors().stream().mapToInt(RiskFactor::maxPoints).sum();
        assertThat(budget).isEqualTo(RiskScoringEngine.MAX_SCORE);
    }
}
