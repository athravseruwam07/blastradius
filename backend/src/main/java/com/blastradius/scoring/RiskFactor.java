package com.blastradius.scoring;

/**
 * One independent, deterministic rule contributing points to a deploy's risk score.
 *
 * The engine discovers every Spring bean implementing this interface, so adding a
 * new factor means adding one new class — no existing factor or engine code changes
 * (open/closed principle).
 */
public interface RiskFactor {

    /** Stable name used in API breakdowns and stored JSON. */
    String name();

    /** Maximum points this factor can contribute. The sum across factors should not exceed 100. */
    int maxPoints();

    /** Evaluate this factor against a deploy. Must be deterministic for a given context. */
    FactorScore evaluate(ScoringContext context);
}
