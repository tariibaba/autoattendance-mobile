import { useEffect, useState } from 'react';
import { TouchableNativeFeedback, View } from 'react-native';
import axios from 'axios';
import { API_URL } from '../../env';
import { ViewState } from '../types';
import { useAppState } from '../state';
import { ActivityIndicator, Text } from 'react-native-paper';
import { getFullName } from '../full-name';

export default function LecturerInfo({ route }) {
  const { lecturerId } = route.params;
  const [viewState, setViewState] = useState<ViewState>('loading');
  const state = useAppState();

  console.log(`lecturerId ${lecturerId}`);
  const lecturer = state?.lecturers[lecturerId];

  useEffect(() => {
    // fetch lecturer info
    (async () => {
      await state.fetchLecturerInfo(lecturerId);
      setViewState('success');
    })();
  }, []);

  return (
    <View>
      {viewState === 'loading' ? (
        <ActivityIndicator animating={true} />
      ) : (
        <View>
          <Text
            variant="headlineLarge"
            style={{ textAlign: 'center', padding: 32 }}
          >
            {getFullName(lecturer)}
          </Text>
          {lecturer?.courseIds?.length ? (
            <>
              <Text variant="titleMedium" style={{ textAlign: 'center' }}>
                Courses
              </Text>
              {lecturer?.courseIds?.map((courseId) => {
                const course = state.courses[courseId];
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
                      <Text>{course.code}</Text>
                      <Text>{course.attendanceRate}%</Text>
                    </View>
                  </TouchableNativeFeedback>
                );
              })}
            </>
          ) : (
            <Text variant="titleMedium" style={{ textAlign: 'center' }}>
              No courses
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
