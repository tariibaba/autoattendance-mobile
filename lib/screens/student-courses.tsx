import React, { useRef, useState } from 'react';
import { ScrollView, TouchableNativeFeedback } from 'react-native';
import { View, StatusBar } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useAppState } from '../state';
import { Student, ViewState } from '../types';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { getFriendlyPercentage } from '../friendly-percentage';
import { StudentCourseInfo } from './student-course-info';

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

      <Stack.Screen name="StudentCourseInfo" component={StudentCourseInfo} />
    </Stack.Navigator>
  );
}

export function Courses({ route, navigation }) {
  const [viewState, setViewState] = useState<ViewState>('loading');
  const state = useAppState();
  const courses = state?.courseList;
  const session = state.userSession;
  const userId = session?.userId!;
  const studentRef = useRef<Student | undefined>(undefined);

  useFocusEffect(() => {
    (async () => {
      await state.fetchStudentInfo(userId);
      studentRef.current = state.students[userId];
      console.log(`student: ${JSON.stringify(studentRef.current)}`);
      console.log(JSON.stringify(studentRef.current.attendance));
      setViewState('success');
    })();
  });

  return (
    <ScrollView>
      <StatusBar />
      {viewState === 'loading' ? (
        <ActivityIndicator animating={true} />
      ) : (
        <>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 16,
              marginHorizontal: 16,
            }}
          >
            <Text variant="labelLarge">Course</Text>
            <Text variant="labelLarge">Your attendance</Text>
          </View>
          {courses
            ?.sort((a, b) => b.attendanceRate! - a.attendanceRate!)
            .map((course) => {
              return (
                <TouchableNativeFeedback
                  key={course.id}
                  onPress={() => {
                    console.log('navigating');
                    navigation.navigate('StudentCourseInfo', {
                      courseId: course.id,
                      studentId: userId,
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
                    <Text>
                      {getFriendlyPercentage(
                        studentRef.current?.attendance?.find(
                          (c) => c.courseId === course.id
                        )?.rate
                      )}
                    </Text>
                  </View>
                </TouchableNativeFeedback>
              );
            })}
        </>
      )}
    </ScrollView>
  );
}
