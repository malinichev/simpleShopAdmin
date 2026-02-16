import axios from 'axios';
import { env } from '@/shared/config';

export const api = axios.create({
  baseURL: env.API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
