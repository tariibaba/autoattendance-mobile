import React, { useEffect, useState } from 'react';
import { View, StatusBar } from 'react-native';
import { Text, List, ActivityIndicator } from 'react-native-paper';
import { getFullName } from '../full-name';
import { useAppState } from '../state';
import { ViewState } from '../types';

export default function Lecturers() {
  const [viewState, setViewState] = useState<ViewState>('loading');
  const state = useAppState();
  const lecturers = state?.lecturerList;

  console.log(lecturers);
  useEffect(() => {
    (async () => {
      await state.fetchLecturers();
      setViewState('success');
    })();
  }, []);

  return (
    <View>
      <StatusBar />
      {viewState === 'loading' ? (
        <ActivityIndicator animating={true} />
      ) : (
        lecturers.map((lecturer) => (
          <List.Item title={getFullName(lecturer)}></List.Item>
        ))
      )}
    </View>
  );
}
