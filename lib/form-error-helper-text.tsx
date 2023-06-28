import React, { useEffect, useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { HelperText } from 'react-native-paper';

export type FormErrorHelperTextProps = {
  name: string;
};

function useForceUpdate() {
  const [state, setState] = useState(0);
  return () => setState((value) => value + 1);
}

export const FormErrorHelperText = ({ name }: FormErrorHelperTextProps) => {
  const { getFieldState, formState, watch } = useFormContext();
  // const forceUpdate = useForceUpdate();
  // useEffect(() => {
  //   forceUpdate();
  // }, [formState.errors[name]]);
  return (
    <HelperText type="error" visible={Boolean(formState.errors[name]?.message)}>
      <>{formState.errors[name]?.message}</>
    </HelperText>
  );
};
