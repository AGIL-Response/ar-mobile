import * as React from 'react';
import { ScrollView, View } from 'react-native';

import type {
  CreateIncidentRequest,
  IncidentCategory,
  IncidentSeverity,
  IncidentStatus,
} from '@/api/ims/types';
import { Button, Input, Select, showError } from '@/components/ui';
import useAuthStore from '@/stores/auth';
import { useIncidentStore } from '@/stores/incident';

const CATEGORY_OPTIONS = [
  { label: 'Others', value: 'OTHERS' },
  { label: 'Security', value: 'SECURITY' },
  { label: 'Operational', value: 'OPERATIONAL' },
  { label: 'Technical', value: 'TECHNICAL' },
  { label: 'Performance', value: 'PERFORMANCE' },
];
const SEVERITY_OPTIONS = [
  { label: 'Minimal', value: 'MINIMAL' },
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
  { label: 'Critical', value: 'CRITICAL' },
];
const STATUS_OPTIONS = [
  { label: 'New', value: 'NEW' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Resolved', value: 'RESOLVED' },
];

type Props = {
  onSuccess?: () => void;
  initialLocation?: [number, number];
};

function IncidentDetailsFields({
  formData,
  setFormData,
}: {
  formData: CreateIncidentRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateIncidentRequest>>;
}) {
  const lat = formData.location?.[0]?.toString() || '';
  const lon = formData.location?.[1]?.toString() || '';
  return (
    <>
      <Input
        label="Incident Name"
        value={formData.name}
        onChangeText={(text) =>
          setFormData((prev) => ({ ...prev, name: text }))
        }
      />
      <Input
        label="Description"
        value={formData.description}
        onChangeText={(text) =>
          setFormData((prev) => ({ ...prev, description: text }))
        }
        multiline
        numberOfLines={4}
      />
      <Input
        label="Latitude"
        value={lat}
        keyboardType="numeric"
        onChangeText={(text) => {
          const latitude = parseFloat(text);
          setFormData((prev) => ({
            ...prev,
            location: [
              isNaN(latitude) ? undefined : latitude,
              prev.location?.[1] ?? undefined,
            ] as [number, number],
          }));
        }}
      />
      <Input
        label="Longitude"
        value={lon}
        keyboardType="numeric"
        onChangeText={(text) => {
          const longitude = parseFloat(text);
          setFormData((prev) => ({
            ...prev,
            location: [
              prev.location?.[0] ?? undefined,
              isNaN(longitude) ? undefined : longitude,
            ] as [number, number],
          }));
        }}
      />
      <Input
        label="Reported By"
        value={formData.reported_by}
        onChangeText={(text) =>
          setFormData((prev) => ({ ...prev, reported_by: text }))
        }
      />
      <Input label="Reported on" value={formData.date || ''} editable={false} />
    </>
  );
}

function IncidentClassificationFields({
  formData,
  setFormData,
}: {
  formData: CreateIncidentRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateIncidentRequest>>;
}) {
  return (
    <>
      <Select
        label="Category"
        value={formData.type}
        onSelect={(value) =>
          setFormData((prev) => ({ ...prev, type: value as IncidentCategory }))
        }
        options={CATEGORY_OPTIONS}
      />
      <Select
        label="Severity"
        value={formData.severity}
        onSelect={(value) =>
          setFormData((prev) => ({
            ...prev,
            severity: value as IncidentSeverity,
          }))
        }
        options={SEVERITY_OPTIONS}
      />
      <Select
        label="Status"
        value={formData.status}
        onSelect={(value) =>
          setFormData((prev) => ({ ...prev, status: value as IncidentStatus }))
        }
        options={STATUS_OPTIONS}
      />
    </>
  );
}

function IncidentForm({
  formData,
  setFormData,
  onSubmit,
  isLoading,
}: {
  formData: CreateIncidentRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateIncidentRequest>>;
  onSubmit: () => void;
  isLoading: boolean;
}) {
  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-1 space-y-4 p-4">
        <IncidentDetailsFields formData={formData} setFormData={setFormData} />
        <IncidentClassificationFields
          formData={formData}
          setFormData={setFormData}
        />
        <Button
          onPress={onSubmit}
          loading={isLoading}
          className="mt-4"
          label="Create Incident"
        />
        <View style={{ height: 50 }} />
      </View>
    </ScrollView>
  );
}

export function CreateIncidentForm({ onSuccess, initialLocation }: Props) {
  const username = useAuthStore.getState().user?.username || '';

  const { actions, isLoading } = useIncidentStore();
  const [formData, setFormData] = React.useState<CreateIncidentRequest>({
    name: '',
    description: '',
    location: initialLocation || [0, 0],
    reported_by: username,
    date: new Date().toISOString(),
    type: 'OTHERS',
    severity: 'MINIMAL',
    status: 'NEW',
    attributes: null,
    backdated: false,
  });

  const handleSubmit = async () => {
    try {
      await actions.createIncident(formData);
      if (onSuccess) onSuccess();
    } catch (error) {
      showError(error || 'Create Incident failed!');
    }
  };

  return (
    <IncidentForm
      formData={formData}
      setFormData={setFormData}
      onSubmit={handleSubmit}
      isLoading={isLoading}
    />
  );
}
