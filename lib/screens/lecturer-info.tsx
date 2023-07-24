import { useCallback, useEffect, useState } from 'react';
import { TouchableNativeFeedback, View } from 'react-native';
import axios from 'axios';
import { API_URL } from '../../env';
import { ViewState } from '../types';
import { useAppState } from '../state';
import { ActivityIndicator, Chip, Text } from 'react-native-paper';
import { getFullName } from '../full-name';
import { useFocusEffect } from '@react-navigation/native';

export default function LecturerInfo({ route, navigation }) {
  const { lecturerId } = route.params;
  const [viewState, setViewState] = useState<ViewState>('loading');
  const state = useAppState();

  console.log(`lecturerId ${lecturerId}`);
  const lecturer = state?.lecturers[lecturerId];

  useFocusEffect(
    // fetch lecturer info
    useCallback(() => {
      (async () => {
        await state.fetchLecturerInfo(lecturerId);
        setViewState('success');
      })();
    }, [])
  );

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
          {lecturer?.role === 'hod' ? <Chip>HOD</Chip> : <></>}
          {lecturer?.courseIds?.length ? (
            <>
              <Text variant="titleMedium" style={{ textAlign: 'center' }}>
                Courses
              </Text>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginLeft: 16,
                  marginRight: 16,
                }}
              >
                <Text variant="labelLarge">Code</Text>
                <Text variant="labelLarge">Percentage</Text>
              </View>
              {lecturer?.courseIds?.map((courseId) => {
                const course = state.courses[courseId];
                return (
                  <TouchableNativeFeedback
                    onPress={() => {
                      navigation.navigate('Courses', {
                        screen: 'CourseInfo',
                        params: { courseId },
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
                      <Text>{course.code}</Text>
                      <Text>{(course.attendanceRate! * 100).toFixed(0)}%</Text>
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
