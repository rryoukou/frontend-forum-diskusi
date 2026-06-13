# 🧪 Testing Guide - Cypress E2E

## Quick Start

### 1️⃣ Install Dependencies (Jika Belum)
```bash
cd frontend-forum-diskusi
npm install
```

### 2️⃣ Jalankan Backend
```bash
cd backend-forum-diskusi
php artisan serve
```
Backend akan berjalan di `http://localhost:8000`

### 3️⃣ Jalankan Frontend (Terminal Baru)
```bash
cd frontend-forum-diskusi
npm run dev
```
Frontend akan berjalan di `http://localhost:5173`

### 4️⃣ Jalankan Cypress

#### Option A: Interactive Mode (Recommended) 🎯
```bash
npm run cypress:open
```
- Akan membuka Cypress GUI
- Pilih "E2E Testing"
- Pilih browser (Chrome/Firefox/Edge)
- Klik test file yang ingin dijalankan
- Watch test berjalan secara visual

#### Option B: Headless Mode (Fast) ⚡
```bash
npm run cypress:run
```
Test akan berjalan di background dan hasilnya muncul di terminal

#### Option C: Headless dengan Browser Visible 👀
```bash
npm run test:e2e:headed
```

## 📋 Available Tests

### 1. Admin Dashboard Tests
**File**: `cypress/e2e/admin-dashboard.cy.ts`

Test Coverage:
- ✅ Dashboard title dan description
- ✅ 4 Stats cards (Total Users, Admins, Moderators, Reports)  
- ✅ Numeric values di stats
- ✅ User management table
- ✅ User roles display
- ✅ User status (Active/Banned)
- ✅ Total users exclude banned users
- ✅ Responsive layout

**Total**: 10 test cases

### 2. Admin Categories Tests
**File**: `cypress/e2e/admin-categories.cy.ts`

Test Coverage:
- ✅ Categories page title
- ✅ Quick stats (Total, Parent, Sub)
- ✅ Add Category button
- ✅ Search functionality
- ✅ Categories list
- ✅ Select category & show details
- ✅ Create category modal
- ✅ Edit category modal (2 ways)
- ✅ Form validation
- ✅ Auto-generate slug
- ✅ Category icons
- ✅ Edit/Delete buttons
- ✅ Parent category info
- ✅ Created date
- ✅ Empty state handling
- ✅ Category description

**Total**: 17 test cases

### 3. Integration Tests
**File**: `cypress/e2e/admin-integration.cy.ts`

Test Coverage:
- ✅ Navigation between pages
- ✅ Login state persistence
- ✅ Consistent navbar
- ✅ Page reload handling
- ✅ Loading states
- ✅ API error handling

**Total**: 6 test cases

## 🎯 Test Results

Run semua test dengan:
```bash
npm run test:e2e
```

Expected Output:
```
  Admin Dashboard                                                    
    ✓ should display admin dashboard with correct title
    ✓ should display all 4 stats cards
    ✓ should show stats with numeric values
    ✓ should display user management table
    ✓ should show users in the table
    ✓ should display user roles correctly
    ✓ should display user status (Active or Banned)
    ✓ should show correct total user count excluding banned users
    ✓ should have responsive layout for stats cards

  Admin Categories                                                   
    ✓ should display categories page with correct title
    ✓ should display quick stats card with metrics
    ... (dan seterusnya)

  33 passing (45s)
```

## 🔐 Test Credentials

**Admin Account**:
- Email: `admin@forum.com`
- Password: `password`

Credentials ini sudah di-configure di:
- `cypress/fixtures/admin.json`
- `cypress/support/commands.ts`

## 🛠️ Custom Commands

Tersedia custom commands untuk mempermudah testing:

### `cy.loginAsAdmin()`
Quick login sebagai admin
```typescript
cy.loginAsAdmin();
cy.visit('/admin/dashboard');
```

### `cy.login(email, password)`
Login dengan credentials custom
```typescript
cy.login('mod@forum.com', 'password');
cy.visit('/moderator/dashboard');
```

## 📁 File Structure

```
frontend-forum-diskusi/
├── cypress/
│   ├── e2e/                          # Test files
│   │   ├── admin-dashboard.cy.ts     # Dashboard tests
│   │   ├── admin-categories.cy.ts    # Categories tests
│   │   └── admin-integration.cy.ts   # Integration tests
│   ├── fixtures/                     # Test data
│   │   └── admin.json                # Admin credentials
│   ├── support/                      # Support files
│   │   ├── commands.ts               # Custom commands
│   │   ├── e2e.ts                    # E2E config
│   │   └── tsconfig.json             # TypeScript config
│   └── downloads/                    # Downloaded files (gitignored)
├── cypress.config.ts                 # Main config
├── cypress.env.json                  # Environment variables
└── package.json                      # NPM scripts
```

## ⚙️ Configuration

### `cypress.config.ts`
```typescript
{
  baseUrl: 'http://localhost:5173',
  viewportWidth: 1280,
  viewportHeight: 720,
  video: false,                      // Disable untuk performa
  screenshotOnRunFailure: true       // Ambil screenshot saat fail
}
```

### `cypress.env.json`
```json
{
  "apiUrl": "http://localhost:8000"
}
```

## 🐛 Troubleshooting

### Problem: Test gagal dengan timeout
**Solution**:
- Pastikan backend running di `http://localhost:8000`
- Pastikan frontend running di `http://localhost:5173`
- Check API endpoint di `cypress.env.json`

### Problem: Login gagal
**Solution**:
- Verify credentials di `cypress/fixtures/admin.json`
- Check backend database seeded dengan `php artisan db:seed`

### Problem: Element tidak ditemukan
**Solution**:
- Tambahkan `cy.wait(1000)` sebelum interact
- Gunakan Cypress Selector Playground untuk cari selector yang lebih baik
- Check apakah component sudah render

### Problem: Test flaky (kadang pass kadang fail)
**Solution**:
- Tambahkan explicit waits: `cy.wait(500)`
- Gunakan `cy.intercept()` untuk wait API response
- Pastikan data test consistent

## 📊 Best Practices

1. **Test Independence** - Setiap test harus independent, jangan depend test lain
2. **Clean Data** - Reset state dengan `beforeEach()`
3. **Descriptive Names** - Gunakan deskripsi test yang jelas
4. **Wait for Elements** - Gunakan `should('be.visible')` sebelum interact
5. **Avoid Hard Waits** - Prefer `cy.intercept()` daripada `cy.wait(5000)`

## 🚀 Next Steps

Tambahan test yang bisa dibuat:
- [ ] Create new category (full flow)
- [ ] Edit category (full flow)
- [ ] Delete category dengan confirmation
- [ ] Ban/Unban users (jika ada UI)
- [ ] Change user roles (jika editable)
- [ ] Search users functionality
- [ ] Admin roles page tests
- [ ] Pagination tests (jika ada)
- [ ] Form validation edge cases

## 📚 Resources

- [Cypress Docs](https://docs.cypress.io/)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Custom Commands](https://docs.cypress.io/api/cypress-api/custom-commands)

Happy Testing! 🎉
