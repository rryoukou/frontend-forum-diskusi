describe('Admin Integration Tests', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it('should navigate between admin pages', () => {
    cy.visit('/admin/dashboard');
    cy.contains('Admin Dashboard').should('be.visible');
    
    cy.visit('/admin/categories');
    cy.contains('Manage Categories').should('be.visible');
    
    cy.visit('/admin/dashboard');
    cy.contains('Registered Management Accounts').should('be.visible');
  });

  it('should maintain login state across pages', () => {
    cy.visit('/admin/dashboard');
    cy.wait(1000);
    
    cy.window().then((win) => {
      const token = win.localStorage.getItem('token');
      expect(token).to.not.be.null;
    });
    
    cy.visit('/admin/categories');
    cy.wait(1000);
    
    cy.window().then((win) => {
      const token = win.localStorage.getItem('token');
      expect(token).to.not.be.null;
    });
  });

  it('should display consistent admin navbar across pages', () => {
    cy.visit('/admin/dashboard');
    cy.wait(500);
    cy.get('nav').should('exist');
    
    cy.visit('/admin/categories');
    cy.wait(500);
    cy.get('nav').should('exist');
  });

  it('should handle page reload correctly', () => {
    cy.visit('/admin/dashboard');
    cy.contains('Admin Dashboard').should('be.visible');
    
    cy.reload();
    cy.wait(1000);
    cy.contains('Admin Dashboard').should('be.visible');
  });

  it('should show loading states appropriately', () => {
    cy.intercept('GET', '**/api/admin/users', (req) => {
      req.on('response', (res) => {
        res.setDelay(1000);
      });
    }).as('getUsers');

    cy.visit('/admin/dashboard');
    
    cy.get('.skeleton-pulse').should('exist');
    
    cy.wait('@getUsers');
    cy.contains('Admin Dashboard').should('be.visible');
  });

  it('should handle API errors gracefully', () => {
    cy.intercept('GET', '**/api/admin/users', {
      statusCode: 500,
      body: { message: 'Internal Server Error' }
    }).as('getUsersError');

    cy.visit('/admin/dashboard');
    cy.wait('@getUsersError');
    
    cy.wait(2000);
  });
});
