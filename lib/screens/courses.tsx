import React, { useEffect, useState } from 'react';
import { TouchableNativeFeedback } from 'react-native';
import { View, StatusBar } from 'react-native';
import { Text, List, ActivityIndicator, Chip } from 'react-native-paper';
import { getFullName } from '../full-name';
import { useAppState } from '../state';
import { ViewState } from '../types';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CourseInfo from './course-info';
import ClassInfo from './class-info';
import BarcodeScan from './barcode-scan';

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
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CourseList"
        component={Courses}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="CourseInfo" component={CourseInfo} />
      <Stack.Screen
        name="ClassInfo"
        component={ClassInfo}
        options={{
          headerTitle: 'Class',
          headerBackVisible: true,
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen name="BarcodeScan" component={BarcodeScan} />
    </Stack.Navigator>
  );
}

export function Courses({ route, navigation }) {
  const [viewState, setViewState] = useState<ViewState>('loading');
  const state = useAppState();
  const courses = state?.courseList;

  useEffect(() => {
    (async () => {
      await state.fetchCourses();
      setViewState('success');
    })();
  }, []);

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
                <Text>{course.attendanceRate}%</Text>
              </View>
            </TouchableNativeFeedback>
          );
        })
      )}
    </View>
  );
}
