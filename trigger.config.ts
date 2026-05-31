import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  // Get your project ref from https://cloud.trigger.dev → project settings
  project: "proj_utvnjkhamfjvgnsfwgyb",
  runtime: "node",
  logLevel: "log",
  // Maximum seconds a single task run is allowed to execute
  maxDuration: 300,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ["./src/trigger"],
});
