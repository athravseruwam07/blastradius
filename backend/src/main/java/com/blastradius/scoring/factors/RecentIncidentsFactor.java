package com.blastradius.scoring.factors;

import com.blastradius.repository.IncidentRepository;
import com.blastradius.scoring.FactorScore;
import com.blastradius.scoring.RiskFactor;
import com.blastradius.scoring.ScoringContext;
import org.springframework.stereotype.Component;

/**
 * Recent incident history: a service that has been paging people recently is more
 * likely to be fragile, under-tested, or mid-migration — new deploys inherit that risk.
 *
 * WEIGHT RATIONALE: max 15 of 100. 5 points per incident in the last 30 days, capped
 * at 3 incidents. 5 points makes one recent incident noticeable but not damning;
 * three or more says "this service is on fire" and saturates the factor.
 */
@Component
public class RecentIncidentsFactor implements RiskFactor {

    public static final int MAX_POINTS = 15;
    public static final int POINTS_PER_INCIDENT = 5;
    public static final int LOOKBACK_DAYS = 30;

    private final IncidentRepository incidentRepository;

    public RecentIncidentsFactor(IncidentRepository incidentRepository) {
        this.incidentRepository = incidentRepository;
    }

    @Override
    public String name() {
        return "recent_incidents";
    }

    @Override
    public int maxPoints() {
        return MAX_POINTS;
    }

    @Override
    public FactorScore evaluate(ScoringContext context) {
        long count = incidentRepository.countByServiceIdAndTimestampAfter(
                context.service().getId(), context.timestamp().minusDays(LOOKBACK_DAYS));
        int points = (int) Math.min(MAX_POINTS, count * POINTS_PER_INCIDENT);
        String detail = "%d incident(s) for '%s' in the last %d days → %d points"
                .formatted(count, context.service().getName(), LOOKBACK_DAYS, points);
        return points > 0 ? FactorScore.triggered(name(), points, detail)
                : FactorScore.notTriggered(name(), detail);
    }
}
