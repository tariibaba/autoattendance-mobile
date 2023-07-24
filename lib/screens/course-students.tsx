import { useCallback, useEffect, useState } from 'react';
import { TouchableNativeFeedback, View } from 'react-native';
import { ViewState } from '../types';
import { useAppState } from '../state';
import { ActivityIndicator, Button, FAB, Text } from 'react-native-paper';
import { observer } from 'mobx-react-lite';
import { getFullName } from '../full-name';
import { useFocusEffect } from '@react-navigation/native';
import { getFriendlyPercentage } from '../friendly-percentage';

export function CourseStudents({ route, navigation }) {
  const { courseId } = route.params;
  const [viewState, setViewState] = useState<ViewState>('loading');
  const state = useAppState();
  const session = state.userSession!;
  const userRole = session.userRole;

  const course = state?.courses[courseId];

  useFocusEffect(
    useCallback(() => {
      (async () => {
        await state.fetchCourseInfo(courseId);
        setViewState('success');
      })();
    }, [])
  );

  return (
    <View style={{ height: '100%' }}>
      {viewState === 'loading' ? (
        <View style={{ display: 'flex', flex: 1 }}>
          <ActivityIndicator animating={true} />
        </View>
      ) : (
        <View style={{ display: 'flex', flex: 1 }}>
          {course?.studentIds?.length ? (
            <>
              {course?.studentIds?.map((studentId) => {
                const student = state.students[studentId];
                console.log('attendance rate by student...');
                console.log(course.attendanceRateByStudent);
                const attendanceRate = course.attendanceRateByStudent?.find(
                  (attendance) => attendance.studentId === studentId
                )?.attendanceRate!;

                return (
                  <TouchableNativeFeedback
                    onPress={() => {
                      navigation.navigate('Students', {
                        screen: 'StudentCourseInfo',
                        params: {
                          studentId: student.id,
                          courseId: course.id,
                        },
                      });
                    }}
                  >
                    <View
                      style={{
                        padding: 16,
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text>{getFullName(student)}</Text>
                      <Text
                        style={{
                          color: attendanceRate > 0.75 ? 'green' : 'red',
                        }}
                      >
                        {getFriendlyPercentage(attendanceRate)}
                      </Text>
                    </View>
                  </TouchableNativeFeedback>
                );
              })}
            </>
          ) : (
            <Text style={{ margin: 16, textAlign: 'center' }}>No students</Text>
          )}
        </View>
      )}
      {userRole === 'lecturer' ? (
        <Button
          disabled={viewState !== 'success'}
          style={{ margin: 32, marginBottom: 16 }}
          mode="contained"
          onPress={() => {
            navigation.navigate('ExamEligibilityScan', {
              courseId,
            });
          }}
        >
          Scan for exam eligibility
        </Button>
      ) : (
        <></>
      )}
    </View>
  );
}

const CourseInfoWrapper = observer(CourseStudents);

export default CourseInfoWrapper;
