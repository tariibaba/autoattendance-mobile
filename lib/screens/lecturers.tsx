import React, { useEffect, useState } from 'react';
import { TouchableNativeFeedback } from 'react-native';
import { View, StatusBar } from 'react-native';
import { Text, List, ActivityIndicator, Chip } from 'react-native-paper';
import { getFullName } from '../full-name';
import { useAppState } from '../state';
import { ViewState } from '../types';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LecturerInfo from './lecturer-info';
import { Courses } from './courses';
import CourseInfo from './course-info';

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

  useEffect(() => {
    (async () => {
      await state.fetchLecturers();
      setViewState('success');
    })();
  }, []);

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
                <Text>{getFullName(lecturer)}</Text>
                <View>{courses}</View>
              </View>
            </TouchableNativeFeedback>
          );
        })
      )}
    </View>
  );
}
