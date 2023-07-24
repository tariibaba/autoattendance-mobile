import { useCallback, useEffect, useState } from 'react';
import { TouchableNativeFeedback, View } from 'react-native';
import { ViewState } from '../types';
import { useAppState } from '../state';
import {
  ActivityIndicator,
  Button,
  Dialog,
  FAB,
  Portal,
  Text,
  TextInput,
} from 'react-native-paper';
import { observer } from 'mobx-react-lite';
import format from 'date-fns/format';
import { useFocusEffect } from '@react-navigation/native';
import {
  DatePickerModal,
  DatePickerInput,
  TimePicker,
  TimePickerModal,
} from 'react-native-paper-dates';

export function CourseClasses({ route, navigation }) {
  const { courseId } = route.params;
  const [viewState, setViewState] = useState<ViewState>('loading');
  const state = useAppState();
  const session = state.userSession;
  const role = session?.userRole;

  const course = state?.courses[courseId];

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setViewState('loading');
        await state.fetchCourseInfo(courseId);
        setViewState('success');
      })();
    }, [])
  );

  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);

  const [time, setTime] = useState<
    { hour: number; minute: number } | undefined
  >(undefined);

  useEffect(() => {
    if (!showDateTimePicker) return;
    const now = new Date();
    !date && setDate(now);
    const hour = now.getHours();
    const minute = now.getMinutes();
    !time && setTime({ hour, minute });
  }, [showDateTimePicker]);

  const handleNewClass = async () => {
    setShowDateTimePicker(false);
    date?.setHours(time!.hour);
    date?.setMinutes(time!.minute);
    await state.createClass({
      courseId,
      date: date!,
    });
  };

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
            <Text style={{ margin: 16, textAlign: 'center' }}>No classes</Text>
          )}
        </View>
      )}
      {role === 'lecturer' ? (
        <FAB
          label="New class"
          icon="plus"
          style={{ position: 'absolute', margin: 16, right: 0, bottom: 0 }}
          onPress={async () => {
            // await state.createClass({ courseId });
            setShowDateTimePicker(true);
          }}
        />
      ) : (
        <></>
      )}
      <Portal>
        <Dialog
          visible={showDateTimePicker}
          onDismiss={() => setShowDateTimePicker(false)}
        >
          <View style={{ margin: 16 }}>
            <Text style={{ textAlign: 'center' }} variant="headlineSmall">
              New class
            </Text>
            <TextInput
              style={{ marginTop: 24 }}
              onFocus={(event) => {
                console.log('on focus');
                event.preventDefault();
                setShowDatePicker(true);
              }}
              onPressIn={(event) => {
                console.log('onPressIn');
              }}
              value={`${!date ? 'Date (DD/MM/yyyy)' : `${date.toISOString()}`}`}
            />
            <TextInput
              style={{ marginTop: 8 }}
              value={`${
                !time
                  ? 'Time (HH:mm)'
                  : `${time?.hour}:${time?.minute.toString().padStart(2, '0')}`
              }`}
            />
            <DatePickerModal
              visible={showDatePicker}
              onDismiss={() => {}}
              mode="single"
              locale="en"
              onConfirm={({ date }) => {
                setDate(date);
                setShowDatePicker(false);
                !time && setShowTimePicker(true);
              }}
            />
            <TimePickerModal
              visible={showTimePicker}
              onDismiss={() => setShowTimePicker(false)}
              onConfirm={({ hours, minutes }) => {
                setTime({ hour: hours, minute: minutes });
                setShowTimePicker(false);
              }}
            />
            <Button
              mode="contained"
              style={{ marginTop: 32 }}
              disabled={!time || !date}
              onPress={handleNewClass}
            >
              Create
            </Button>
          </View>
        </Dialog>
      </Portal>
    </View>
  );
}

const CourseInfoWrapper = observer(CourseClasses);

export default CourseInfoWrapper;
