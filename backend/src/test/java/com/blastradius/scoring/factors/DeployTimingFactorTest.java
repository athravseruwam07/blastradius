package com.blastradius.scoring.factors;

import com.blastradius.domain.MonitoredService;
import com.blastradius.scoring.ScoringContext;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class DeployTimingFactorTest {

    private final DeployTimingFactor factor = new DeployTimingFactor();

    private ScoringContext contextAt(LocalDateTime timestamp) {
        MonitoredService service = new MonitoredService("svc", 5, List.of());
        return new ScoringContext(service, timestamp, 100, 80, 40, List.of());
    }

    @Test
    void fridayEveningScoresMax() {
        // 2026-07-10 is a Friday
        LocalDateTime fridayEvening = LocalDateTime.of(2026, 7, 10, 17, 30);
        assertThat(factor.evaluate(contextAt(fridayEvening)).points())
                .isEqualTo(DeployTimingFactor.FRIDAY_EVENING_POINTS);
    }

    @Test
    void fridayMorningIsNotPenalized() {
        LocalDateTime fridayMorning = LocalDateTime.of(2026, 7, 10, 9, 0);
        assertThat(factor.evaluate(contextAt(fridayMorning)).triggered()).isFalse();
    }

    @Test
    void weekendScoresWeekendPoints() {
        // 2026-07-11 is a Saturday
        LocalDateTime saturday = LocalDateTime.of(2026, 7, 11, 12, 0);
        assertThat(factor.evaluate(contextAt(saturday)).points())
                .isEqualTo(DeployTimingFactor.WEEKEND_POINTS);
    }

    @Test
    void weekdayEveningScoresEveningPoints() {
        // 2026-07-08 is a Wednesday
        LocalDateTime wednesdayEvening = LocalDateTime.of(2026, 7, 8, 20, 0);
        assertThat(factor.evaluate(contextAt(wednesdayEvening)).points())
                .isEqualTo(DeployTimingFactor.WEEKDAY_EVENING_POINTS);
    }

    @Test
    void weekdayBusinessHoursNotTriggered() {
        LocalDateTime tuesdayMorning = LocalDateTime.of(2026, 7, 7, 10, 0);
        assertThat(factor.evaluate(contextAt(tuesdayMorning)).triggered()).isFalse();
    }
}
