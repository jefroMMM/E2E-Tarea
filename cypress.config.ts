import { defineConfig } from 'cypress';
export default defineConfig({
  e2e: { baseUrl: 'http://127.0.0.1:3000', supportFile: false, testIsolation: true },
  viewportWidth: 1280, viewportHeight: 1200,
  video: true, screenshotOnRunFailure: true,
  screenshotsFolder: 'cypress/screenshots', videosFolder: 'cypress/videos',
});
