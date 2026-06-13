# 🚀 Cypress Commands Cheatsheet

## Quick Commands

```bash
# Open Cypress GUI (Interactive)
npm run cypress:open

# Run all tests (Headless)
npm run cypress:run

# Run with browser visible
npm run test:e2e:headed

# Run specific test file
npx cypress run --spec "cypress/e2e/admin-dashboard.cy.ts"

# Run specific test in specific browser
npx cypress run --spec "cypress/e2e/admin-dashboard.cy.ts" --browser chrome

# Run tests with headed mode
npx cypress run --headed

# Run tests in specific browser
npx cypress run --browser firefox
npx cypress run --browser edge
npx cypress run --browser electron
```

## Custom Cypress Commands

### Authentication
```typescript
// Login as admin (quick)
cy.loginAsAdmin();

// Login with custom credentials
cy.login('user@example.com', 'password');
```

## Built-in Cypress Commands

### Navigation
```typescript
cy.visit('/admin/dashboard');
cy.go('back');
cy.go('forward');
cy.reload();
```

### Querying
```typescript
// By text
cy.contains('Admin Dashboard');
cy.contains('button', 'Save');

// By selector
cy.get('button');
cy.get('[data-testid="save-btn"]');
cy.get('.btn-primary');
cy.get('#username');

// By attribute
cy.get('[type="submit"]');
cy.get('[placeholder="Search..."]');

// First, last, eq
cy.get('li').first();
cy.get('li').last();
cy.get('li').eq(2);

// Within
cy.get('form').within(() => {
  cy.get('input[name="email"]').type('test@test.com');
});

// Find
cy.get('.card').find('.title');

// Parent, children
cy.get('button').parent();
cy.get('ul').children();
```

### Actions
```typescript
// Click
cy.get('button').click();
cy.get('button').click({ force: true });
cy.get('button').dblclick();
cy.get('button').rightclick();

// Type
cy.get('input').type('Hello World');
cy.get('input').type('{enter}');
cy.get('input').clear();

// Select
cy.get('select').select('Option 1');
cy.get('select').select([1, 2]);

// Check
cy.get('[type="checkbox"]').check();
cy.get('[type="checkbox"]').uncheck();
cy.get('[type="radio"]').check();

// Focus
cy.get('input').focus();
cy.get('input').blur();

// Scroll
cy.scrollTo(0, 500);
cy.scrollTo('bottom');
cy.get('.element').scrollIntoView();

// Trigger
cy.get('button').trigger('mouseover');
cy.get('input').trigger('change');
```

### Assertions
```typescript
// Should
cy.get('.title').should('be.visible');
cy.get('.title').should('not.be.visible');
cy.get('.title').should('exist');
cy.get('.title').should('not.exist');
cy.get('.title').should('have.text', 'Hello');
cy.get('.title').should('contain.text', 'Hell');
cy.get('.title').should('have.class', 'active');
cy.get('input').should('have.value', 'test');
cy.get('input').should('be.disabled');
cy.get('input').should('be.enabled');
cy.get('button').should('have.attr', 'type', 'submit');

// Multiple assertions
cy.get('.title')
  .should('be.visible')
  .and('contain.text', 'Hello')
  .and('have.class', 'active');

// Length
cy.get('li').should('have.length', 5);
cy.get('li').should('have.length.at.least', 3);
cy.get('li').should('have.length.at.most', 10);

// Custom callback
cy.get('table tbody tr').should(($rows) => {
  expect($rows).to.have.length(5);
  expect($rows.first()).to.contain('Admin');
});
```

### Waiting
```typescript
// Wait for time (avoid if possible)
cy.wait(1000);

// Wait for alias (preferred)
cy.intercept('GET', '/api/users').as('getUsers');
cy.visit('/admin');
cy.wait('@getUsers');

// Wait for element
cy.get('.loading').should('not.exist');
cy.get('.data').should('be.visible');

// Wait with timeout
cy.get('.slow-element', { timeout: 10000 }).should('be.visible');
```

