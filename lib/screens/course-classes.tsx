import { useEffect, useState } from 'react';
import { TouchableNativeFeedback, View } from 'react-native';
import { ViewState } from '../types';
import { useAppState } from '../state';
import { ActivityIndicator, FAB, Text } from 'react-native-paper';
import { observer } from 'mobx-react-lite';
import format from 'date-fns/format';

export function CourseClasses({ route, navigation }) {
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
          {course?.classIds?.length ? (
            <>
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
                      <Text>
                        Class on&nbsp;
                        {format(courseClass.date!, 'MMM dd yyyy  h:mm a')}
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

const CourseInfoWrapper = observer(CourseClasses);

export default CourseInfoWrapper;
