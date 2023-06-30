import React, { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { ViewState } from '../types';
import { Alert, ScrollView, StyleProp, View } from 'react-native';
import { Button, Checkbox, Text } from 'react-native-paper';
// import { CoursesTabParamList } from './CoursesTab';
import { format } from 'date-fns';
import { getFullName } from '../full-name';
import { useAppState } from '../state';

// type ClassInfoProps = NativeStackScreenProps<CoursesTabParamList, 'ClassInfo'>;

const ClassInfo = observer(({ route, navigation }) => {
  const [viewState, setViewState] = useState<ViewState>('loading');
  const state = useAppState();
  const classId = route.params.classId;
  const classIndex = route.params.classIndex;

  const courseClass = state.classes[classId];
  const course = state.courses[courseClass.courseId!];
  const presentStudents = courseClass?.presentIds?.map(
    (studentId) => state.students[studentId]
  );
  const allStudents = course?.studentIds?.map(
    (studentId) => state.students[studentId]
  );

  const takeAttendance = () => {
    navigation.navigate('BarcodeScan', { classId });
  };

  useEffect(() => {
    navigation.setOptions({ title: 'Class Info' });
  }, [navigation]);

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
      <View style={{ margin: 16, flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <Text style={{ fontSize: 20 }}>
            {course.code} Class #{classId}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', marginTop: 16 }}>
          <Text style={{ color: 'grey', fontSize: 16 }}>Date: </Text>
          <Text style={{ fontSize: 16 }}>
            {format(courseClass.date!, 'MMM dd yyyy  h:mm a')}
          </Text>
        </View>
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
          {allStudents?.length ? (
            allStudents?.map((student) => {
              const present = Boolean(
                presentStudents?.find((value) => value.id === student.id)
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
        <Button
          mode="contained"
          style={{ marginTop: 'auto' }}
          onPress={() => takeAttendance()}
        >
          Scan Barcodes
        </Button>
      </View>
    </View>
  );
});

export default ClassInfo;
