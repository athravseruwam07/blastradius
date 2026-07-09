import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ScoreBreakdown from "@/components/ScoreBreakdown";
import { highRiskDeploy, lowRiskDeploy } from "./fixtures";

describe("ScoreBreakdown (deploy detail view)", () => {
  it("shows the headline risk score and level", () => {
    render(<ScoreBreakdown deploy={highRiskDeploy} />);
    expect(screen.getByTestId("risk-score")).toHaveTextContent("83");
    expect(screen.getByTestId("risk-badge")).toHaveTextContent("HIGH");
  });

  it("renders every factor in the breakdown with its points", () => {
    render(<ScoreBreakdown deploy={highRiskDeploy} />);
    const rows = screen.getAllByTestId("factor-row");
    expect(rows).toHaveLength(6);
    expect(screen.getByText("service_criticality")).toBeInTheDocument();
    expect(screen.getByText("+25 pts")).toBeInTheDocument();
    expect(screen.getByText("deploy_timing")).toBeInTheDocument();
    expect(screen.getByText("+15 pts")).toBeInTheDocument();
  });

  it("shows the human-readable explanation for each factor", () => {
    render(<ScoreBreakdown deploy={highRiskDeploy} />);
    expect(
      screen.getByText(/friday at 15:00 or later/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/touches sensitive path/i)
    ).toBeInTheDocument();
  });

  it("visually distinguishes non-triggered factors", () => {
    render(<ScoreBreakdown deploy={lowRiskDeploy} />);
    const rows = screen.getAllByTestId("factor-row");
    const untriggered = rows.find((r) => r.textContent?.includes("diff_size"));
    expect(untriggered?.className).toContain("opacity-60");
  });

  it("shows service name and deploy metadata", () => {
    render(<ScoreBreakdown deploy={highRiskDeploy} />);
    expect(screen.getByText("payment-service")).toBeInTheDocument();
    expect(screen.getByText(/900 lines/, { selector: "span" })).toBeInTheDocument();
    expect(screen.getByText(/Pending/)).toBeInTheDocument();
  });
});
