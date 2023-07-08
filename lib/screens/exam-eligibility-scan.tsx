import React, { useContext, useEffect, useRef, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CoursesTabParamList } from './courses';
import { observer } from 'mobx-react';
import {
  Alert,
  View,
  StyleSheet,
  TouchableNativeFeedback,
  Image,
  ToastAndroid,
} from 'react-native';
import { useAppState } from '../state';
import axios from 'axios';
import { Avatar, Button, Dialog, Portal, Text } from 'react-native-paper';
import { useScanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { API_URL } from '../../env';
import { getFullName } from '../full-name';
// import { Image } from 'expo-image';
import { SERVER_URL } from '../../env';

const ExamEligibilityScan = observer(({ route, navigation }) => {
  const state = useAppState();
  const { token } = state.userSession!;
  const courseId = route.params.courseId;
  const [hasPermission, setHasPermission] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const eligibleRef = useRef<boolean | undefined>(undefined);
  const [unknownStudentDialogOpen, setUnknownStudentDialogOpen] =
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
      const qrcodeEncoded = encodeURIComponent(qrcodeData);
      const { ...student } = (
        await axios.get(`${API_URL}/students/${qrcodeEncoded}?qrcode=1`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ).data;
      const course = state.courses[courseId];
      eligibleRef.current =
        studentRef.current.attendance.find(
          (attendance) => attendance.courseId == courseId
        ).attendanceRate > 0.75;
      if (course.studentIds!.includes(student.id)) {
        studentRef.current = student;
        setDialogOpen(true);
      } else {
        setUnknownStudentDialogOpen(true);
      }
    } catch (err: any) {
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
  const newUrl = `${SERVER_URL}${student?.photoUrl?.replaceAll('\\', '/')}`;
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
        <Dialog visible={unknownStudentDialogOpen}>
          <Dialog.Title>Student not registered</Dialog.Title>
          <Dialog.Content style={{ width: '100%' }}>
            <Text>{getFullName(student)}</Text>
            <Text>{student?.matricNo}</Text>
            <Text>{student?.level} level</Text>
            <View
              style={{
                display: 'flex',
                justifyContent: 'center',
                flexDirection: 'row',
                width: '100%',
                marginTop: 16,
              }}
            >
              {newUrl ? (
                <Image
                  style={{ width: 200, height: 200 }}
                  source={{ uri: newUrl }}
                />
              ) : (
                <></>
              )}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setUnknownStudentDialogOpen(false)}>
              Close
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Portal>
        <Dialog visible={dialogOpen}>
          <Dialog.Title
            style={{ color: eligibleRef.current ? 'green' : 'red' }}
          >
            {eligibleRef.current ? 'Eligible' : 'Not eligible'}
          </Dialog.Title>
          <Dialog.Content>
            <Text>{getFullName(student)}</Text>
            <Text>{student?.matricNo}</Text>
            <Text>{student?.level} level</Text>
            <View
              style={{
                display: 'flex',
                justifyContent: 'center',
                flexDirection: 'row',
                width: '100%',
                marginTop: 16,
              }}
            >
              {newUrl ? (
                <Image
                  style={{
                    width: 200,
                    height: 200,
                    borderColor: eligibleRef.current ? 'green' : 'red',
                    borderWidth: 2,
                  }}
                  source={{ uri: newUrl }}
                />
              ) : (
                <></>
              )}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setDialogOpen(false);
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

export default ExamEligibilityScan;
