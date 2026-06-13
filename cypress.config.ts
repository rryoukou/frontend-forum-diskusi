import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    specPattern: 'cypress/e2e/**/*.cy.ts', // Memastikan hanya fokus baca file .cy.ts kamu bro
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});