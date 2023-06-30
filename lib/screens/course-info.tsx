import { useEffect, useState } from 'react';
import { TouchableNativeFeedback, View } from 'react-native';
import axios from 'axios';
import { API_URL } from '../../env';
import { ViewState } from '../types';
import { useAppState } from '../state';
import {
  ActivityIndicator,
  Dialog,
  FAB,
  Paragraph,
  Portal,
  Text,
  Button,
} from 'react-native-paper';
import { getFullName } from '../full-name';
import { observer } from 'mobx-react-lite';

export function CourseInfo({ route, navigation }) {
  const { courseId } = route.params;
  const [viewState, setViewState] = useState<ViewState>('loading');
  const state = useAppState();
  const session = state.userSession!;
  const role = session.userRole;

  const course = state?.courses[courseId];

  useEffect(() => {
    (async () => {
      await state.fetchCourseInfo(courseId);
      setViewState('success');
    })();
  }, []);

  return (
    <View style={{ height: '100%' }}>
      {viewState === 'loading' ? (
        <ActivityIndicator animating={true} />
      ) : (
        <View>
          <Text
            variant="headlineLarge"
            style={{ textAlign: 'center', padding: 32 }}
          >
            {course.code}
          </Text>

          {course?.classIds?.length ? (
            <>
              <Text variant="titleMedium" style={{ textAlign: 'center' }}>
                Courses
              </Text>
              {course?.classIds?.map((classId) => {
                const courseClass = state.classes[classId];
                return (
                  <TouchableNativeFeedback
                    onPress={() => {
                      navigation.navigate('ClassInfo', {
                        classId: courseClass.id,
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
                      <Text>Class #{courseClass.id}</Text>
                      <Text>
                        <>{courseClass.date?.toString()}%</>
                      </Text>
                    </View>
                  </TouchableNativeFeedback>
                );
              })}
            </>
          ) : (
            <Text variant="titleMedium" style={{ textAlign: 'center' }}>
              No classes
            </Text>
          )}
        </View>
      )}
      <FAB
        label="New class"
        icon="plus"
        style={{ position: 'absolute', margin: 16, right: 0, bottom: 0 }}
        onPress={async () => {
          await state.createClass({ courseId });
        }}
      />
    </View>
  );
}

const CourseInfoWrapper = observer(CourseInfo);

export default CourseInfoWrapper;
