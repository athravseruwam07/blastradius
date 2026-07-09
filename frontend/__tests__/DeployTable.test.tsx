import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DeployTable from "@/components/DeployTable";
import { highRiskDeploy, lowRiskDeploy } from "./fixtures";

describe("DeployTable (dashboard)", () => {
  it("renders one row per deploy with service names", () => {
    render(<DeployTable deploys={[highRiskDeploy, lowRiskDeploy]} />);
    const rows = screen.getAllByTestId("deploy-row");
    expect(rows).toHaveLength(2);
    expect(screen.getByText("payment-service")).toBeInTheDocument();
    expect(screen.getByText("marketing-site")).toBeInTheDocument();
  });

  it("sorts deploys by risk score, highest first", () => {
    render(<DeployTable deploys={[lowRiskDeploy, highRiskDeploy]} />);
    const rows = screen.getAllByTestId("deploy-row");
    expect(within(rows[0]).getByText("payment-service")).toBeInTheDocument();
    expect(within(rows[1]).getByText("marketing-site")).toBeInTheDocument();
  });

  it("color-codes rows by risk level", () => {
    render(<DeployTable deploys={[highRiskDeploy, lowRiskDeploy]} />);
    const badges = screen.getAllByTestId("risk-badge");
    expect(badges[0].className).toContain("red");
    expect(badges[1].className).toContain("emerald");
    expect(badges[0]).toHaveTextContent("HIGH");
    expect(badges[1]).toHaveTextContent("LOW");
  });

  it("links each row to its detail view", () => {
    render(<DeployTable deploys={[highRiskDeploy]} />);
    const link = screen.getByRole("link", { name: "Details" });
    expect(link).toHaveAttribute("href", "/deploys/1");
  });

  it("shows an empty state when there are no deploys", () => {
    render(<DeployTable deploys={[]} />);
    expect(screen.getByText(/no deploys recorded yet/i)).toBeInTheDocument();
  });
});
