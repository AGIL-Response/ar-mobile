import React from 'react';

import { Item } from '@/components/settings/item';
import { ItemsContainer } from '@/components/settings/items-container';
import { translate } from '@/lib';
import { LocationObject } from "expo-location";

type LocationDisplayProps = {
  locationData: LocationObject | null;
};

export function LocationDisplay({ locationData }: LocationDisplayProps) {
  return (
    <>
      <ItemsContainer title={translate('location.current')}>
        <Item
          text={translate('location.latitude')}
          value={locationData?.coords.latitude.toFixed(6)}
        />
        <Item
          text={translate('location.longitude')}
          value={locationData?.coords.longitude.toFixed(6)}
        />
        <Item
          text={translate('location.accuracy')}
          value={`${locationData?.coords.accuracy} meters`}
        />
        <Item
          text={translate('location.altitude')}
          value={`${locationData?.coords.altitude} meters`}
        />
        <Item
          text={translate('location.speed')}
          value={
            locationData?.coords.speed === -1
              ? 'N/A'
              : `${locationData?.coords.speed} m/s`
          }
        />
        <Item
          text={translate('location.heading')}
          value={
            locationData?.coords.heading === -1
              ? 'N/A'
              : `${locationData?.coords.heading}°`
          }
        />
      </ItemsContainer>

      <ItemsContainer title={translate('location.additional')}>
        <Item
          text={translate('location.last_updated')}
          value={
            locationData
              ? new Date(locationData.timestamp).toLocaleString()
              : 'N/A'
          }
        />
        <Item
          text={translate('location.altitude_accuracy')}
          value={
            locationData?.coords.altitudeAccuracy === -1
              ? 'N/A'
              : `${locationData?.coords.altitudeAccuracy} meters`
          }
        />
      </ItemsContainer>
    </>
  );
}
