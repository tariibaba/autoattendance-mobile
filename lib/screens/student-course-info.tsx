import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, TouchableNativeFeedback, View } from 'react-native';
import { ViewState } from '../types';
import { useAppState } from '../state';
import {
  ActivityIndicator,
  Button,
  Checkbox,
  Dialog,
  FAB,
  Portal,
  Text,
  TextInput,
} from 'react-native-paper';
import { observer } from 'mobx-react-lite';
import format from 'date-fns/format';
import { useFocusEffect } from '@react-navigation/native';
import { universalDateFormat } from '../universal-date-format';
import { getFullName } from '../full-name';
import { getFriendlyPercentage } from '../friendly-percentage';

export function StudentCourseInfo({ route, navigation }) {
  const { courseId, studentId } = route.params;
  const [viewState, setViewState] = useState<ViewState>('loading');
  const state = useAppState();
  const session = state.userSession;
  const role = session?.userRole;
  const student = state?.students?.[studentId];
  const course = state?.courses[courseId];

  useEffect(() => {
    navigation?.setOptions({
      title: `${role === 'student' ? 'You' : student.lastName} in ${
        course.code
      }`,
    });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        console.log(`courseId: ${courseId}`);
        await Promise.all([
          state.fetchCourseInfo(courseId),
          state.fetchStudentInfo(studentId),
        ]);
        setViewState('success');
      })();
    }, [])
  );

  const studentData = student?.attendance!.find(
    (cAttendance) => cAttendance.courseId === courseId
  )!;

  const markPresent = (params: { classId: string; studentId: string }) => {
    const { classId, studentId } = params;
    const student = state.students[studentId];
    const studentName = `${student.lastName}, ${student.firstName} ${
      student.otherNames || ''
    }`;
    Alert.alert(
      'Mark present?',
      `Do you really want to mark ${studentName} as present?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => {
            try {
              state.markPresent({ classId, studentId });
            } catch (err: any) {
              const statusCode = err?.response?.status;
              if (statusCode === 409) {
                state.markPresentLocal({ classId, studentId });
              }
            }
          },
        },
      ]
    );
  };

  const markAbsent = (params: { classId: string; studentId: string }) => {
    const { classId, studentId } = params;
    const student = state.students[studentId];
    const studentName = `${student.lastName} ${student.firstName} ${
      student.otherNames || ''
    }`;
    Alert.alert(
      'Mark absent?',
      `Do you really want to mark ${studentName} as absent?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => {
            state.markAbsent({ classId, studentId });
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={{ height: '100%' }}>
      {viewState === 'loading' ? (
        <ActivityIndicator animating={true} />
      ) : (
        <View>
          {role !== 'student' && (
            <Text
              style={{ textAlign: 'center', marginTop: 16 }}
              variant="headlineSmall"
            >
              {getFullName(student)}
            </Text>
          )}
          <Text
            style={{
              fontSize: 18,
              marginTop: 16,
              marginHorizontal: 16,
              color: studentData.rate > 0.75 ? 'green' : 'red',
            }}
          >
            Attendance: {getFriendlyPercentage(studentData.rate)}
          </Text>
          <Text
            variant="labelLarge"
            style={{ marginHorizontal: 16, marginTop: 16 }}
          >
            Classes
          </Text>
          {course?.classIds?.length ? (
            <>
              {studentData?.data
                .sort(
                  (a, b) =>
                    state.classes[b.classId]!.date!.getTime() -
                    state.classes[a.classId]!.date!.getTime()
                )
                .map((classData) => {
                  const courseClass = state.classes[classData.classId];
                  const isPresent = classData.present;
                  return (
                    <View
                      style={{
                        padding: 8,
                        paddingHorizontal: 16,
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Text>
                        Class on&nbsp;
                        {universalDateFormat(courseClass.date!)}
                      </Text>
                      <Checkbox
                        status={isPresent ? 'checked' : 'unchecked'}
                        disabled={true}
                        onPress={() => {
                          if (isPresent) {
                            markAbsent({
                              classId: courseClass.id,
                              studentId: studentId,
                            });
                          } else {
                            markPresent({
                              classId: courseClass.id,
                              studentId: studentId,
                            });
                          }
                        }}
                      />
                    </View>
                  );
                })}
            </>
          ) : (
            <Text style={{ margin: 16, textAlign: 'center' }}>No classes</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const CourseInfoWrapper = observer(StudentCourseInfo);

export default CourseInfoWrapper;
