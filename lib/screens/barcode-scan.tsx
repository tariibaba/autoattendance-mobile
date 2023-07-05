import React, { useContext, useEffect, useRef, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CoursesTabParamList } from './courses';
import { observer } from 'mobx-react';
import { Alert, View, StyleSheet, TouchableNativeFeedback } from 'react-native';
import crypto from 'react-native-crypto-js';
import { useAppState } from '../state';
import axios from 'axios';
import { Button, Dialog, Portal, Text } from 'react-native-paper';
import { useScanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { API_URL } from '../../env';
import { getFullName } from '../full-name';

export type BarcodeScanScreenProps = NativeStackScreenProps<
  CoursesTabParamList,
  'BarcodeScan'
>;

const BarcodeScan = observer(({ route, navigation }) => {
  const state = useAppState();
  const { token } = state.userSession!;
  const classId = route.params.classId;
  const [hasPermission, setHasPermission] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [presentDialogOpen, setPresentDialogOpen] = useState(false);
  const [alreadyPresentDialogOpen, setAlreadyPresentDialogOpen] =
    useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
    readQRCodeData(data);
  };

  const studentRef = useRef<any>();

  const readQRCodeData = async (data: string) => {
    try {
      const qrcodeData = data;
      console.log(`sending data: ${qrcodeData}`);
      const { student } = (
        await axios.post(
          `${API_URL}/classes/${classId}/attendances`,
          {
            qrCode: qrcodeData,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      ).data;
      const courseId = state.classes[classId].courseId!;
      const course = state.courses[courseId];
      if (course.studentIds!.includes(student.id)) {
        studentRef.current = student;
        setPresentDialogOpen(true);
      }
    } catch (err: any) {
      const { student, error: errorCode } = err.response?.data ?? {};
      if (errorCode === 'attendance-already-exists') {
        // console.log(`firstName: ${firstName}`);
        studentRef.current = student;
        setAlreadyPresentDialogOpen(true);
      }
      console.error(`${err}`);
      return;
    }
  };

  useEffect(() => {
    navigation.setOptions({
      title: 'Scan Barcode',
    });
  }, [navigation]);

  if (hasPermission === null) {
    return <Text style={{ margin: 16 }}>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text style={{ margin: 16 }}>No access to camera</Text>;
  }

  const student = studentRef.current;
  return (
    <>
      <View style={{ height: '100%' }}>
        <TouchableNativeFeedback onPress={() => setScanned(false)}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        </TouchableNativeFeedback>
        {scanned && (
          <Button onPress={() => setScanned(false)}>Tap to scan again</Button>
        )}
      </View>
      <Portal>
        <Dialog visible={presentDialogOpen}>
          <Dialog.Title>Student present</Dialog.Title>
          <Dialog.Content>
            <Text>{getFullName(student)}</Text>
            <Text>{student?.matricNo}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setPresentDialogOpen(false);
                state.markPresent({
                  classId,
                  studentId: student?.id,
                });
              }}
            >
              Confirm
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Portal>
        <Dialog visible={alreadyPresentDialogOpen}>
          <Dialog.Title>Student already present</Dialog.Title>
          <Dialog.Content>
            <Text>{getFullName(student)}</Text>
            <Text>{student?.matricNo}</Text>
            <Text>This student has already taken attendance</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setPresentDialogOpen(false);
              }}
            >
              Close
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
});

export default BarcodeScan;
