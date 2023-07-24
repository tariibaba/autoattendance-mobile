import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Fragment, useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  TouchableNativeFeedback,
  View,
} from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { getFullName } from '../full-name';
import { useAppState } from '../state';
import { ViewState } from '../types';
import StudentInfo from './student-info';
import { group } from 'group-items';
import { getFriendlyPercentage } from '../friendly-percentage';
import { StudentCourseInfo } from './student-course-info';
import { useFocusEffect } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

export default function StudentTab() {
  const state = useAppState();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="StudentList"
        component={Students}
        options={{ headerTitle: 'Students' }}
      />

      <Stack.Screen
        name="StudentInfo"
        component={StudentInfo}
        options={({ route }) => ({
          title: getFullName(state.students[(route.params as any)!.studentId]),
        })}
      />
      <Stack.Screen name="StudentCourseInfo" component={StudentCourseInfo} />
    </Stack.Navigator>
  );
}

export function Students({ route, navigation }) {
  const [viewState, setViewState] = useState<ViewState>('loading');
  const state = useAppState();
  const students = state?.studentList;

  useFocusEffect(
    useCallback(() => {
      (async () => {
        await state.fetchStudents();
        setViewState('success');
      })();
    }, [])
  );

  const byLevels = group(students).by('level').asObject();

  return (
    <>
      <StatusBar />
      <ScrollView
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        {viewState === 'loading' ? (
          <ActivityIndicator animating={true} />
        ) : students.length ? (
          <>
            {Object.keys(byLevels)
              .sort()
              .map((key) => {
                const levelStudents = byLevels[key];
                return (
                  <Fragment key={key}>
                    <Text variant="titleMedium" style={{ margin: 16 }}>
                      {key} level
                    </Text>
                    {levelStudents
                      ?.sort((a, b) => b.attendanceRate! - a.attendanceRate!)
                      .map((student) => {
                        return (
                          <TouchableNativeFeedback
                            key={student.id}
                            onPress={() => {
                              navigation.navigate('StudentInfo', {
                                studentId: student.id,
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
                              <Text>
                                {getFullName(student)} ({student.matricNo})
                              </Text>
                              <Text>
                                {getFriendlyPercentage(student.attendanceRate)}
                              </Text>
                            </View>
                          </TouchableNativeFeedback>
                        );
                      })}
                  </Fragment>
                );
              })}
          </>
        ) : (
          <View
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Text style={{ margin: 16, textAlign: 'center' }}>No students</Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}
