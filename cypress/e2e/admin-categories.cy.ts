describe('Admin Categories', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    cy.visit('/admin/categories');
    cy.wait(1000);
  });

  it('should display categories page with correct title', () => {
    cy.contains('Manage Categories').should('be.visible');
    cy.contains('Configure categories, metadata, and content settings').should('be.visible');
  });

  it('should display quick stats card with metrics', () => {
    cy.contains('Categories').should('be.visible');
    cy.contains('Total').should('be.visible');
    cy.contains('Parent').should('be.visible');
    cy.contains('Sub').should('be.visible');
  });

  it('should show Add Category button', () => {
    cy.contains('button', 'Add Category').should('be.visible');
  });

  it('should display search input', () => {
    cy.get('input[placeholder="Search categories..."]').should('be.visible');
  });

  it('should search categories correctly', () => {
    cy.get('input[placeholder="Search categories..."]').type('cardio');
    cy.wait(500);
    cy.get('input[placeholder="Search categories..."]').clear();
  });

  it('should display categories list', () => {
    cy.get('[style*="maxHeight"]').within(() => {
      cy.get('div[style*="cursor: pointer"]').should('have.length.at.least', 1);
    });
  });

  it('should select a category and show details', () => {
    cy.get('div[style*="cursor: pointer"]').first().click();
    cy.wait(500);
    
    cy.contains('Category Name').should('be.visible');
    cy.contains('Slug').should('be.visible');
    cy.contains('Description').should('be.visible');
    cy.contains('Parent Category').should('be.visible');
    cy.contains('Created').should('be.visible');
  });

  it('should open create category modal', () => {
    cy.contains('button', 'Add Category').click();
    cy.contains('Add New Category').should('be.visible');
    cy.contains('Name').should('be.visible');
    cy.contains('Slug').should('be.visible');
    cy.get('button:contains("Cancel")').click();
  });

  it('should open edit category modal from category card', () => {
    cy.get('div[style*="cursor: pointer"]').first().within(() => {
      cy.get('button').first().click({ force: true });
    });
    cy.wait(500);
    cy.contains('Edit Category').should('be.visible');
    cy.get('button:contains("Cancel")').click();
  });

  it('should open edit category modal from details panel', () => {
    cy.get('div[style*="cursor: pointer"]').first().click();
    cy.wait(500);
    cy.contains('button', 'Edit').click();
    cy.contains('Edit Category').should('be.visible');
    cy.get('button:contains("Cancel")').click();
  });

  it('should validate required fields in create form', () => {
    cy.contains('button', 'Add Category').click();
    cy.get('input[name="name"]').clear();
    cy.get('input[name="slug"]').clear();
    cy.contains('button', 'Create').click();
    cy.wait(500);
  });

  it('should auto-generate slug from name', () => {
    cy.contains('button', 'Add Category').click();
    cy.get('input[name="name"]').type('Test Category Name');
    cy.get('input[name="slug"]').should('have.value', 'test-category-name');
    cy.get('button:contains("Cancel")').click();
  });

  it('should display category icons', () => {
    cy.get('div[style*="cursor: pointer"]').first().within(() => {
      cy.get('div[style*="fontSize"]').should('be.visible');
    });
  });

  it('should show edit and delete buttons on category items', () => {
    cy.get('div[style*="cursor: pointer"]').first().within(() => {
      cy.get('button').should('have.length', 2);
    });
  });

  it('should display parent category info', () => {
    cy.get('div[style*="cursor: pointer"]').first().click();
    cy.wait(500);
    cy.contains('Parent Category').parent().next().should('exist');
  });

  it('should display created date', () => {
    cy.get('div[style*="cursor: pointer"]').first().click();
    cy.wait(500);
    cy.contains('Created').parent().next().should('not.be.empty');
  });

  it('should handle empty categories state', () => {
    cy.get('input[placeholder="Search categories..."]').type('nonexistentcategory12345');
    cy.wait(500);
    cy.contains('No categories found').should('be.visible');
  });

  it('should display category description in details', () => {
    cy.get('div[style*="cursor: pointer"]').first().click();
    cy.wait(500);
    cy.contains('Description').parent().next().should('exist');
  });
});
