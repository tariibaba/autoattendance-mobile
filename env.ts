type ServerSource = 'emulator' | 'ndu-pg-wifi' | 'ibgwifi';
const server: ServerSource = 'ibgwifi' as ServerSource;

export const SERVER_URL =
  server === 'emulator'
    ? 'http://10.0.2.2:3000'
    : server === 'ndu-pg-wifi'
    ? 'http://192.168.1.107:3000'
    : 'http://192.168.8.109:3000';

export const API_URL = `${SERVER_URL}/api`;
