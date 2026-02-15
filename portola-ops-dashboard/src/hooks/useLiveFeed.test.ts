import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useLiveFeed } from "./useLiveFeed";

describe("useLiveFeed", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("dispatches BUFFER_TRANSACTION every ~2 seconds", () => {
    const dispatch = vi.fn();
    renderHook(() => useLiveFeed(dispatch));

    vi.advanceTimersByTime(2000);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: "BUFFER_TRANSACTION" })
    );

    vi.advanceTimersByTime(2000);
    expect(dispatch).toHaveBeenCalledTimes(2);
  });

  it("cleans up timeout on unmount (no leak)", () => {
    const dispatch = vi.fn();
    const { unmount } = renderHook(() => useLiveFeed(dispatch));
    unmount();
    vi.advanceTimersByTime(10_000);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("does not queue multiple ticks during tab throttle", () => {
    const dispatch = vi.fn();
    renderHook(() => useLiveFeed(dispatch));

    vi.advanceTimersByTime(10_000);
    expect(dispatch).toHaveBeenCalledTimes(5);
  });

  it("does not dispatch when disabled", () => {
    const dispatch = vi.fn();
    renderHook(() => useLiveFeed(dispatch, false));

    vi.advanceTimersByTime(10_000);
    expect(dispatch).not.toHaveBeenCalled();
  });
});
