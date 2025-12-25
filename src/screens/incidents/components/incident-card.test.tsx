import React from 'react';

import {
  findPressableParent,
  fireEvent,
  reactNativeRender as render,
  screen,
} from '@/lib/test-utils';

import type { Incident } from '@/api/incidents/types';
import { createIncident, createUser } from '@/lib/mock-data-tests';
import { useUsersStore } from '@/stores/users';
import { IncidentListCard } from './incident-card';



jest.mock('@/stores/users', () => ({
  useUsersStore: jest.fn(),
}));

describe('IncidentListCard', () => {
  const mockUsers = [
    createUser({
      id: 'user-1',
      fullName: 'John Doe',
      username: 'johndoe',
    }),
    createUser({
      id: 'user-2',
      fullName: 'Jane Smith',
      username: 'janesmith',
    }),
  ];

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-10T10:00:00.000Z'));
    
    // Mock useUsersStore with proper selector handling
    (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      if (selector) {
        return selector({ users: mockUsers });
      }
      return { users: mockUsers };
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  const renderCard = (incident: Incident, onPress = jest.fn()) =>
    render(<IncidentListCard incident={incident} onPress={onPress} />);

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      const incident = createIncident({ name: 'Test Incident' });
      const { toJSON } = renderCard(incident);
      expect(toJSON()).toBeTruthy();
    });

    it('renders incident name', () => {
      const incident = createIncident({ name: 'Power Outage' });
      renderCard(incident);
      expect(screen.getByText('Power Outage')).toBeTruthy();
    });

    it('renders incident description when provided', () => {
      const incident = createIncident({
        name: 'Fire Alert',
        description: 'Building 5, Floor 3',
      });
      renderCard(incident);
      expect(screen.getByText('Building 5, Floor 3')).toBeTruthy();
    });

    it('does not render location section when description is missing', () => {
      const incident = createIncident({
        name: 'Test',
        description: undefined,
      });
      renderCard(incident);
      expect(screen.queryByText('Location')).toBeNull();
    });
  });

  describe('Severity Display', () => {
    it('uses provided severity when available', () => {
      const incident = createIncident({
        name: 'High Priority Issue',
        severity: 'high',
      });
      renderCard(incident);
      expect(screen.getByText('High')).toBeTruthy();
    });

    it('maps incident type to severity when severity not provided', () => {
      const incident = createIncident({
        name: 'Technical Failure',
        type: 'technical_failure',
        severity: undefined,
      });
      renderCard(incident);
      // technical_failure maps to medium severity
      expect(screen.getByText('Medium')).toBeTruthy();
    });

    it('handles different severity levels', () => {
      const levels = [
        { severity: 'low' as const, label: 'Low' },
        { severity: 'medium' as const, label: 'Medium' },
        { severity: 'high' as const, label: 'High' },
      ];

      levels.forEach(({ severity, label }) => {
        const incident = createIncident({ name: 'Test', severity });
        renderCard(incident);
        expect(screen.getByText(label)).toBeTruthy();
      });
    });
  });

  describe('Reporter Name Display', () => {
    it('uses reportedBy when provided', () => {
      const incident = createIncident({
        name: 'Test',
        reportedBy: 'Dispatcher Lee',
      });
      renderCard(incident);
      expect(screen.getByText('Dispatcher Lee')).toBeTruthy();
    });

    it('resolves user from store when reportedBy not provided', () => {
      const incident = createIncident({
        name: 'Test',
        createdBy: 'user-1',
        reportedBy: undefined,
      });
      renderCard(incident);
      expect(screen.getByText('John Doe')).toBeTruthy();
    });

    it('uses username when fullName not available', () => {
      const userWithoutFullName = createUser({
        id: 'user-3',
        fullName: undefined,
        username: 'testuser',
      });

      (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        if (selector) {
          return selector({ users: [userWithoutFullName] });
        }
        return { users: [userWithoutFullName] };
      });

      const incident = createIncident({
        name: 'Test',
        createdBy: 'user-3',
        reportedBy: undefined,
      });
      renderCard(incident);
      expect(screen.getByText('testuser')).toBeTruthy();
    });

    it('shows "Unknown User" when user has no fullName or username', () => {
      const userWithNoName = createUser({
        id: 'user-4',
        fullName: undefined,
        username: undefined,
      });

      (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        if (selector) {
          return selector({ users: [userWithNoName] });
        }
        return { users: [userWithNoName] };
      });

      const incident = createIncident({
        name: 'Test',
        createdBy: 'user-4',
        reportedBy: undefined,
      });
      renderCard(incident);
      expect(screen.getByText('Unknown User')).toBeTruthy();
    });

    it('shows "Unknown Reporter" when user not found in store', () => {
      (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        if (selector) {
          return selector({ users: [] });
        }
        return { users: [] };
      });

      const incident = createIncident({
        name: 'Test',
        createdBy: 'unknown-user',
        reportedBy: undefined,
      });
      renderCard(incident);
      expect(screen.getByText('Unknown Reporter')).toBeTruthy();
    });

    it('shows "Unknown Reporter" when createdBy is missing', () => {
      const incident = createIncident({
        name: 'Test',
        createdBy: undefined,
        reportedBy: undefined,
      });
      renderCard(incident);
      expect(screen.getByText('Unknown Reporter')).toBeTruthy();
    });
  });

  describe('Time Formatting', () => {
    it('shows "Just now" for incidents less than 1 minute old', () => {
      const incident = createIncident({
        name: 'Test',
        createdAt: '2024-01-10T09:59:30.000Z', // 30 seconds ago
      });
      renderCard(incident);
      expect(screen.getByText('Just now')).toBeTruthy();
    });

    it('shows minutes ago for incidents less than 1 hour old', () => {
      const incident = createIncident({
        name: 'Test',
        createdAt: '2024-01-10T09:30:00.000Z', // 30 minutes ago
      });
      renderCard(incident);
      expect(screen.getByText('30 min ago')).toBeTruthy();
    });

    it('shows hours ago for incidents less than 24 hours old', () => {
      const incident = createIncident({
        name: 'Test',
        createdAt: '2024-01-10T08:30:00.000Z', // 1.5 hours ago
      });
      renderCard(incident);
      expect(screen.getByText('1 hour ago')).toBeTruthy();
    });

    it('shows plural hours for multiple hours', () => {
      const incident = createIncident({
        name: 'Test',
        createdAt: '2024-01-10T07:00:00.000Z', // 3 hours ago
      });
      renderCard(incident);
      expect(screen.getByText('3 hours ago')).toBeTruthy();
    });

    it('shows days ago for incidents more than 24 hours old', () => {
      const incident = createIncident({
        name: 'Test',
        createdAt: '2024-01-09T10:00:00.000Z', // 1 day ago
      });
      renderCard(incident);
      expect(screen.getByText('1 day ago')).toBeTruthy();
    });

    it('shows plural days for multiple days', () => {
      const incident = createIncident({
        name: 'Test',
        createdAt: '2024-01-07T10:00:00.000Z', // 3 days ago
      });
      renderCard(incident);
      expect(screen.getByText('3 days ago')).toBeTruthy();
    });
  });

  describe('Interaction', () => {
    it('calls onPress with incident when tapped', () => {
      const incident = createIncident({ name: 'Security Breach' });
      const onPress = jest.fn();

      renderCard(incident, onPress);

      const pressable = findPressableParent(screen.getByText('Security Breach'));
      fireEvent.press(pressable);

      expect(onPress).toHaveBeenCalledWith(incident);
    });

    it('does not crash when onPress is not provided', () => {
      const incident = createIncident({ name: 'Test' });
      renderCard(incident, undefined);

      const pressable = findPressableParent(screen.getByText('Test'));
      fireEvent.press(pressable);

      // Should not crash
      expect(screen.getByText('Test')).toBeTruthy();
    });

    it('handles multiple presses', () => {
      const incident = createIncident({ name: 'Test' });
      const onPress = jest.fn();

      renderCard(incident, onPress);

      const pressable = findPressableParent(screen.getByText('Test'));
      fireEvent.press(pressable);
      fireEvent.press(pressable);
      fireEvent.press(pressable);

      expect(onPress).toHaveBeenCalledTimes(3);
    });
  });

  describe('Static Labels', () => {
    it('renders "Reported by" label', () => {
      const incident = createIncident({ name: 'Test' });
      renderCard(incident);
      expect(screen.getByText('Reported by')).toBeTruthy();
    });

    it('renders "Reported at" label', () => {
      const incident = createIncident({ name: 'Test' });
      renderCard(incident);
      expect(screen.getByText('Reported at')).toBeTruthy();
    });

    it('renders "Location" label when description exists', () => {
      const incident = createIncident({
        name: 'Test',
        description: 'Some location',
      });
      renderCard(incident);
      expect(screen.getByText('Location')).toBeTruthy();
    });
  });

  describe('Theme Integration', () => {
    it('renders with theme styles', () => {
      const incident = createIncident({ name: 'Test' });
      const { toJSON } = renderCard(incident);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty incident name', () => {
      const incident = createIncident({ name: '' });
      const { toJSON } = renderCard(incident);
      expect(toJSON()).toBeTruthy();
    });

    it('handles very long incident name', () => {
      const incident = createIncident({
        name: 'Very Long Incident Name That Should Be Truncated Or Wrapped Properly In The UI'.repeat(3),
      });
      const { toJSON } = renderCard(incident);
      expect(toJSON()).toBeTruthy();
    });

    it('handles very long description', () => {
      const incident = createIncident({
        name: 'Test',
        description: 'Very long description '.repeat(20),
      });
      const { toJSON } = renderCard(incident);
      expect(toJSON()).toBeTruthy();
    });

    it('handles re-render without errors', () => {
      const incident = createIncident({ name: 'Test' });
      const { rerender } = renderCard(incident);
      rerender(<IncidentListCard incident={incident} />);
      expect(screen.getByText('Test')).toBeTruthy();
    });

    it('handles empty users store', () => {
      (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        if (selector) {
          return selector({ users: [] });
        }
        return { users: [] };
      });

      const incident = createIncident({ name: 'Test', createdBy: 'some-user' });
      const { toJSON } = renderCard(incident);
      expect(toJSON()).toBeTruthy();
      expect(screen.getByText('Unknown Reporter')).toBeTruthy();
    });
  });

  describe('Component Structure', () => {
    it('maintains consistent structure', () => {
      const incident = createIncident({ name: 'Test' });
      const { toJSON } = renderCard(incident);
      expect(toJSON()).toBeTruthy();
    });

    it('has TouchableOpacity wrapper', () => {
      const incident = createIncident({ name: 'Test' });
      const { root } = renderCard(incident);
      const touchables = root.findAllByType('TouchableOpacity');
      expect(touchables.length).toBeGreaterThan(0);
    });
  });
});
