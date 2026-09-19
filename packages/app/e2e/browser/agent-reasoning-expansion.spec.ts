import { test, expect } from "../support/fixtures";
import { expectAgentIdle } from "../support/helpers/agent-stream";
import { startRunningMockAgent } from "../support/helpers/composer";

// A row owns its expansion state, and a completed turn moves the reasoning row from the
// live head into the history lane. That remount used to re-open the row collapsed and take
// the text the reader was following with it.
const REASONING_FRAGMENT = "Need to find the scroll container";

test("keeps an expanded reasoning row open when the turn completes", async ({ page }) => {
  test.setTimeout(120_000);
  const agent = await startRunningMockAgent(page, {
    prefix: "reasoning-expansion-",
    model: "ten-second-stream",
    prompt: "Show the reasoning and the reply.",
  });
  try {
    const stopButton = page.getByRole("button", { name: "Stop agent", exact: true });
    await expect(stopButton).toBeVisible({ timeout: 30_000 });

    // The newest reasoning row is the one the live head owns, so completing the turn
    // re-renders it from the history lane.
    const liveThinkingRow = page
      .getByTestId("tool-call-badge")
      .filter({ hasText: "Thinking" })
      .last();
    await expect(liveThinkingRow).toBeVisible({ timeout: 30_000 });
    await liveThinkingRow.click();
    await expect(page.locator("body")).toContainText(REASONING_FRAGMENT, { timeout: 30_000 });
    await expect(stopButton).toBeVisible();

    await expectAgentIdle(page);

    await expect(page.locator("body")).toContainText(REASONING_FRAGMENT);
  } finally {
    await agent.cleanup();
  }
});
