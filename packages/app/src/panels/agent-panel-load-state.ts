import type { AgentScreenMissingState } from "@/hooks/use-agent-screen-state-machine";

export function reconcileMissingAgentStateWithPresentAgent(
  state: AgentScreenMissingState,
  options: { hasAppliedAuthoritativeHistory?: boolean } = {},
): AgentScreenMissingState {
  if (state.kind === "resolving" || state.kind === "not_found") {
    return { kind: "idle" };
  }
  // A failed history sync used to wedge the panel in the missing-agent error
  // state (#1828) even after the timeline arrived. Once the record is present
  // and authoritative history has applied, the panel has a usable timeline —
  // the stale failure clears so the conversation renders without a manual
  // reload. Manual retry (retryAgentLoad) keeps working for earlier failures.
  if (state.kind === "error" && options.hasAppliedAuthoritativeHistory) {
    return { kind: "idle" };
  }
  return state;
}

export function clearHistorySyncErrorAfterSuccessfulSync(
  state: AgentScreenMissingState,
): AgentScreenMissingState {
  if (state.kind === "error") {
    return { kind: "idle" };
  }
  return state;
}
