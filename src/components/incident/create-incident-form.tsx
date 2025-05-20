import { useRouter } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';

import type {
  CreateIncidentRequest,
  IncidentSeverity,
  IncidentType,
} from '@/api/ims/types';
import { Button, Input, Select, showError } from "@/components/ui";
import { translate } from '@/lib/i18n';
import { useIncidentStore } from '@/stores/incident';

type Props = {
  onSuccess?: () => void;
  initialLocation?: [number, number];
};

function IncidentTypeSelect({
  value,
  onChange,
}: {
  value: IncidentType;
  onChange: (value: IncidentType) => void;
}) {
  return (
    <Select
      label={translate('incident.type')}
      value={value}
      onSelect={(value) => onChange(value as IncidentType)}
      options={[
        { label: translate('incident.types.incident'), value: 'incident' },
        { label: translate('incident.types.alert'), value: 'alert' },
        { label: translate('incident.types.warning'), value: 'warning' },
      ]}
    />
  );
}

function IncidentSeveritySelect({
  value,
  onChange,
}: {
  value: IncidentSeverity;
  onChange: (value: IncidentSeverity) => void;
}) {
  return (
    <Select
      label={translate('incident.severity')}
      value={value}
      onSelect={(value) => onChange(value as IncidentSeverity)}
      options={[
        { label: translate('incident.severities.low'), value: 'low' },
        { label: translate('incident.severities.medium'), value: 'medium' },
        { label: translate('incident.severities.high'), value: 'high' },
      ]}
    />
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
    <View className="flex-1 space-y-4 p-4">
      <Input
        label={translate('incident.name')}
        value={formData.name}
        onChangeText={(text) =>
          setFormData((prev) => ({ ...prev, name: text }))
        }
      />

      <Input
        label={translate('incident.description')}
        value={formData.description}
        onChangeText={(text) =>
          setFormData((prev) => ({ ...prev, description: text }))
        }
        multiline
        numberOfLines={4}
      />

      <IncidentTypeSelect
        value={formData.type}
        onChange={(type) => setFormData((prev) => ({ ...prev, type }))}
      />

      <IncidentSeveritySelect
        value={formData.severity}
        onChange={(severity) => setFormData((prev) => ({ ...prev, severity }))}
      />

      <Button
        onPress={onSubmit}
        loading={isLoading}
        className="mt-4"
        label={translate('incident.create')}
      />
    </View>
  );
}

export function CreateIncidentForm({
  onSuccess: _onSuccess,
  initialLocation,
}: Props) {
  const _router = useRouter();
  const { actions: actions, isLoading } = useIncidentStore();

  const [formData, setFormData] = React.useState<CreateIncidentRequest>({
    name: '',
    description: '',
    location: initialLocation || [0, 0],
    reported_by: 'user_id', // This should be updated with actual user ID
    date: new Date().toISOString(),
    type: 'incident',
    severity: 'medium',
    status: 'open',
  });

  const handleSubmit = async () => {
    try {
      const response = await actions.createIncident(formData);
    } catch (error) {
      // Error is handled in the store
      showError(error || "Create Incident failed!");
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
