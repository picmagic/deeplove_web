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

const getDeviceName = () => encodeURIComponent(navigator.userAgent);

const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_BASE_URL;
};

const accesskey = '6svHCeo8VX'; // TODO: 替换为实际 key
const buildVersion = '1.0.0'; // TODO: 替换为实际版本

export const getCommonParams = () => {
  if (typeof window === 'undefined') {
    return {
      accesskey,
      buildVersion,
      deviceId: '',
      lang: 'zh-TW',
      deviceName: '',
    };
  }
  return {
    accesskey,
    buildVersion,
    deviceId: getDeviceId(),
    lang: getLang(),
    deviceName: getDeviceName(),
  };
};

export const apiClient = axios.create({
  baseURL: getBaseUrl() + '/accesskey=' + accesskey,
  headers: {
    'Content-Type': 'application/json',
    'YY-Basic-Params': JSON.stringify(getCommonParams()),
  },
});