import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it("renders Pending badge", () => {
    render(<StatusBadge status="Pending" />);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("renders Cleared badge", () => {
    render(<StatusBadge status="Cleared" />);
    expect(screen.getByText("Cleared")).toBeInTheDocument();
  });

  it("renders Failed badge", () => {
    render(<StatusBadge status="Failed" />);
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });
});
