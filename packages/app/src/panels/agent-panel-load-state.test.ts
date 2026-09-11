import { describe, expect, it } from "vitest";
import type { AgentScreenMissingState } from "@/hooks/use-agent-screen-state-machine";
import {
  clearHistorySyncErrorAfterSuccessfulSync,
  reconcileMissingAgentStateWithPresentAgent,
} from "./agent-panel-load-state";

describe("reconcileMissingAgentStateWithPresentAgent", () => {
  it("clears lookup-only states once the agent record is present", () => {
    expect(reconcileMissingAgentStateWithPresentAgent({ kind: "resolving" })).toEqual({
      kind: "idle",
    });
    expect(
      reconcileMissingAgentStateWithPresentAgent({
        kind: "not_found",
        message: "Agent not found: agent-1",
      }),
    ).toEqual({ kind: "idle" });
  });

  it("preserves history sync errors while the timeline has not applied", () => {
    const state: AgentScreenMissingState = {
      kind: "error",
      message: "Failed to get logs: session is archived",
    };

    expect(
      reconcileMissingAgentStateWithPresentAgent(state, {
        hasAppliedAuthoritativeHistory: false,
      }),
    ).toBe(state);
    expect(reconcileMissingAgentStateWithPresentAgent(state)).toBe(state);
  });

  it("clears a history sync error once the timeline has applied so the panel recovers", () => {
    expect(
      reconcileMissingAgentStateWithPresentAgent(
        {
          kind: "error",
          message: "Failed to get logs: session is archived",
        },
        { hasAppliedAuthoritativeHistory: true },
      ),
    ).toEqual({ kind: "idle" });
  });
});

describe("clearHistorySyncErrorAfterSuccessfulSync", () => {
  it("clears a sync error after a later successful refresh", () => {
    expect(
      clearHistorySyncErrorAfterSuccessfulSync({
        kind: "error",
        message: "Failed to get logs: session is archived",
      }),
    ).toEqual({ kind: "idle" });
  });

  it("leaves non-error states alone", () => {
    const state: AgentScreenMissingState = { kind: "resolving" };

    expect(clearHistorySyncErrorAfterSuccessfulSync(state)).toBe(state);
  });
});
