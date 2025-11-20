import React from 'react';

import {
  findPressableParent,
  fireEvent,
  reactNativeRender as render,
  screen,
} from '@/lib/test-utils';

import type { Incident } from '@/api/incidents/types';
import { createIncident, createUser } from '@/lib/mock-data-tests';
import { IncidentListCard } from './incident-card';

const mockUseUsersStore = jest.fn();

jest.mock('@/stores/users', () => ({
  __esModule: true,
  useUsersStore: () => mockUseUsersStore(),
}));

describe('IncidentListCard', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-10T10:00:00.000Z'));
    mockUseUsersStore.mockReturnValue({ users: [] });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  const renderCard = (incident: Incident, onPress = jest.fn()) =>
    render(<IncidentListCard incident={incident} onPress={onPress} />);

  it('renders incident details with mapped severity and time ago', () => {
    const incident = createIncident({
      name: 'Power outage',
      type: 'maintenance',
      createdAt: '2024-01-10T08:30:00.000Z',
      description: 'Generator failure at HQ',
      severity: undefined,
    });

    renderCard(incident);

    expect(screen.getByText('Power outage')).toBeTruthy();
    expect(screen.getByText('Generator failure at HQ')).toBeTruthy();
    expect(screen.getByText('Medium')).toBeTruthy();
    expect(screen.getByText('1 hour ago')).toBeTruthy();
  });

  it('uses reportedBy when provided, otherwise resolves from users store', () => {
    const reporterIncident = createIncident({
      reportedBy: 'Dispatcher Lee',
    });

    renderCard(reporterIncident);
    expect(screen.getByText('Dispatcher Lee')).toBeTruthy();

    const user = createUser({
      id: reporterIncident.createdBy,
      fullName: 'Agent K',
    });
    mockUseUsersStore.mockReturnValue({ users: [user] });

    renderCard({ ...reporterIncident, reportedBy: undefined });
    expect(screen.getByText('Agent K')).toBeTruthy();

    mockUseUsersStore.mockReturnValue({ users: [] });
    renderCard({
      ...reporterIncident,
      reportedBy: undefined,
      createdBy: 'unknown',
    });
    expect(screen.getByText('Unknown Reporter')).toBeTruthy();
  });

  it('calls onPress with incident when tapped', () => {
    const incident = createIncident({ name: 'Security breach' });
    const onPress = jest.fn();

    renderCard(incident, onPress);

    const pressable = findPressableParent(screen.getByText('Security breach'));
    fireEvent.press(pressable);

    expect(onPress).toHaveBeenCalledWith(incident);
  });
});
