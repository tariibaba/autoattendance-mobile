import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Button, PaperProvider, Text } from 'react-native-paper';
import SignInScreen from './lib/screens/signin';
import CoursesTab from './lib/screens/courses';
import StudentsTab from './lib/screens/students';
import { AppState, useAppState } from './lib/state';
import React from 'react';
import { AppStateProvider } from './lib/state';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Lecturers from './lib/screens/lecturers';
import { createDrawerNavigator } from '@react-navigation/drawer';
import axios from 'axios';
import { API_URL } from './env';
import { getFullName } from './lib/full-name';
import { deleteUserSession } from './lib/auth';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import StudentCoursesTab from './lib/screens/student-courses';
import { getFriendlyPercentage } from './lib/friendly-percentage';

const Stack = createNativeStackNavigator();

const Tab = createMaterialBottomTabNavigator();

const Drawer = createDrawerNavigator();

function UserInfo({ route, navigation }) {
  const state = useAppState();
  const { userId, username, userRole, token } = state.userSession ?? {};
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!state.userSession) return;

    (async () => {
      const url =
        userRole === 'lecturer' || userRole === 'hod'
          ? `${API_URL}/lecturers/${userId}`
          : `${API_URL}/students/${userId}`;
      const newData = (
        await axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
      ).data;
      setData(newData);
    })();
  }, [state.userSession]);

  return (
    <View style={{ flex: 1, margin: 16 }}>
      {data && <Text variant="bodyLarge">Name: {getFullName(data)}</Text>}
      <Text variant="bodyLarge">Username: {username}</Text>
      <Text variant="bodyLarge">
        Role:{' '}
        {userRole === 'lecturer'
          ? 'Lecturer'
          : userRole === 'hod'
          ? 'Head of Department'
          : 'Student'}
      </Text>
      {userRole === 'student' && (
        <Text variant="bodyLarge">
          Attendance: {getFriendlyPercentage(data?.attendanceRate)}
        </Text>
      )}
      <Button
        style={{ marginTop: 'auto' }}
        onPress={async () => {
          await state.signOut();
          navigation.navigate('SignIn');
        }}
      >
        Sign out
      </Button>
    </View>
  );
}

function AppDrawer() {
  return (
    <Drawer.Navigator initialRouteName="Home.Home">
      <Drawer.Screen
        name="Home.Home"
        component={Home}
        options={{ title: 'Home', headerShadowVisible: false }}
      />
      <Drawer.Screen name="Your info" component={UserInfo} />
    </Drawer.Navigator>
  );
}

function Home() {
  const userSession = useAppState().userSession;

  const role = userSession.userRole;
  const lecturerHod = ['lecturer', 'hod'].includes(role);

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => {
          const iconName =
            route.name === 'Courses'
              ? 'book'
              : route.name === 'Lecturers'
              ? 'account-multiple'
              : 'school';
          return {
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name={iconName} color={color} size={26} />
            ),
          };
        }}
      >
        {lecturerHod ? (
          <>
            {role === 'hod' ? (
              <Tab.Screen
                name="Lecturers"
                component={Lecturers}
                options={{ title: 'Lecturers' }}
              />
            ) : (
              <></>
            )}
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
          </>
        ) : (
          <>
            <Tab.Screen
              name="Student.Courses"
              component={StudentCoursesTab}
              options={{ title: 'Courses' }}
            />
          </>
        )}
      </Tab.Navigator>
    </>
  );
}

function App() {
  const [route, setRoute] = useState(null);
  const state = useAppState();

  useEffect(() => {
    (async () => {
      await state.readUserSession();
      setRoute(state.userSession?.token ? 'Home' : 'SignIn');
    })();
  }, []);

  return (
    <NavigationContainer>
      <PaperProvider>
        {(() => {
          if (route) {
            return (
              <Stack.Navigator
                initialRouteName={route}
                screenOptions={({ route }) => {
                  return {
                    title: route.name,
                  };
                }}
              >
                <Stack.Screen
                  name="SignIn"
                  component={SignInScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="Home"
                  component={AppDrawer}
                  options={{
                    headerShown: false,
                    title: 'Home',
                    headerShadowVisible: false,
                  }}
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
      </PaperProvider>
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
