package com.blastradius.scoring;

/**
 * The outcome of evaluating one risk factor.
 *
 * @param factor    stable machine-readable factor name
 * @param triggered whether the factor contributed any points
 * @param points    point contribution toward the 0–100 score
 * @param detail    human-readable explanation of why this factor scored what it did
 */
public record FactorScore(String factor, boolean triggered, int points, String detail) {

    public static FactorScore notTriggered(String factor, String detail) {
        return new FactorScore(factor, false, 0, detail);
    }

    public static FactorScore triggered(String factor, int points, String detail) {
        return new FactorScore(factor, true, points, detail);
    }
}
