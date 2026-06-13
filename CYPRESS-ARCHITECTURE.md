# 🏗️ Cypress Testing Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CYPRESS TEST SUITE                       │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │  Dashboard  │  │ Categories  │  │ Integration │       │
│  │    Tests    │  │   Tests     │  │    Tests    │       │
│  │  10 cases   │  │  36 cases   │  │   6 cases   │       │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘       │
│         │                 │                 │               │
│         └─────────────────┴─────────────────┘               │
│                           │                                 │
│                    ┌──────▼──────┐                         │
│                    │   Custom    │                         │
│                    │  Commands   │                         │
│                    │ (Auth, etc) │                         │
│                    └──────┬──────┘                         │
└───────────────────────────┼─────────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │   Frontend     │
                    │ React + Vite   │
                    │  Port: 5173    │
                    └───────┬────────┘
                            │
                    ┌───────▼────────┐
                    │    Backend     │
                    │ Laravel + API  │
                    │  Port: 8000    │
                    └────────────────┘
```

## Test Flow Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                       TEST EXECUTION FLOW                    │
└──────────────────────────────────────────────────────────────┘

1. TEST START
   │
   ├─► beforeEach()
   │   │
   │   ├─► cy.loginAsAdmin()
   │   │   │
   │   │   ├─► POST /api/login
   │   │   ├─► Store token in localStorage
   │   │   └─► Store user in localStorage
   │   │
   │   └─► cy.visit('/admin/...')
   │       │
   │       └─► Load page with auth token
   │
   ├─► TEST CASE EXECUTION
   │   │
   │   ├─► Interact with UI
   │   │   ├─► Click buttons
   │   │   ├─► Fill forms
   │   │   └─► Navigate pages
   │   │
   │   ├─► cy.intercept() (if needed)
   │   │   ├─► Mock API responses
   │   │   └─► Wait for API calls
   │   │
   │   └─► Assertions
   │       ├─► should('be.visible')
   │       ├─► should('contain.text', ...)
   │       └─► should('have.length', ...)
   │
   └─► TEST END
       │
       └─► Screenshot on failure (auto)
```

## File Structure & Dependencies

```
frontend-forum-diskusi/
│
├─── cypress.config.ts ────────────────┐
│    (Base URL, viewport, etc)        │
│                                      │
├─── cypress.env.json ─────────────────┤
│    (API URL configuration)          ├─► Configuration Layer
│                                      │
└─── package.json ─────────────────────┘
     (NPM scripts for testing)

     
└─── cypress/
     │
     ├─── tsconfig.json ───────────────► TypeScript config
     │
     ├─── support/ ────────────────────┐
     │    ├─ commands.ts                │
     │    │  ├─ cy.login()             ├─► Support Layer
     │    │  └─ cy.loginAsAdmin()      │   (Reusable utilities)
     │    └─ e2e.ts                     │
     │       └─ Import commands         │
     │                                  │
     ├─── fixtures/ ───────────────────┤
     │    └─ admin.json                ├─► Data Layer
     │       (Test credentials)        │   (Test data)
     │                                  │
     └─── e2e/ ────────────────────────┘
          ├─ admin-dashboard.cy.ts     ┐
          ├─ admin-categories.cy.ts    ├─► Test Layer
          ├─ admin-integration.cy.ts   │   (Test cases)
          └─ admin-categories-adv.cy.ts┘
```

## Test Categories Architecture

```
┌────────────────────────────────────────────────────────────┐
│                   TEST ORGANIZATION                        │
└────────────────────────────────────────────────────────────┘

Level 1: BASIC TESTS (admin-dashboard.cy.ts, admin-categories.cy.ts)
├─► Smoke Tests
│   ├─ Page loads correctly
│   ├─ Elements are visible
│   └─ Basic interactions work
│
├─► UI Tests
│   ├─ Components render
│   ├─ Styling is correct
│   └─ Responsive layout
│
└─► Data Display Tests
    ├─ Stats show correctly
    ├─ Tables display data
    └─ Empty states work

Level 2: INTEGRATION TESTS (admin-integration.cy.ts)
├─► Navigation
│   ├─ Cross-page navigation
│   └─ URL routing
│
├─► State Management
│   ├─ Auth persistence
│   └─ Data consistency
│
└─► API Integration
    ├─ Loading states
    └─ Error handling

Level 3: ADVANCED TESTS (admin-categories-advanced.cy.ts)
├─► CRUD Operations
│   ├─ Create with validation
│   ├─ Update complex data
│   └─ Delete with confirmation
│
├─► Complex Scenarios
│   ├─ Parent-child relationships
│   ├─ Search & filter
│   └─ Form validation edge cases
│
└─► Performance & Edge Cases
    ├─ Concurrent operations
    ├─ Race conditions
    └─ Error boundaries
```

## Custom Commands Architecture

```
┌────────────────────────────────────────────────────────────┐
│                  CUSTOM COMMANDS FLOW                      │
└────────────────────────────────────────────────────────────┘

cy.loginAsAdmin()
    │
    ├─► Calls cy.login('admin@forum.com', 'password')
    │
    └─► cy.login(email, password)
            │
            ├─► cy.request({
            │       method: 'POST',
            │       url: 'http://localhost:8000/api/login',
            │       body: { email, password }
            │   })
            │
            ├─► Extract response.body.token
            ├─► Extract response.body.user
            │
            ├─► localStorage.setItem('token', ...)
            └─► localStorage.setItem('user', ...)

Result: Authenticated state ready for test execution
```

## API Interaction Pattern

