import React, { useCallback, useEffect, useState } from 'react';
import { TouchableNativeFeedback } from 'react-native';
import { View, StatusBar } from 'react-native';
import { Text, List, ActivityIndicator, Chip } from 'react-native-paper';
import { getFullName } from '../full-name';
import { useAppState } from '../state';
import { ViewState } from '../types';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LecturerInfo from './lecturer-info';
import { useFocusEffect } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

export default function LecturerTab() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="LecturerList"
        component={Lecturers}
        options={{ headerTitle: 'Lecturers' }}
      />
      <Stack.Screen
        name="LecturerInfo"
        component={LecturerInfo}
        options={{ headerTitle: 'Lecturer' }}
      />
    </Stack.Navigator>
  );
}

export function Lecturers({ route, navigation }) {
  const [viewState, setViewState] = useState<ViewState>('loading');
  const state = useAppState();
  const lecturers = state?.lecturerList;
  const userId = state.userSession!.userId;

  useFocusEffect(
    useCallback(() => {
      (async () => {
        await state.fetchLecturers();
        setViewState('success');
      })();
    }, [])
  );

  return (
    <View>
      <StatusBar />
      {viewState === 'loading' ? (
        <ActivityIndicator animating={true} />
      ) : (
        lecturers.map((lecturer) => {
          const courses = lecturer?.courses?.map((course) => (
            <Chip>{course.code}</Chip>
          ));
          return (
            <TouchableNativeFeedback
              key={lecturer.id}
              onPress={() => {
                navigation.navigate('LecturerInfo', {
                  lecturerId: lecturer.id,
                });
              }}
            >
              <View
                style={{
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Text>{getFullName(lecturer)}</Text>
                  {lecturer.role === 'hod' ? (
                    <Chip style={{ marginLeft: 8 }}>HOD</Chip>
                  ) : (
                    ''
                  )}
                </View>
                <View>{courses}</View>
              </View>
            </TouchableNativeFeedback>
          );
        })
      )}
    </View>
  );
}
