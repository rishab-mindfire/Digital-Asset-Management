import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as dashboardService from '../../services/dasboard.service';
import { mockChartData } from '../../../test/mock/mockData';
import { mockCardData } from '../../../test/mock/mockData';

// Mock the services
vi.mock('../../services/dasboard.service', () => ({
  getChartData: vi.fn(),
  getCardData: vi.fn(),
}));

// Mock the Highcharts React wrapper
vi.mock('highcharts-react-official', () => ({
  HighchartsReact: () => <div data-testid="mock-chart" />,
}));

describe('AssetDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders and displays data from services', async () => {
    // Setup Mock Data

    vi.mocked(dashboardService.getChartData).mockResolvedValue(mockChartData);
    vi.mocked(dashboardService.getCardData).mockResolvedValue(mockCardData);

    //  Import component dynamically to avoid early Highcharts execution
    const Dashboard = (await import('./Dashboard')).default;

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    // Assertions
    expect(screen.getByText(/Asset Overview Dashboard/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('Low')).toBeInTheDocument();
    });

    expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
  });
});
