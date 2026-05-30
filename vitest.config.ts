import { defineConfig, mergeConfig } from "vitest/config";

import { baseConfig } from "@workspace/vitest-config/base";

export default defineConfig(
  mergeConfig(baseConfig, {
    test: {
      projects: [
        {
          root: "./packages",
        },
        {
          root: "./apps",
        },
      ],
    },
  })
);
