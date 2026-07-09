package com.blastradius.scoring.factors;

import com.blastradius.scoring.FactorScore;
import com.blastradius.scoring.RiskFactor;
import com.blastradius.scoring.ScoringContext;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDateTime;

/**
 * Deploy timing: risk is not just what you ship but when. Off-hours deploys mean
 * fewer engineers around to notice and roll back a bad release.
 *
 * WEIGHT RATIONALE: max 15 of 100.
 *  - Friday from 15:00 onward: full 15 points — the canonical worst slot; problems
 *    surface over the weekend when nobody is watching.
 *  - Weekend: 12 points — thin on-call coverage, but at least no Friday-evening
 *    "ship and leave" dynamic.
 *  - Any weekday evening from 18:00: 8 points — reduced staffing but the next
 *    business morning is close.
 *  - Business hours Mon–Thu (and Friday before 15:00): 0 points.
 */
@Component
public class DeployTimingFactor implements RiskFactor {

    public static final int MAX_POINTS = 15;
    public static final int FRIDAY_EVENING_POINTS = 15;
    public static final int WEEKEND_POINTS = 12;
    public static final int WEEKDAY_EVENING_POINTS = 8;
    /** Hour (24h) from which a Friday deploy counts as "Friday evening". */
    public static final int FRIDAY_CUTOFF_HOUR = 15;
    /** Hour (24h) from which any weekday deploy counts as "evening". */
    public static final int EVENING_HOUR = 18;

    @Override
    public String name() {
        return "deploy_timing";
    }

    @Override
    public int maxPoints() {
        return MAX_POINTS;
    }

    @Override
    public FactorScore evaluate(ScoringContext context) {
        LocalDateTime ts = context.timestamp();
        DayOfWeek day = ts.getDayOfWeek();
        int hour = ts.getHour();

        if (day == DayOfWeek.FRIDAY && hour >= FRIDAY_CUTOFF_HOUR) {
            return FactorScore.triggered(name(), FRIDAY_EVENING_POINTS,
                    "Friday at %02d:00 or later — worst deploy window → %d points"
                            .formatted(FRIDAY_CUTOFF_HOUR, FRIDAY_EVENING_POINTS));
        }
        if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) {
            return FactorScore.triggered(name(), WEEKEND_POINTS,
                    "Weekend deploy (%s) — thin on-call coverage → %d points"
                            .formatted(day, WEEKEND_POINTS));
        }
        if (hour >= EVENING_HOUR) {
            return FactorScore.triggered(name(), WEEKDAY_EVENING_POINTS,
                    "Weekday evening deploy (%s %02d:%02d) → %d points"
                            .formatted(day, ts.getHour(), ts.getMinute(), WEEKDAY_EVENING_POINTS));
        }
        return FactorScore.notTriggered(name(),
                "Business-hours deploy (%s %02d:%02d) — no timing penalty".formatted(day, hour, ts.getMinute()));
    }
}