### Network
```typescript
// Intercept GET
cy.intercept('GET', '/api/users').as('getUsers');

// Intercept POST
cy.intercept('POST', '/api/categories').as('createCategory');

// Mock response
cy.intercept('GET', '/api/users', {
  statusCode: 200,
  body: { data: [] }
}).as('getUsers');

// Mock error
cy.intercept('GET', '/api/users', {
  statusCode: 500,
  body: { message: 'Server Error' }
}).as('getUsersError');

// Delay response
cy.intercept('GET', '/api/users', (req) => {
  req.on('response', (res) => {
    res.setDelay(2000);
  });
});

// Wait and assert
cy.wait('@getUsers')
  .its('response.statusCode')
  .should('eq', 200);

cy.wait('@getUsers')
  .its('response.body.data')
  .should('have.length', 5);
```

### Storage
```typescript
// LocalStorage
cy.window().then((win) => {
  win.localStorage.setItem('token', 'abc123');
  win.localStorage.getItem('token');
  win.localStorage.removeItem('token');
  win.localStorage.clear();
});

// Directly
cy.clearLocalStorage();
cy.clearLocalStorage('token');

// SessionStorage
cy.window().then((win) => {
  win.sessionStorage.setItem('key', 'value');
});
```

### Window
```typescript
// URL
cy.url().should('include', '/admin');
cy.url().should('eq', 'http://localhost:5173/admin');

// Title
cy.title().should('contain', 'Admin Panel');

// Window object
cy.window().then((win) => {
  console.log(win);
});

// Viewport
cy.viewport(1280, 720);
cy.viewport('iphone-6');
cy.viewport('ipad-2', 'portrait');
```

### Screenshots & Videos
```typescript
// Screenshot
cy.screenshot();
cy.screenshot('my-screenshot');
cy.get('.component').screenshot();

// Videos are recorded automatically in cypress run mode
```

### Debugging
```typescript
// Debug
cy.debug();

// Pause
cy.pause();

// Log
cy.log('Custom log message');

// Console
cy.get('.element').then(console.log);

// Get & inspect
cy.get('.element').then(($el) => {
  console.log($el);
  debugger; // Browser debugger
});
```

### Utilities
```typescript
// Invoke
cy.get('.element').invoke('text').should('equal', 'Hello');
cy.get('.element').invoke('attr', 'href').should('contain', '/admin');

// Its (get property)
cy.wrap({ name: 'John' }).its('name').should('eq', 'John');

// Then (callback)
cy.get('.element').then(($el) => {
  const text = $el.text();
  expect(text).to.include('Admin');
});

// Wrap
cy.wrap('Hello').should('equal', 'Hello');
cy.wrap([1, 2, 3]).should('have.length', 3);

// Task (run Node code)
cy.task('log', 'Hello from Node');
```

## Test Organization

### Describe & It
```typescript
describe('Admin Dashboard', () => {
  it('should display title', () => {
    cy.visit('/admin/dashboard');
    cy.contains('Admin Dashboard').should('be.visible');
  });

  it('should show stats', () => {
    // Test code
  });
});
```

### Context (alias for describe)
```typescript
context('When logged in', () => {
  it('should show user menu', () => {
    // Test code
  });
});
```

### Nested Describe
```typescript
describe('Admin Categories', () => {
  describe('Category Creation', () => {
    it('should create category', () => {
      // Test code
    });
  });

  describe('Category Editing', () => {
    it('should edit category', () => {
      // Test code
    });
  });
});
```

### Hooks
```typescript
describe('Test Suite', () => {
  before(() => {
    // Runs once before all tests
  });

  beforeEach(() => {
    // Runs before each test
    cy.loginAsAdmin();
    cy.visit('/admin');
  });

  afterEach(() => {
    // Runs after each test
  });

  after(() => {
    // Runs once after all tests
  });

  it('test 1', () => {});
  it('test 2', () => {});
});
```

### Skip & Only
```typescript
// Skip test
it.skip('skipped test', () => {});

// Only run this test
it.only('only this test', () => {});

// Skip suite
describe.skip('skipped suite', () => {});

// Only run this suite
describe.only('only this suite', () => {});
```

