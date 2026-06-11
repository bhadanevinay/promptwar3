import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { CalculatorForm } from "./CalculatorForm";

describe("CalculatorForm", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(<CalculatorForm onSubmit={() => {}} loading={false} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("submits the entered values via onSubmit", async () => {
    const onSubmit = vi.fn();
    render(<CalculatorForm onSubmit={onSubmit} loading={false} />);

    const carKm = screen.getByLabelText(/car distance per week/i);
    await userEvent.clear(carKm);
    await userEvent.type(carKm, "120");

    await userEvent.selectOptions(screen.getByLabelText(/diet/i), "vegan");
    await userEvent.click(screen.getByRole("button", { name: /calculate my footprint/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.transport.car_km_per_week).toBe(120);
    expect(payload.diet).toBe("vegan");
  });

  it("disables the submit button and marks it busy while loading", () => {
    render(<CalculatorForm onSubmit={() => {}} loading={true} />);
    const button = screen.getByRole("button", { name: /calculating/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("associates the household hint with its input for screen readers", () => {
    render(<CalculatorForm onSubmit={() => {}} loading={false} />);
    expect(screen.getByLabelText(/people in household/i)).toHaveAccessibleDescription(
      /home energy is shared/i,
    );
  });

  it("constrains numeric inputs to the documented bounds", () => {
    render(<CalculatorForm onSubmit={() => {}} loading={false} />);
    expect(screen.getByLabelText(/car distance per week/i)).toHaveAttribute("max", "20000");
    expect(screen.getByLabelText(/short-haul flights/i)).toHaveAttribute("max", "200");
    expect(screen.getByLabelText(/people in household/i)).toHaveAttribute("max", "50");
  });
});
