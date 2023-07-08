import { useEffect, useState } from 'react';
import { ScrollView, TouchableNativeFeedback, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { getFullName } from '../full-name';
import { useAppState } from '../state';
import { ViewState } from '../types';

export default function StudentInfo({ route, navigation }) {
  const { studentId } = route.params;
  const state = useAppState()!;
  const [viewState, setViewState] = useState<ViewState>('loading');

  const student = state?.students[studentId];
  const { matricNo, level, courseIds } = student ?? {};
  const courses = state?.courses;

  useEffect(() => {
    (async () => {
      await state.fetchStudentInfo(studentId);
      setViewState('success');
    })();
  }, []);

  return (
    <ScrollView>
      <View style={{ height: '100%' }}>
        {viewState === 'loading' ? (
          <ActivityIndicator animating={true} />
        ) : (
          <View>
            <Text
              variant="headlineSmall"
              style={{ marginTop: 32, textAlign: 'center' }}
            >
              {getFullName(student)}
            </Text>
            <Text variant="labelLarge" style={{ textAlign: 'center' }}>
              {student.matricNo}
            </Text>
            <Text variant="labelLarge" style={{ textAlign: 'center' }}>
              {student.level} level
            </Text>
            <Text
              variant="titleSmall"
              style={{ marginLeft: 16, marginTop: 16 }}
            >
              Courses
            </Text>
            {courseIds?.map((courseId) => {
              const course = courses[courseId];
              const attendanceRate = student?.attendance?.find(
                (rate) => rate.courseId === courseId
              )?.rate;
              return (
                <TouchableNativeFeedback>
                  <View
                    style={{
                      padding: 16,
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text>
                      {course.title} ({course.code})
                    </Text>
                    <Text
                      style={{
                        color: attendanceRate! > 0.75 ? 'green' : 'red',
                      }}
                    >
                      {(attendanceRate! * 100).toFixed(0)}%
                    </Text>
                  </View>
                </TouchableNativeFeedback>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