## Aliases
```typescript
// Alias element
cy.get('form').as('myForm');
cy.get('@myForm').submit();

// Alias network request
cy.intercept('GET', '/api/users').as('getUsers');
cy.wait('@getUsers');

// Alias route
cy.intercept('/api/**').as('apiCalls');
```

## Fixtures
```typescript
// Load fixture
cy.fixture('admin.json').then((admin) => {
  cy.login(admin.email, admin.password);
});

// Use fixture in intercept
cy.intercept('GET', '/api/users', { fixture: 'users.json' });
```

## Environment Variables
```typescript
// Access env variable
cy.env('apiUrl'); // From cypress.env.json

// Set env variable
Cypress.env('apiUrl', 'http://localhost:8000');
```

## Configuration
```typescript
// Get config
Cypress.config('baseUrl');

// Set config (in test file, affects only that file)
Cypress.config('viewportWidth', 1920);
```

## Common Patterns

### Login Flow
```typescript
cy.visit('/login');
cy.get('input[name="email"]').type('admin@forum.com');
cy.get('input[name="password"]').type('password');
cy.get('button[type="submit"]').click();
cy.url().should('include', '/dashboard');
```

### Form Submission
```typescript
cy.get('form').within(() => {
  cy.get('input[name="name"]').type('Test');
  cy.get('input[name="email"]').type('test@test.com');
  cy.get('button[type="submit"]').click();
});
cy.contains('Success').should('be.visible');
```

### Table Testing
```typescript
cy.get('table tbody tr').should('have.length', 5);
cy.get('table tbody tr').first().within(() => {
  cy.get('td').eq(0).should('contain', 'Admin');
  cy.get('td').eq(1).should('contain', 'admin@test.com');
});
```

### Modal Testing
```typescript
cy.contains('button', 'Add Category').click();
cy.contains('Add New Category').should('be.visible');
cy.get('input[name="name"]').type('Test Category');
cy.contains('button', 'Create').click();
cy.contains('Add New Category').should('not.exist');
```

### Search Testing
```typescript
cy.get('input[placeholder="Search..."]').type('cardio');
cy.wait(500);
cy.get('.search-results').should('contain', 'Cardiovascular');
```

## Best Practices

```typescript
// ✅ GOOD: Chain commands
cy.get('.element')
  .should('be.visible')
  .click()
  .should('have.class', 'active');

// ❌ BAD: Breaking chain unnecessarily
cy.get('.element').should('be.visible');
cy.get('.element').click();
cy.get('.element').should('have.class', 'active');

// ✅ GOOD: Use aliases
cy.get('form').as('myForm');
cy.get('@myForm').submit();

// ❌ BAD: Repeat selectors
cy.get('form').submit();
cy.get('form').should('have.class', 'submitted');

// ✅ GOOD: Wait for API
cy.intercept('POST', '/api/save').as('save');
cy.contains('Save').click();
cy.wait('@save');

// ❌ BAD: Hard wait
cy.contains('Save').click();
cy.wait(2000);

// ✅ GOOD: Specific assertions
cy.get('button').should('have.attr', 'type', 'submit');

// ❌ BAD: Vague assertions
cy.get('button').should('exist');

// ✅ GOOD: Use data-testid
cy.get('[data-testid="submit-btn"]').click();

// ❌ BAD: Brittle selectors
cy.get('div > div > div > button.btn-primary').click();
```

---

**Quick Reference Card**  
Keep this handy while writing Cypress tests!

**Most Used Commands:**
- `cy.visit()` - Navigate
- `cy.get()` - Query element
- `cy.contains()` - Find by text
- `cy.click()` - Click element
- `cy.type()` - Type in input
- `cy.should()` - Assert
- `cy.wait()` - Wait
- `cy.intercept()` - Mock API

**Remember:**
- Commands are async and chainable
- Use `.then()` for synchronous operations
- Prefer `cy.intercept()` over `cy.wait(ms)`
- Tests should be independent
- Use descriptive test names
