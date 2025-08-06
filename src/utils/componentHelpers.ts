/**
 * 组件开发辅助工具函数
 * 提供常用的组件开发模式和工具
 */

import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { AttributeValue, AttributeValidation } from '../types/attributes';

/**
 * 防抖Hook
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback((...args: Parameters<T>) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]) as T;
};

/**
 * 节流Hook
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastCallRef = useRef<number>(0);
  
  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now;
      callback(...args);
    }
  }, [callback, delay]) as T;
};

/**
 * 本地存储Hook
 */
export const useLocalStorage = <T>(
  key: string,
  defaultValue: T
): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const setValue = useCallback((value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  return [storedValue, setValue];
};

/**
 * 表单验证Hook
 */
export const useValidation = () => {
  const validateValue = useCallback((
    value: AttributeValue,
    validation?: AttributeValidation
  ): string[] => {
    const errors: string[] = [];
    
    if (!validation) return errors;
    
    // 必填验证
    if (validation.required && (value === null || value === undefined || value === '')) {
      errors.push(validation.errorMessage || '此字段为必填项');
    }
    
    // 字符串验证
    if (typeof value === 'string') {
      if (validation.minLength && value.length < validation.minLength) {
        errors.push(`最少需要 ${validation.minLength} 个字符`);
      }
      if (validation.maxLength && value.length > validation.maxLength) {
        errors.push(`最多允许 ${validation.maxLength} 个字符`);
      }
      if (validation.pattern) {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(value)) {
          errors.push(validation.errorMessage || '格式不正确');
        }
      }
    }
    
    // 数字验证
    if (typeof value === 'number') {
      if (validation.min !== undefined && value < validation.min) {
        errors.push(`数值不能小于 ${validation.min}`);
      }
      if (validation.max !== undefined && value > validation.max) {
        errors.push(`数值不能大于 ${validation.max}`);
      }
    }
    
    // 数组验证
    if (Array.isArray(value)) {
      if (validation.minLength && value.length < validation.minLength) {
        errors.push(`至少需要 ${validation.minLength} 个项目`);
      }
      if (validation.maxLength && value.length > validation.maxLength) {
        errors.push(`最多允许 ${validation.maxLength} 个项目`);
      }
    }
    
    return errors;
  }, []);
  
  return { validateValue };
};

/**
 * 键盘快捷键Hook
 */
export const useKeyboardShortcut = (
  keyCombo: string,
  callback: () => void,
  dependencies: any[] = []
) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const keys = keyCombo.toLowerCase().split('+');
      const modifiers = keys.filter(key => ['ctrl', 'alt', 'shift', 'meta'].includes(key));
      const mainKey = keys.find(key => !['ctrl', 'alt', 'shift', 'meta'].includes(key));
      
      const ctrlPressed = modifiers.includes('ctrl') ? event.ctrlKey : !event.ctrlKey;
      const altPressed = modifiers.includes('alt') ? event.altKey : !event.altKey;
      const shiftPressed = modifiers.includes('shift') ? event.shiftKey : !event.shiftKey;
      const metaPressed = modifiers.includes('meta') ? event.metaKey : !event.metaKey;
      
      if (
        event.key.toLowerCase() === mainKey &&
        ctrlPressed && altPressed && shiftPressed && metaPressed
      ) {
        event.preventDefault();
        callback();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, dependencies);
};

/**
 * 外部点击检测Hook
 */
export const useClickOutside = (
  callback: () => void
) => {
  const ref = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [callback]);
  
  return ref;
};

/**
 * 元素尺寸观察Hook
 */
export const useResizeObserver = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });
  
  useEffect(() => {
    if (!ref.current) return;
    
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });
    
    resizeObserver.observe(ref.current);
    
    return () => resizeObserver.disconnect();
  }, []);
  
  return [ref, dimensions] as const;
};

/**
 * 异步操作状态Hook
 */
export const useAsyncOperation = <T>() => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<T | null>(null);
  
  const execute = useCallback(async (operation: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '操作失败';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);
  
  return {
    loading,
    error,
    data,
    execute,
    reset
  };
};

/**
 * CSS类名合并工具
 */
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

/**
 * 深度比较工具
 */
export const deepEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  
  if (a == null || b == null) return false;
  
  if (typeof a !== typeof b) return false;
  
  if (typeof a !== 'object') return false;
  
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  
  return true;
};

/**
 * 深度合并对象
 */
export const deepMerge = <T extends Record<string, any>>(target: T, source: Partial<T>): T => {
  const result = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key];
      const targetValue = target[key];
      
      if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue) &&
          targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue)) {
        result[key] = deepMerge(targetValue, sourceValue);
      } else {
        result[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
  }
  
  return result;
};

/**
 * 对象差异比较工具
 */
export const getDifferences = <T extends Record<string, any>>(
  original: T,
  modified: T
): Partial<T> => {
  const differences: Partial<T> = {};
  
  for (const key in modified) {
    if (modified.hasOwnProperty(key)) {
      if (!deepEqual(original[key], modified[key])) {
        differences[key] = modified[key];
      }
    }
  }
  
  return differences;
};

/**
 * 安全的JSON解析
 */
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
};

/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 生成随机ID
 */
export const generateId = (prefix = 'id'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}; 