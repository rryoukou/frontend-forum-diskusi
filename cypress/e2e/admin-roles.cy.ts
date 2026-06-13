describe('Admin User Access Management Suite', () => {
  const LONG_TIMEOUT = { timeout: 25000 };

  beforeEach(() => {
    // 1. Session Login
    cy.session('admin-session', () => {
      cy.visit('/login');
      cy.get('input[type="email"]').clear().type('admin@forum.com');
      cy.get('input[type="password"]').clear().type('password');
      cy.get('button').contains(/sign in/i).click();
      cy.contains(/sign in/i, { timeout: 15000 }).should('not.exist');
    });

    // 2. Kunjungi halaman yang benar (berdasarkan screenshot kamu adalah User Access Management)
    // Sesuaikan URL ini dengan path yang sebenarnya, misal '/admin/users'
    cy.visit('/admin/users'); 
    
    // Tunggu sampai header utama muncul untuk memastikan halaman selesai loading
    cy.contains('User Access Management', LONG_TIMEOUT).should('be.visible');
  });

  it('should display the user table correctly', () => {
    // Memastikan tabel user muncul
    cy.get('table', LONG_TIMEOUT).should('be.visible');
    
    // Verifikasi ada user di dalam tabel (contoh: kirsten55 dari screenshot)
    cy.contains('kirsten55', LONG_TIMEOUT).should('be.visible');
    cy.contains('brown.jessie@example.com').should('be.visible');
  });

  it('should filter users by search term', () => {
    cy.get('input[placeholder*="Cari user"]').clear().type('nwhite');
    cy.contains('nwhite').should('be.visible');
    // Pastikan user lain yang tidak cocok hilang
    cy.contains('kirsten55').should('not.exist');
  });

  it('should trigger ban action', () => {
    // Stub prompt browser agar otomatis memberikan alasan
    cy.window().then((win) => {
      cy.stub(win, 'prompt').returns('Pelanggaran aturan forum');
    });

    // Klik tombol Ban pada baris pertama (kirsten55)
    cy.contains('Ban').first().click();
    
    // Verifikasi status berubah jadi Banned (sesuai logika di kode React kamu)
    cy.contains('Banned', LONG_TIMEOUT).should('be.visible');
  });

  it('should change role using dropdown', () => {
    // Cari baris user 'nwhite', ubah rolenya
    cy.contains('nwhite')
      .closest('tr')
      .find('select')
      .select('MODERATOR', { force: true });
    
    // Tunggu animasi role change selesai
    cy.contains('Moderator', LONG_TIMEOUT).should('be.visible');
  });
});