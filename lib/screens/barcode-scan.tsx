import React, { useContext, useEffect, useRef } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CoursesTabParamList } from './courses';
import { observer } from 'mobx-react';
// import QRCodeScanner from 'react-native-qrcode-scanner';
import { Alert, View } from 'react-native';
import crypto from 'react-native-crypto-js';
import { useAppState } from '../state';
import axios from 'axios';
import { Text } from 'react-native-paper';

export type BarcodeScanScreenProps = NativeStackScreenProps<
  CoursesTabParamList,
  'BarcodeScan'
>;

const BarcodeScan = observer(({ route, navigation }) => {
  const state = useAppState();
  const classId = route.params.classId;
  const scanner = useRef<QRCodeScanner | undefined>();
  const onRead = async (e) => {
    try {
      const qrcodeData = e.data;
      const {
        id: studentId,
        photoUrl,
        firstName,
        lastName,
        otherNames,
      } = (
        await axios.post(`/api/classes/${classId}/attendances`, {
          qrcodeData,
        })
      ).data;
      const courseId = state.classes[classId].courseId!;
      const course = state.courses[courseId];
      if (course.studentIds!.includes(studentId)) {
        const student = state.students[studentId];
        Alert.alert(
          'Student present',
          `${student.lastName}, ${student.firstName} ${
            student.otherNames || ''
          }`,
          [
            {
              text: 'Confirm',
              onPress: async () => {
                // record attendance now, requests, etc.
                state.markPresent({ classId, studentId });
                scanner.current?.reactivate();
              },
            },
          ]
        );
      }
    } catch (err) {
      // error: invalid barcode;
      console.error('Error: Invalid barcode');
      return;
    }
  };

  useEffect(() => {
    navigation.setOptions({
      title: 'Scan Barcode',
    });
  }, [navigation]);

  return (
    <>
      <View>
        <Text>Stuff</Text>
      </View>
    </>
    // <QRCodeScanner
    //   onRead={onRead}
    //   ref={(node) => {
    //     scanner.current = node!;
    //   }}
    // />
  );
});

export default BarcodeScan;
