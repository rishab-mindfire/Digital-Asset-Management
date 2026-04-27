import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PageNotFound from './PageNotFound';
import '@testing-library/jest-dom';

describe('Page not found ', () => {
  it('Should have project button', () => {
    render(
      <MemoryRouter>
        <PageNotFound />
      </MemoryRouter>,
    );

    const projectsBtn = screen.getByRole('link', { name: /back to projects/i });

    expect(projectsBtn).toBeInTheDocument();
    expect(projectsBtn).toHaveAttribute('href', '/projects');
  });
});
