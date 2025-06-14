import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  globalCss: {},
  theme: {
    tokens: {
      fonts: {
        heading: { value: `"Space Grotesk Variable", sans-serif` },
        body: { value: `"Space Grotesk Variable", sans-serif` },
      },
    },
  },
});

export default createSystem(defaultConfig, config);
