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

    const dashboardBtn = screen.getByRole('link', { name: /back to dashboard/i });

    expect(dashboardBtn).toBeInTheDocument();
    expect(dashboardBtn).toHaveAttribute('href', '/dashboard');
  });
});
