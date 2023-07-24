import React, { useCallback, useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { ViewState } from '../types';
import { Alert, ScrollView, StyleProp, View, ToastAndroid } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Checkbox,
  Dialog,
  IconButton,
  Portal,
  Text,
} from 'react-native-paper';
// import { CoursesTabParamList } from './CoursesTab';
import { format } from 'date-fns';
import { getFullName } from '../full-name';
import { useAppState } from '../state';
import { useFocusEffect } from '@react-navigation/native';
import { universalDateFormat } from '../universal-date-format';

// type ClassInfoProps = NativeStackScreenProps<CoursesTabParamList, 'ClassInfo'>;

const ClassInfo = observer(({ route, navigation }) => {
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [attendanceViewState, setAttendanceViewState] =
    useState<ViewState>('loading');
  const state = useAppState();
  const classId = route.params.classId;
  const classIndex = route.params.classIndex;
  const { userRole } = state.userSession!;

  const cClass = state.classes?.[classId];
  const course = state.courses?.[cClass?.courseId!];
  const presentStudents = cClass?.presentIds?.map(
    (studentId) => state.students[studentId]
  );
  const allStudents = course?.studentIds?.map(
    (studentId) => state.students[studentId]
  );

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          icon="trash-can"
          onPress={() => {
            setShowDeleteDialog(true);
          }}
        />
      ),
    });
  }, [navigation]);

  const takeAttendance = () => {
    navigation.navigate('BarcodeScan', { classId });
  };

  useEffect(() => {
    navigation.setOptions({ title: 'Class Info' });
  }, [navigation]);

  useEffect(() => {
    (async () => {
      setAttendanceViewState('loading');
      await state.fetchAdditionalClassInfo(classId);
      setAttendanceViewState('success');
    })();
  }, []);

  const markPresent = (studentId: string) => {
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
            state.markPresent({ classId, studentId });
          },
        },
      ]
    );
  };

  const markAbsent = (studentId: string) => {
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
    <View style={{ height: '100%' }}>
      <View style={{ margin: 16, height: '100%', display: 'flex' }}>
        {cClass ? (
          <View style={{ flexDirection: 'row', marginTop: 16 }}>
            <Text style={{ fontSize: 16 }}>
              {universalDateFormat(cClass.date!)}
            </Text>
          </View>
        ) : (
          <></>
        )}
        <Text variant="titleMedium" style={{ marginTop: 32 }}>
          Attendance
        </Text>
        {allStudents?.length ? (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 8,
            }}
          >
            <Text style={{ color: 'grey', fontSize: 16 }}>Name</Text>
            <Text style={{ color: 'grey', fontSize: 16 }}>Present</Text>
          </View>
        ) : (
          <></>
        )}
        <ScrollView>
          {attendanceViewState === 'loading' || !cClass ? (
            <ActivityIndicator animating={true} />
          ) : allStudents?.length ? (
            allStudents?.map((student) => {
              const present = Boolean(
                state.classes[classId].presentIds?.includes(student.id)
              );
              return (
                <View
                  key={student.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{getFullName(student)}</Text>
                  <Checkbox
                    disabled={userRole !== 'lecturer'}
                    status={present ? 'checked' : 'unchecked'}
                    onPress={() => {
                      present
                        ? markAbsent(student.id)
                        : markPresent(student.id);
                    }}
                  />
                </View>
              );
            })
          ) : (
            <Text>No students in this course</Text>
          )}
        </ScrollView>
        {userRole === 'lecturer' ? (
          <Button
            mode="contained"
            style={{ marginTop: 'auto', marginBottom: 32 }}
            onPress={() => takeAttendance()}
            disabled={attendanceViewState !== 'success'}
          >
            Scan Barcodes
          </Button>
        ) : (
          <></>
        )}
      </View>
      <Portal>
        <Dialog
          visible={showDeleteDialog}
          onDismiss={() => setShowDeleteDialog(false)}
        >
          <Dialog.Title>Delete class</Dialog.Title>
          <Dialog.Content>
            <Text>This class will be permanently deleted</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button textColor="gray" onPress={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              textColor="red"
              onPress={async () => {
                setShowDeleteDialog(false);
                setViewState('loading');
                await state.deleteClass({ classId });
                navigation.goBack();
                ToastAndroid.show('Class deleted', ToastAndroid.SHORT);
              }}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
});

export default ClassInfo;
