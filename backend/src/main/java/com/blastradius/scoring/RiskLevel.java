package com.blastradius.scoring;

/**
 * Coarse risk bands used for filtering and dashboard color-coding.
 * Thresholds: LOW &lt; 40, MEDIUM 40–69, HIGH ≥ 70.
 */
public enum RiskLevel {
    LOW,
    MEDIUM,
    HIGH;

    public static final int MEDIUM_THRESHOLD = 40;
    public static final int HIGH_THRESHOLD = 70;

    public static RiskLevel fromScore(int score) {
        if (score >= HIGH_THRESHOLD) {
            return HIGH;
        }
        if (score >= MEDIUM_THRESHOLD) {
            return MEDIUM;
        }
        return LOW;
    }
}
