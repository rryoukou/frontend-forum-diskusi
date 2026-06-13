describe('Admin Dashboard Flow', () => {
  // Kita buat variabel timeout 1 menit
  const LONG_TIMEOUT = { timeout: 60000 };

  beforeEach(() => {
    cy.session('admin-session', () => {
      cy.visit('/login');
      cy.get('input[type="email"]').clear().type('admin@forum.com');
      cy.get('input[type="password"]').clear().type('password');
      cy.get('button').contains(/sign in/i).click();
      
      // Tunggu login sukses
      cy.contains(/sign in/i, LONG_TIMEOUT).should('not.exist');
    });

    // 2. Kunjungi dashboard dengan timeout 1 menit
    cy.visit('/dashboard', LONG_TIMEOUT);
  });

  it('should wait for dashboard and table', () => {
    // Memastikan judul dashboard muncul dalam 1 menit
    cy.contains(/admin dashboard/i, LONG_TIMEOUT).should('be.visible');
    
    // Scroll ke tabel
    cy.contains(/registered management accounts/i, LONG_TIMEOUT)
      .scrollIntoView();
      
    // Memastikan tabel muncul dalam 1 menit
    cy.get('table', LONG_TIMEOUT).should('be.visible');
  });
});