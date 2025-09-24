import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/theme/ThemeContext';

interface RouteStop {
  id: string;
  address: string;
  time: string;
  status: 'completed' | 'current' | 'upcoming';
  taskType: string;
  estimatedDuration: string;
}

interface RouteInfoProps {
  routes: RouteStop[];
  onStopPress?: (stopId: string) => void;
}

export default function RouteInfo({ routes, onStopPress }: RouteInfoProps) {
  const { theme } = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return theme.colors.success;
      case 'current': return theme.colors.primary;
      case 'upcoming': return theme.colors.textSecondary;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'current': return '📍';
      case 'upcoming': return '⏳';
      default: return '📍';
    }
  };

  return (
    <View style={{ backgroundColor: theme.colors.card, borderRadius: 12, padding: 16 }}>
      <Text style={{
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 16
      }}>
        📍 Today's Route
      </Text>

      {routes.map((stop, index) => (
        <TouchableOpacity
          key={stop.id}
          onPress={() => onStopPress?.(stop.id)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            borderLeftWidth: 3,
            borderLeftColor: getStatusColor(stop.status),
            paddingLeft: 12,
            marginBottom: 8,
            backgroundColor: stop.status === 'current' ? theme.colors.primary + '10' : 'transparent',
            borderRadius: 8
          }}
        >
          <View style={{ marginRight: 12 }}>
            <Text style={{ fontSize: 16 }}>{getStatusIcon(stop.status)}</Text>
          </View>
          
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: theme.colors.text,
              marginBottom: 2
            }}>
              {stop.address}
            </Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{
                fontSize: 12,
                color: theme.colors.textSecondary,
                marginRight: 12
              }}>
                🕐 {stop.time}
              </Text>
              <Text style={{
                fontSize: 12,
                color: theme.colors.textSecondary,
                marginRight: 12
              }}>
                ⏱️ {stop.estimatedDuration}
              </Text>
            </View>
            
            <Text style={{
              fontSize: 12,
              color: getStatusColor(stop.status),
              fontWeight: '500'
            }}>
              🗑️ {stop.taskType}
            </Text>
          </View>

          {index < routes.length - 1 && (
            <View style={{
              position: 'absolute',
              left: 18,
              bottom: -8,
              width: 2,
              height: 16,
              backgroundColor: theme.colors.border
            }} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}
