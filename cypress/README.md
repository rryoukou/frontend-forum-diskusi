# 🧪 Cypress E2E Testing Suite

## Overview

Comprehensive E2E testing suite untuk Admin Panel menggunakan Cypress.

## 📊 Test Coverage Summary

### Test Files (4 files)
1. **admin-dashboard.cy.ts** - 10 tests
2. **admin-categories.cy.ts** - 17 tests  
3. **admin-integration.cy.ts** - 6 tests
4. **admin-categories-advanced.cy.ts** - 19 tests (advanced scenarios)

**Total: 52 test cases**

## 🎯 Features Tested

### Admin Dashboard ✅
- Stats cards display (Total Users, Admins, Moderators, Reports)
- User management table
- User roles and status
- Banned users exclusion
- Responsive layout

### Admin Categories ✅
- Category CRUD operations
- Search and filtering
- Parent-child relationships
- Form validation
- Auto-slug generation
- Loading states
- Empty states

### Integration ✅
- Cross-page navigation
- Authentication persistence
- API error handling
- Loading states

## 🚀 Quick Commands

```bash
# Open Cypress GUI
npm run cypress:open

# Run all tests (headless)
npm run cypress:run

# Run with browser visible
npm run test:e2e:headed

# Run specific test file
npx cypress run --spec "cypress/e2e/admin-dashboard.cy.ts"
```

## 📁 Structure

```
cypress/
├── e2e/                              # Test files
│   ├── admin-dashboard.cy.ts         # 10 tests - Dashboard basics
│   ├── admin-categories.cy.ts        # 17 tests - Categories basics
│   ├── admin-integration.cy.ts       # 6 tests - Integration
│   └── admin-categories-advanced.cy.ts # 19 tests - Advanced scenarios
├── fixtures/
│   └── admin.json                    # Test credentials
├── support/
│   ├── commands.ts                   # Custom commands
│   ├── e2e.ts                        # Setup
│   └── tsconfig.json                 # TS config
└── README.md                         # This file
```

## 🔧 Custom Commands

### `cy.loginAsAdmin()`
Login sebagai admin dengan credentials dari TEST_ACCOUNTS.txt

```typescript
cy.loginAsAdmin();
cy.visit('/admin/dashboard');
```

### `cy.login(email, password)`
Login dengan custom credentials

```typescript
cy.login('mod@forum.com', 'password');
```

## 🧩 Test Scenarios

### Basic Scenarios
- Page rendering
- Element visibility
- Data display
- Navigation

### Intermediate Scenarios  
- Form submission
- Search functionality
- CRUD operations
- State management

### Advanced Scenarios
- API mocking
- Error handling
- Race conditions
- Complex user flows

## 📈 Running Tests in CI/CD

### GitHub Actions Example
```yaml
- name: E2E Tests
  run: |
    npm run dev &
    npm run test:e2e
```

### GitLab CI Example
```yaml
test:
  script:
    - npm install
    - npm run dev &
    - npm run test:e2e
```

## 🐛 Debugging Tips

### 1. Use Cypress GUI
```bash
npm run cypress:open
```
- Visual test runner
- Time-travel debugging
- Selector playground

### 2. Add Debug Points
```typescript
cy.debug();
cy.pause();
```

### 3. Console Logs
```typescript
cy.get('element').then(($el) => {
  console.log($el);
});
```

### 4. Screenshots
```typescript
cy.screenshot('my-screenshot');
```

## 📋 Test Checklist

Before committing:
- [ ] All tests passing
- [ ] No console errors
- [ ] Proper waits (avoid hard waits)
- [ ] Descriptive test names
- [ ] Cleanup in afterEach()
- [ ] No flaky tests

## 🎓 Best Practices Used

1. **Page Object Pattern** - Reusable selectors
2. **API Intercepting** - Mock API calls
3. **Custom Commands** - DRY principle
4. **Proper Waits** - cy.intercept() over cy.wait()
5. **Data Attributes** - Stable selectors
6. **Test Independence** - Each test standalone
7. **Descriptive Names** - Self-documenting tests
8. **Error Screenshots** - Auto-capture failures

## 📚 Resources

- [Cypress Docs](https://docs.cypress.io/)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [API Reference](https://docs.cypress.io/api/table-of-contents)

## 🤝 Contributing

Menambah test baru:
1. Buat file di `cypress/e2e/`
2. Follow naming convention: `feature-name.cy.ts`
3. Group related tests dengan `describe()`
4. Use `beforeEach()` untuk setup
5. Clear state di `afterEach()` jika perlu

---

**Maintained by**: Forum Diskusi Team  
**Last Updated**: June 2026