```
┌────────────────────────────────────────────────────────────┐
│              API MOCKING & INTERCEPTION                    │
└────────────────────────────────────────────────────────────┘

Method 1: INTERCEPT & WAIT (Recommended)
┌─────────────────────────────────────────┐
│ cy.intercept('POST', '/api/categories') │
│   .as('createCategory');                │
│                                         │
│ // Perform action                       │
│ cy.contains('Create').click();          │
│                                         │
│ // Wait for API                         │
│ cy.wait('@createCategory');             │
│                                         │
│ // Verify response                      │
│ cy.wait('@createCategory')              │
│   .its('response.statusCode')          │
│   .should('eq', 201);                   │
└─────────────────────────────────────────┘

Method 2: MOCK RESPONSE (For testing edge cases)
┌─────────────────────────────────────────┐
│ cy.intercept('GET', '/api/users', {     │
│   statusCode: 500,                      │
│   body: { message: 'Server Error' }    │
│ }).as('getUsersError');                 │
│                                         │
│ cy.visit('/admin/dashboard');           │
│ cy.wait('@getUsersError');              │
│                                         │
│ // Test error handling UI               │
└─────────────────────────────────────────┘

Method 3: DELAY RESPONSE (For testing loading states)
┌─────────────────────────────────────────┐
│ cy.intercept('GET', '/api/categories',  │
│   (req) => {                            │
│     req.on('response', (res) => {       │
│       res.setDelay(2000);               │
│     });                                 │
│   }                                     │
│ );                                      │
│                                         │
│ // Should show loading skeleton         │
│ cy.get('.skeleton-pulse')               │
│   .should('be.visible');                │
└─────────────────────────────────────────┘
```

## Test Data Management

```
┌────────────────────────────────────────────────────────────┐
│                   DATA STRATEGY                            │
└────────────────────────────────────────────────────────────┘

1. FIXTURES (Static Data)
   cypress/fixtures/admin.json
   ├─► Credentials
   ├─► Common test data
   └─► Configuration

2. DYNAMIC DATA (Generated in tests)
   const categoryName = `Test ${Date.now()}`;
   ├─► Unique identifiers
   ├─► Timestamp-based names
   └─► Avoid collision

3. BACKEND SEEDED DATA
   php artisan db:seed
   ├─► Base categories
   ├─► Test users
   └─► Sample data

Strategy:
├─► Use fixtures for auth
├─► Generate unique data in tests
└─► Rely on seeded data for read operations
```

## Assertion Patterns

```
┌────────────────────────────────────────────────────────────┐
│                ASSERTION BEST PRACTICES                    │
└────────────────────────────────────────────────────────────┘

✅ GOOD: Explicit & Chainable
cy.get('[data-testid="user-count"]')
  .should('be.visible')
  .and('contain.text', /^\d+$/);

✅ GOOD: Wait for state
cy.contains('Save').click();
cy.contains('Saved successfully', { timeout: 5000 })
  .should('be.visible');

✅ GOOD: Multiple assertions
cy.get('table tbody tr').should(($rows) => {
  expect($rows).to.have.length.at.least(1);
  expect($rows.first()).to.contain('admin');
});

❌ BAD: Hard waits
cy.wait(5000); // Use cy.intercept() instead

❌ BAD: Brittle selectors
cy.get('div > div > div > button'); // Use data-testid

❌ BAD: No explicit waits
cy.contains('Save').click();
cy.url().should('include', '/success'); // Might race
```

## Performance Optimization

```
┌────────────────────────────────────────────────────────────┐
│              PERFORMANCE CONSIDERATIONS                    │
└────────────────────────────────────────────────────────────┘

1. DISABLE VIDEO RECORDING
   cypress.config.ts:
   video: false  // Saves ~30% execution time

2. PARALLELIZE TESTS (CI/CD)
   cypress run --parallel --record

3. SMART WAITING
   ✅ cy.intercept() + cy.wait('@alias')
   ❌ cy.wait(5000)

4. EFFICIENT SELECTORS
   ✅ data-testid attributes
   ✅ Specific text matches
   ❌ Complex CSS selectors

5. SHARED STATE (When safe)
   Use cy.session() for auth (advanced)
```

## CI/CD Integration

```
┌────────────────────────────────────────────────────────────┐
│                  CI/CD PIPELINE                            │
└────────────────────────────────────────────────────────────┘

GitHub Actions Example:
┌───────────────────────────────────┐
│ name: E2E Tests                   │
│ on: [push, pull_request]          │
│                                   │
│ jobs:                             │
│   test:                           │
│     runs-on: ubuntu-latest        │
│     steps:                        │
│       - Checkout code             │
│       - Setup Node.js             │
│       - Install dependencies      │
│       - Start backend (artisan)   │
│       - Start frontend (vite)     │
│       - Run Cypress               │
│       - Upload artifacts          │
└───────────────────────────────────┘

Benefits:
├─► Automated testing on every commit
├─► Catch regressions early
├─► Screenshot/video artifacts
└─► Parallel execution
```

## Debugging Workflow

```
┌────────────────────────────────────────────────────────────┐
│                  DEBUGGING STRATEGY                        │
└────────────────────────────────────────────────────────────┘

Step 1: RUN IN GUI MODE
  npm run cypress:open
  └─► Visual feedback
      Time-travel debugging

Step 2: ADD DEBUG POINTS
  cy.debug();        // Pause & inspect
  cy.pause();        // Manual step-through
  cy.log('Debug info');

Step 3: USE CONSOLE
  cy.get('element').then(console.log);

Step 4: TAKE SCREENSHOTS
  cy.screenshot('before-click');
  cy.get('button').click();
  cy.screenshot('after-click');

Step 5: CHECK NETWORK
  cy.intercept() logs in DevTools
  
Step 6: EXAMINE STATE
  cy.window().then((win) => {
    console.log(win.localStorage);
  });
```

---

**Architecture Version**: 1.0  
**Last Updated**: June 2026  
**Maintained by**: Forum Diskusi Team
