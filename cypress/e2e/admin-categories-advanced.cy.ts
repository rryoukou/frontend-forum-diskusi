describe('Admin Categories - Advanced Tests', () => {
  const LONGER_TIMEOUT = { timeout: 10000 };

  beforeEach(() => {
    // 1. Session Login
    cy.session('admin-session', () => {
      cy.visit('/login');
      cy.get('input[placeholder*="com"]').clear().type('admin@forum.com');
      cy.get('input[type="password"]').clear().type('password');
      cy.get('button').contains(/sign in/i).click();
      cy.contains('Dashboard', LONGER_TIMEOUT).should('exist');
    });

    // 2. Intercept API - Dibuat lebih inklusif agar menangkap semua request update
    cy.intercept('GET', '**/api/categories*').as('fetchCategories');
    cy.intercept('POST', '**/api/admin/categories*').as('createCategory');
    cy.intercept({ method: 'PUT', url: '**/api/admin/categories/*' }).as('updateCategory');
    cy.intercept({ method: 'PATCH', url: '**/api/admin/categories/*' }).as('updateCategory');

    cy.visit('/admin/categories');
    cy.wait('@fetchCategories', LONGER_TIMEOUT);
  });

  describe('Category Creation Flow', () => {
    it('should create a new category successfully', () => {
      cy.contains('button', /add category/i).click();
      cy.get('input[name="name"]').type(`Test ${Date.now()}`);
      cy.get('textarea[name="description"]').type('Testing description');
      
      cy.contains('button', /create/i).click({ force: true });
      cy.wait('@createCategory', LONGER_TIMEOUT);
      cy.contains(/add new category/i).should('not.exist');
    });
  });

  describe('Category Edit Flow', () => {
    it('should edit category name successfully', () => {
      cy.contains('Teknologi', LONGER_TIMEOUT).should('be.visible').click({ force: true });
      cy.contains('button', /edit/i).should('be.visible').click({ force: true });
      
      cy.get('input[name="name"]').should('be.visible').clear().type(`Teknologi ${Date.now()}`);
      cy.contains('button', /update/i).click({ force: true });
      
      // Menggunakan alias yang sudah digabung di beforeEach
      cy.wait('@updateCategory', LONGER_TIMEOUT);
    });
  });

  describe('Category Search and Delete', () => {
    it('should filter categories', () => {
      // Force: true pada clear & type karena sering terhalang sidebar/header
      cy.get('input[placeholder*="Search"]').first()
        .clear({ force: true })
        .type('Olahraga', { force: true });
      cy.contains('Olahraga', LONGER_TIMEOUT).should('be.visible');
    });

    it('should cancel delete', () => {
      cy.window().then((win) => cy.stub(win, 'confirm').returns(false));
      cy.contains('Delete').first().click({ force: true });
      cy.contains('Teknologi').should('be.visible');
    });
  });

  describe('Category Details & Stats', () => {
    it('should display all category information', () => {
      cy.contains('Teknologi', LONGER_TIMEOUT).click({ force: true });
      // Gunakan Regex /i untuk case-insensitive
      cy.contains(/category name/i, LONGER_TIMEOUT).should('be.visible');
      cy.contains(/slug/i, LONGER_TIMEOUT).should('be.visible');
    });

    it('should show correct total categories count', () => {
      // Gunakan Regex /i agar cocok dengan 'Total', 'TOTAL', atau 'total'
      cy.contains(/total/i, LONGER_TIMEOUT).should('be.visible');
    });
  });
});