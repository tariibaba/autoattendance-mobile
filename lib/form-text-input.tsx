import { Controller, useController, useFormContext } from 'react-hook-form';
import { TextInput } from 'react-native-paper';
import React from 'react';

export type FormTextInputProps = {
  textInput?: React.ComponentProps<typeof TextInput>;
} & Omit<React.ComponentProps<typeof Controller>, 'render'>;

export const FormTextInput = ({
  textInput,
  ...controllerProps
}: FormTextInputProps) => {
  const { control } = useFormContext();
  const { field } = useController({ control, ...controllerProps });
  return (
    <TextInput
      {...textInput}
      onChangeText={(value) => field.onChange(value)}
      onBlur={field.onBlur}
      value={field.value}
    />
  );
};
