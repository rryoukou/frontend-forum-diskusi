describe('E2E - Admin Login and Navigation', () => {
  beforeEach(() => {
    // 1. Kunjungi halaman login
    cy.visit('/login'); // Sesuaikan dengan path yang benar
  });

  it('seharusnya bisa login sebagai admin dan masuk ke dashboard', () => {
    // 2. Isi form login
    cy.get('input[type="email"]').type('admin@forum.com');
    cy.get('input[type="password"]').type('password'); // Jangan lupa sesuaikan
    
    // 3. Klik tombol Sign In
    cy.contains('Sign In').click();

    // 4. Verifikasi masuk ke home page (pastikan ada elemen unik setelah login)
    cy.url().should('include', '/'); 
    cy.contains('Recent Discussions').should('be.visible');

    // 5. Navigasi ke Admin Dashboard (klik menu sidebar)
    // Sesuaikan selector dengan elemen sidebar di screenshot
    cy.contains('Dashboard').click();

    // 6. Verifikasi berada di Dashboard Admin
    cy.url().should('include', '/admin');
    cy.contains('Admin Dashboard').should('be.visible');
    cy.contains('Registered Management Accounts').should('be.visible');
  });
});