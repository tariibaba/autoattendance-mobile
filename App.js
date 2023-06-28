import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import SignInScreen from './lib/screens/signin';
import CoursesTab from './lib/screens/courses';
import StudentsTab from './lib/screens/students';
import { AppState, useAppState } from './lib/state';
import React from 'react';
import { AppStateProvider } from './lib/state';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Lecturers from './lib/screens/lecturers';

const Stack = createNativeStackNavigator();

const Tab = createMaterialTopTabNavigator();

function Home() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Lecturers"
        component={Lecturers}
        options={{ title: 'Lecturers' }}
      />
      <Tab.Screen
        name="Courses"
        component={CoursesTab}
        options={{ title: 'Courses' }}
      />
      <Tab.Screen
        name="Students"
        component={StudentsTab}
        options={{ title: 'Students' }}
      />
    </Tab.Navigator>
  );
}

function App() {
  const [route, setRoute] = useState(null);
  const state = useAppState();

  useEffect(() => {
    (async () => {
      await state.readUserSession();
      setRoute(state.userSession?.token ? 'Home' : 'UserRole');
    })();
  }, []);

  return (
    <NavigationContainer>
      {(() => {
        if (route) {
          return (
            <Stack.Navigator initialRouteName={route}>
              <Stack.Screen
                name="SignIn"
                component={SignInScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Home"
                component={Home}
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
          );
        } else {
          return (
            <View style={{ height: '100%' }}>
              <View style={{ flex: 1, margin: 16, alignItems: 'center' }}>
                <Text>Loading...</Text>
              </View>
            </View>
          );
        }
      })()}
    </NavigationContainer>
  );
}

export default function AppWrapper() {
  return (
    <AppStateProvider>
      <App />
    </AppStateProvider>
  );
}
