package com.blastradius.scoring.factors;

import com.blastradius.domain.MonitoredService;
import com.blastradius.repository.IncidentRepository;
import com.blastradius.scoring.FactorScore;
import com.blastradius.scoring.ScoringContext;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class RecentIncidentsFactorTest {

    private final IncidentRepository incidentRepository = mock(IncidentRepository.class);
    private final RecentIncidentsFactor factor = new RecentIncidentsFactor(incidentRepository);

    private ScoringContext context() {
        MonitoredService service = new MonitoredService("svc", 5, List.of());
        return new ScoringContext(service,
                LocalDateTime.of(2026, 7, 8, 10, 0), 100, 80, 40, List.of());
    }

    private void givenIncidentCount(long count) {
        when(incidentRepository.countByServiceIdAndTimestampAfter(any(), any())).thenReturn(count);
    }

    @Test
    void noRecentIncidentsNotTriggered() {
        givenIncidentCount(0);
        FactorScore score = factor.evaluate(context());
        assertThat(score.triggered()).isFalse();
        assertThat(score.points()).isZero();
    }

    @Test
    void eachIncidentAddsPoints() {
        givenIncidentCount(2);
        assertThat(factor.evaluate(context()).points())
                .isEqualTo(2 * RecentIncidentsFactor.POINTS_PER_INCIDENT);
    }

    @Test
    void manyIncidentsAreCapped() {
        givenIncidentCount(9);
        assertThat(factor.evaluate(context()).points()).isEqualTo(factor.maxPoints());
    }
}
