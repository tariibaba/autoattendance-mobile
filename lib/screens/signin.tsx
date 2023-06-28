import { View, SafeAreaView, StatusBar, Text } from 'react-native';
import { HelperText, TextInput, Button } from 'react-native-paper';
import React, { useContext, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import { API_URL } from '../../env';
import {
  useForm,
  SubmitErrorHandler,
  SubmitHandler,
  FormProvider,
} from 'react-hook-form';
import { useAppState } from '../state';
import { FormTextInput } from '../form-text-input';
import { FormErrorHelperText } from '../form-error-helper-text';

type FormValues = {
  username: string;
  password: string;
};

export default function SignInScreen({ route, navigation }) {
  const formValues = useForm<FormValues>({ mode: 'onSubmit' });
  const { handleSubmit, setError } = formValues;
  const { ...methods } = formValues;

  const state = useAppState();

  const onValid: SubmitHandler<FormValues> = async (data) => {
    const url = `${API_URL}/auth/login`;
    try {
      const res = await axios.post(url, {
        ...data,
        roles: ['student', 'hod', 'lecturer'],
      });
      const { username, role, token, id } = res?.data ?? {};
      await state.createUserSession({
        username: username,
        userRole: role,
        token,
        userId: id,
      });
      navigation.replace('Home');
    } catch (err: any) {
      console.error(err);
      if (!err.response) {
        setError('username', { message: 'Something went wrong' });
        return;
      }
      const { error } = err.response.data;
      if (error === 'user-invalid') {
        setError('username', {
          message: `No user with username ${data.username}`,
        });
        return;
      }
      if (error === 'password-invalid') {
        setError('password', { message: 'Wrong password' });
      }
    }
  };

  const onInvalid: SubmitErrorHandler<FormValues> = (err) => {};

  return (
    <FormProvider {...methods}>
      <View>
        <StatusBar />
        <View style={{ margin: 16 }}>
          <FormTextInput
            name="username"
            textInput={{ label: 'Username' }}
            rules={{ required: 'Enter username' }}
          />
          <FormErrorHelperText name="username" />

          <FormTextInput
            name="password"
            textInput={{
              secureTextEntry: true,
              label: 'Password',
              style: { marginTop: 8 },
            }}
            rules={{ required: 'Enter password' }}
          />
          <FormErrorHelperText name="password" />

          <Button
            mode="contained"
            onPress={handleSubmit(onValid, onInvalid)}
            style={{ marginTop: 32 }}
          >
            Sign in
          </Button>
        </View>
      </View>
    </FormProvider>
  );
}
