const isEmulator = true;

export const API_URL = isEmulator
  ? 'http://10.0.2.2:3000/api'
  : 'http://192.168.8.109:3000/api';
