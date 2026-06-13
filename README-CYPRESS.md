# Cypress E2E Testing untuk Admin Panel

## Setup Lengkap ✅

Cypress sudah di-setup untuk testing halaman admin dengan konfigurasi berikut:

### File Structure
```
frontend-forum-diskusi/
├── cypress/
│   ├── e2e/
│   │   ├── admin-dashboard.cy.ts
│   │   └── admin-categories.cy.ts
│   ├── fixtures/
│   │   └── admin.json
│   ├── support/
│   │   ├── commands.ts
│   │   └── e2e.ts
│   └── tsconfig.json
├── cypress.config.ts
└── cypress.env.json
```

## Cara Menjalankan Test

### 1. Pastikan Backend Running
```bash
cd backend-forum-diskusi
php artisan serve
```

### 2. Jalankan Frontend
```bash
cd frontend-forum-diskusi
npm run dev
```

### 3. Jalankan Cypress

#### Mode Interactive (Recommended untuk Development)
```bash
npm run cypress:open
```
Ini akan membuka Cypress Test Runner GUI dimana kamu bisa:
- Memilih browser
- Melihat test berjalan secara visual
- Debug dengan mudah

#### Mode Headless (Untuk CI/CD)
```bash
npm run cypress:run
```

#### Mode Headless dengan Browser Visible
```bash
npm run test:e2e:headed
```

## Test Coverage

### Admin Dashboard (`admin-dashboard.cy.ts`)
- ✅ Display admin dashboard dengan title yang benar
- ✅ Display semua 4 stats cards (Total Users, Admins, Moderators, Reports)
- ✅ Validasi stats menampilkan angka
- ✅ Display user management table
- ✅ Verifikasi user roles ditampilkan dengan benar
- ✅ Verifikasi user status (Active/Banned)
- ✅ Validasi Total Users exclude banned users
- ✅ Test responsive layout

### Admin Categories (`admin-categories.cy.ts`)
- ✅ Display categories page dengan title yang benar
- ✅ Display quick stats (Total, Parent, Sub)
- ✅ Test Add Category button
- ✅ Test search functionality
- ✅ Display dan select categories
- ✅ Show category details panel
- ✅ Test create category modal
- ✅ Test edit category modal (dari card dan detail panel)
- ✅ Validasi required fields
- ✅ Test auto-generate slug dari name
- ✅ Display category icons
- ✅ Test edit/delete buttons
- ✅ Display parent category info
- ✅ Display created date
- ✅ Handle empty state
- ✅ Display category description

## Custom Commands

### `cy.login(email, password)`
Login dengan credentials tertentu
```typescript
cy.login('admin@gmail.com', 'Admin123');
```

### `cy.loginAsAdmin()`
Quick login sebagai admin (menggunakan credentials dari TEST_ACCOUNTS.txt)
```typescript
cy.loginAsAdmin();
```

## Konfigurasi

### `cypress.config.ts`
- Base URL: `http://localhost:5173`
- Viewport: 1280x720
- Video: disabled (untuk performa)
- Screenshot on failure: enabled

### `cypress.env.json`
- API URL: `http://localhost:8000`

⚠️ **Note**: File `cypress.env.json` sudah di-ignore di git untuk keamanan

## Tips Testing

1. **Gunakan `cy.wait()` dengan bijak** - Sudah ada di test untuk API calls
2. **Test harus independent** - Setiap test login ulang dan tidak depend sama test lain
3. **Gunakan data-testid** (optional) - Untuk selector yang lebih stable
4. **Watch test hasil** - Lihat di `cypress/videos` dan `cypress/screenshots`

## Troubleshooting

### Test gagal karena timeout
- Pastikan backend dan frontend running
- Check API URL di `cypress.env.json`
- Increase timeout di test dengan `cy.wait()`

### Login gagal
- Pastikan credentials di `cypress/fixtures/admin.json` benar
- Check token storage di `cypress/support/commands.ts`

### Element tidak ditemukan
- Gunakan `cy.wait()` sebelum interact dengan element
- Check selector dengan Cypress Selector Playground

## Next Steps

Kamu bisa menambahkan test untuk:
- ❌ Create new category
- ❌ Edit existing category
- ❌ Delete category
- ❌ Ban/unban users (jika ada UI nya)
- ❌ Change user roles
- ❌ Search users

Happy Testing! 🚀
