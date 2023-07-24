import React, { useEffect, useState } from 'react';
import { TouchableNativeFeedback } from 'react-native';
import { View, StatusBar } from 'react-native';
import { Text, List, ActivityIndicator, Chip } from 'react-native-paper';
import { getFullName } from '../full-name';
import { useAppState } from '../state';
import { ViewState } from '../types';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CourseClasses from './course-classes';
import ClassInfo from './class-info';
import BarcodeScan from './barcode-scan';
import { CourseInfo } from './course-info';
import { CourseStudents } from './course-students';
import { useFocusEffect } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

export default function StudentCoursesTab() {
  const state = useAppState();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="StudentCourseList"
        component={Courses}
        options={{ headerTitle: 'Courses' }}
      />

      <Stack.Screen
        name="StudentCourseInfo"
        component={CourseInfo}
        options={({ route }) => ({
          title: state.courses[(route.params as any)!.courseId].code,
        })}
      />
    </Stack.Navigator>
  );
}

export function Courses({ route, navigation }) {
  const [viewState, setViewState] = useState<ViewState>('loading');
  const state = useAppState();
  const courses = state?.courseList;
  const session = state.userSession;
  const userId = session?.userId!;

  useFocusEffect(() => {
    (async () => {
      await state.fetchStudentInfo(userId);
      setViewState('success');
    })();
  });

  return (
    <View>
      <StatusBar />
      {viewState === 'loading' ? (
        <ActivityIndicator animating={true} />
      ) : (
        courses?.map((course) => {
          return (
            <TouchableNativeFeedback
              key={course.id}
              onPress={() => {
                navigation.navigate('CourseInfo', {
                  courseId: course.id,
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
                  {course.title} ({course.code})
                </Text>
                <Text>{(course.attendanceRate! * 100).toFixed(0)}%</Text>
              </View>
            </TouchableNativeFeedback>
          );
        })
      )}
    </View>
  );
}
