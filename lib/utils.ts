"use client";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import axios from 'axios';
import { use } from "react";
import { debug } from "console";
import { v4 as uuidv4 } from 'uuid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 支持的语言映射
const SUPPORTED_LANGS: Record<string, string> = {
  'zh-CN': 'zh-CN',
  'zh-TW': 'zh-TW',
  'zh-Hant': 'zh-TW',
  'ja': 'ja',
  'pt': 'pt',
  'fr': 'fr',
  'de': 'de',
  'es': 'es',
  'it': 'it',
  'ar': 'ar',
  'th': 'th',
};

const getLang = () => {
  const lang = navigator.language || 'zh-CN';
  // 兼容繁体
  if (lang.startsWith('zh')) {
    if (lang.includes('Hant') || lang.includes('TW')) return 'zh-TW';
    return 'zh-CN';
  }
  return SUPPORTED_LANGS[lang] || 'en';
};

const getDeviceId = () => {
  if (typeof window === 'undefined') return '';
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
};

const getDeviceName = () => {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return 'iPhone';
  if (/iPad/.test(ua)) return 'iPad';
  if (/Android/.test(ua)) {
    const m = ua.match(/;\s*([^;)]+)\s*Build\//);
    return m ? m[1].trim() : 'Android';
  }
  if (/Macintosh/.test(ua)) return 'Mac';
  if (/Windows/.test(ua)) return 'Windows';
  return 'Web';
};


export const ACCESS_KEY = '6sp5ASLlTO';
const accesskey = ACCESS_KEY;
const buildVersion = '1';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return '/api/proxy';
  return process.env.NEXT_PUBLIC_API_BASE_URL;
};

export const getCommonParams = () => {
  if (typeof window === 'undefined') {
    return {
      accesskey,
      buildVersion,
      deviceId: '',
      lang: 'zh-TW',
      deviceName: '',
      platform: 'web',
    };
  }
  return {
    accesskey,
    buildVersion,
    deviceId: getDeviceId(),
    lang: getLang(),
    deviceName: getDeviceName(),
    platform: 'web',
  };
};

export const apiClient = axios.create({
  baseURL: `${getBaseUrl()}/${accesskey}`,
  headers: {
    'Content-Type': 'application/json',
    'YY-Basic-Params': JSON.stringify(getCommonParams()),
  },
});

const TOKEN_KEY = 'dl_token';

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

const setToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

// 设备登录，获取匿名 token
const deviceLogin = async (): Promise<string> => {
  const params = getCommonParams();
  const res = await axios.post(
    `${getBaseUrl()}/${accesskey}/user/device-Login`,
    params,
    {
      headers: {
        'Content-Type': 'application/json',
        'YY-Basic-Params': JSON.stringify(params),
      },
    }
  );
  const token: string = res.data?.data?.token ?? res.data?.token ?? '';
  if (token) setToken(token);
  return token;
};

// 进入需要鉴权的页面前调用：有 token 直接用，没有则登录
export const ensureAuth = async (): Promise<string> => {
  const existing = getToken();
  if (existing) return existing;
  return deviceLogin();
};

// 请求拦截器：自动附带 token
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});
