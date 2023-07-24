import React, { useCallback, useEffect, useState } from 'react';
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
import ExamEligibilityScan from './exam-eligibility-scan';

const Stack = createNativeStackNavigator();

export type CoursesTabParamList = {
  Courses: undefined;
  CourseInfo: { courseId: string };
  CreateCourse: { courseId?: string; mode: 'create' | 'update' };
  ClassInfo: { classId: string; classIndex: number };
  BarcodeScan: { classId: string };
  PercentageReport: { courseId: string };
};

export default function CourseTab() {
  const state = useAppState();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CourseList"
        component={Courses}
        options={{ headerTitle: 'Courses' }}
      />

      <Stack.Screen
        name="CourseInfo"
        component={CourseInfo}
        options={({ route }) => ({
          title: state.courses[(route.params as any)!.courseId].code,
        })}
      />
      <Stack.Screen
        name="CourseClasses"
        component={CourseClasses}
        options={({ route }) => ({
          title: `${
            state.courses[(route.params as any)!.courseId].code
          } classes`,
        })}
      />
      <Stack.Screen
        name="CourseStudents"
        component={CourseStudents}
        options={({ route }) => ({
          title: `${
            state.courses[(route.params as any)!.courseId].code
          } students`,
        })}
      />
      <Stack.Screen
        name="ExamEligibilityScan"
        component={ExamEligibilityScan}
      />
      <Stack.Screen
        name="ClassInfo"
        component={ClassInfo}
        options={({ route }) => ({
          headerTitle: `${
            state.courses[
              state.classes[(route.params as any)!.classId].courseId!
            ].code
          } Class`,

        })}
      />
      <Stack.Screen name="BarcodeScan" component={BarcodeScan} />
    </Stack.Navigator>
  );
}

export function Courses({ route, navigation }) {
  const [viewState, setViewState] = useState<ViewState>('loading');
  const state = useAppState();
  const courses = state?.courseList;

  useFocusEffect(
    useCallback(() => {
      (async () => {
        await state.fetchCourses();
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
