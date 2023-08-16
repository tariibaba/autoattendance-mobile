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
import crypto from 'react-native-crypto-js';
import { useAppState } from '../state';
import axios from 'axios';
import { Avatar, Button, Dialog, Portal, Text } from 'react-native-paper';
import { useScanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { API_URL } from '../../env';
import { getFullName } from '../full-name';
// import { Image } from 'expo-image';
import { SERVER_URL } from '../../env';

export type BarcodeScanScreenProps = NativeStackScreenProps<
  CoursesTabParamList,
  'BarcodeScan'
>;

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

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
      const qrcodeEncoded = encodeURIComponent(qrcodeData);
      const { ...student } = (
        await axios.get(`${API_URL}/students/${qrcodeEncoded}?qrcode=1`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ).data;
      const courseId = state.classes[classId].courseId!;
      const course = state.courses[courseId];
      console.log(`attendance: ${JSON.stringify(student, null, 2)}`);
      const isPresent = student.attendance
        .find((attendance) => attendance.courseId === courseId)
        ?.data.find((cClass) => cClass.classId === classId)?.present;
      if (isPresent === true) {
        studentRef.current = student;
        setAlreadyPresentDialogOpen(true);
      } else {
        if (course.studentIds!.includes(student.id)) {
          studentRef.current = student;
          setPresentDialogOpen(true);
        }
      }
    } catch (err: any) {
      const { student, error: errorCode } = err.response?.data ?? {};
      if (errorCode === 'attendance-already-exists') {
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
  const newUrl = `${SERVER_URL}${student?.photoUrl?.replaceAll('\\', '/')}`;
  console.log(`newPhotoUrl: ${newUrl}`);
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
          <Dialog.Title>Mark student present?</Dialog.Title>
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
            <Button
              onPress={async () => {
                setPresentDialogOpen(false);
                await state.markPresent({
                  classId,
                  studentId: student?.id,
                });
                ToastAndroid.show(
                  `${getFullName(studentRef.current)} marked present`,
                  ToastAndroid.SHORT
                );
              }}
            >
              Mark present
            </Button>
            <Button onPress={() => setPresentDialogOpen(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Portal>
        <Dialog visible={alreadyPresentDialogOpen}>
          <Dialog.Title>Student already present</Dialog.Title>
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
                  style={{ width: 200, height: 200 }}
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
                setAlreadyPresentDialogOpen(false);
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
