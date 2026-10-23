/**
 * Render defaults for every composition. (The Node.js API ignores this file; pass options directly there.)
 */
import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setOverwriteOutput(true);
// PNG intermediates: small UI text and flat colour fields show JPEG artifacts immediately.
Config.setVideoImageFormat("png");
// Limited-range bt709 is what X/YouTube and most players expect; full range shifts colours.
Config.setPixelFormat("yuv420p");
Config.setColorSpace("bt709");
Config.setCrf(18);
// Required for WebGL (the mesh background). Without it: "Error creating WebGL context".
Config.setChromiumOpenGlRenderer("angle");
