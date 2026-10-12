// Глубинные контейнерные утилиты кастуют структуру неизвестной формы — any здесь неустраним.
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Удаляет пробельные или заданные символы из начала и конца строки.
 */
export function trim(str: string, chars?: string): string {
  if (chars === undefined) {
    return str.trim();
  }

  const escaped = chars.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  const regex = new RegExp(`^[${escaped}]+|[${escaped}]+$`, 'g');
  return str.replace(regex, '');
}

type AnyObj = Record<string, any>;

/**
 * Глубоко объединяет два объекта с сохранением порядка ключей.
 * Сначала идут ключи из obj1, затем уникальные ключи из obj2.
 * Использует deepCopy для избежания мутаций исходных объектов.
 */
export function merge<T extends AnyObj, U extends AnyObj>(obj1: T, obj2: U): T & U {
  const result: AnyObj = deepCopy(obj1);

  for (const [key, val2] of Object.entries(obj2)) {
    const val1 = result[key];

    const isMergeable = (v: unknown): v is AnyObj =>
      !!v && typeof v === 'object' && !Array.isArray(v);

    if (isMergeable(val1) && isMergeable(val2)) {
      result[key] = merge(val1, val2);
    } else {
      result[key] = val2;
    }
  }

  return result as T & U;
}

/**
 * Устанавливает значение в объекте по указанному пути.
 * Создает промежуточные объекты или массивы, если их нет.
 */
export function set<T extends object>(obj: T, path: string, value: any): T {
  if (typeof path !== 'string') {
    throw new Error('path must be string');
  }

  const keys = path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean);

  if (keys.length === 0) return obj;

  let current: any = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const nextKey = keys[i + 1];
    const isNextArrayIndex = /^\d+$/.test(nextKey);

    if (current[key] === undefined || current[key] === null) {
      current[key] = isNextArrayIndex ? [] : {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;

  return obj;
}

/**
 * Выполняет глубокое сравнение двух объектов.
 * Аргументами могут быть только объекты.
 * Поддерживает Date, RegExp, Map, Set, циклические ссылки и корректно сравнивает NaN.
 */
export function isEqual(a: object, b: object): boolean {
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    throw new TypeError('Arguments must be objects');
  }

  const cache = new WeakMap<object, object>();

  function deepEqual(x: any, y: any): boolean {
    if (Object.is(x, y)) return true;

    if (typeof x !== 'object' || x === null || typeof y !== 'object' || y === null) {
      return false;
    }

    if (cache.has(x) && cache.get(x) === y) return true;
    cache.set(x, y);

    const tagX = Object.prototype.toString.call(x);
    const tagY = Object.prototype.toString.call(y);

    if (tagX !== tagY) return false;

    if (tagX === '[object Date]') return x.getTime() === y.getTime();
    if (tagX === '[object RegExp]') return x.source === y.source && x.flags === y.flags;

    if (tagX === '[object Array]') {
      if (x.length !== y.length) return false;
      for (let i = 0; i < x.length; i++) {
        if (!deepEqual(x[i], y[i])) return false;
      }
      return true;
    }

    if (tagX === '[object Map]') {
      if (x.size !== y.size) return false;
      for (const [key, val] of x) {
        if (!y.has(key) || !deepEqual(val, y.get(key))) return false;
      }
      return true;
    }

    if (tagX === '[object Set]') {
      if (x.size !== y.size) return false;
      const arrX = Array.from(x);
      const arrY = Array.from(y);
      for (const valX of arrX) {
        let found = false;
        for (const valY of arrY) {
          if (deepEqual(valX, valY)) {
            found = true;
            break;
          }
        }
        if (!found) return false;
      }
      return true;
    }

    const keysX = Object.keys(x);
    const keysY = Object.keys(y);

    if (keysX.length !== keysY.length) return false;

    for (const key of keysX) {
      if (!Object.hasOwn(y, key)) return false;
      if (!deepEqual(x[key], y[key])) return false;
    }

    return true;
  }

  return deepEqual(a, b);
}

/**
 * Выполняет глубокое клонирование значения.
 * Поддерживает примитивы, массивы, объекты, Date, RegExp, Map, Set и циклические ссылки.
 */
export function deepCopy<T>(target: T, cache = new WeakMap<object, any>()): T {
  if (target === null || typeof target !== 'object') {
    return target;
  }

  const obj = target as object;

  if (cache.has(obj)) {
    return cache.get(obj);
  }

  const tag = Object.prototype.toString.call(obj);

  if (tag === '[object Date]') {
    return new Date((obj as Date).getTime()) as any;
  }

  if (tag === '[object RegExp]') {
    const regex = obj as RegExp;
    const newRegex = new RegExp(regex.source, regex.flags);
    newRegex.lastIndex = regex.lastIndex;
    return newRegex as any;
  }

  if (tag === '[object Map]') {
    const map = new Map();
    cache.set(obj, map);
    (obj as Map<any, any>).forEach((value, key) => {
      map.set(deepCopy(key, cache), deepCopy(value, cache));
    });
    return map as any;
  }

  if (tag === '[object Set]') {
    const set = new Set();
    cache.set(obj, set);
    (obj as Set<any>).forEach((value) => {
      set.add(deepCopy(value, cache));
    });
    return set as any;
  }

  if (Array.isArray(obj)) {
    const arr: any[] = [];
    cache.set(obj, arr);
    for (let i = 0; i < obj.length; i++) {
      arr[i] = deepCopy(obj[i], cache);
    }
    return arr as any;
  }

  const clone = Object.create(Object.getPrototypeOf(obj));
  cache.set(obj, clone);

  for (const key of Object.keys(obj)) {
    clone[key] = deepCopy((obj as any)[key], cache);
  }

  for (const sym of Object.getOwnPropertySymbols(obj)) {
    const desc = Object.getOwnPropertyDescriptor(obj, sym);
    if (desc?.enumerable) {
      clone[sym] = deepCopy((obj as any)[sym], cache);
    }
  }

  return clone as T;
}

/**
 * Утилита для работы с query-параметрами URL.
 * Поддерживает вложенные объекты, массивы, дубликаты ключей и корректное кодирование.
 */
export const queryString = {
  /**
   * Парсит строку запроса в объект.
   * Поддерживает вложенные объекты (a[b]=1), массивы (a[]=1) и дубликаты ключей.
   */
  parse<T = Record<string, any>>(str: string): T {
    const result: Record<string, any> = {};
    if (!str) return result as T;

    const cleanStr = str.startsWith('?') ? str.slice(1) : str;
    const pairs = cleanStr.split('&');

    for (const pair of pairs) {
      if (!pair) continue;
      const [rawKey, rawValue = ''] = pair.split('=');

      let key: string;
      let value: string;
      try {
        key = decodeURIComponent(rawKey);
        value = decodeURIComponent(rawValue);
      } catch {
        key = rawKey;
        value = rawValue;
      }

      const keys = key.replace(/\]/g, '').split('[');
      let current = result;

      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        const nextKey = keys[i + 1];
        const isLast = i === keys.length - 1;

        if (isLast) {
          if (k === '') {
            if (!Array.isArray(current)) current = [];
            (current as any[]).push(value);
          } else {
            if (current[k] !== undefined) {
              if (Array.isArray(current[k])) {
                current[k].push(value);
              } else {
                current[k] = [current[k], value];
              }
            } else {
              current[k] = value;
            }
          }
        } else {
          const isArrayIndex = nextKey === '' || /^\d+$/.test(nextKey);
          if (current[k] === undefined) {
            current[k] = isArrayIndex ? [] : {};
          }
          current = current[k];
        }
      }
    }
    return result as T;
  },

  /**
   * Превращает объект в строку запроса (URL-encoded).
   * Использует паттерн аккумулирования пар для оптимальной производительности.
   */
  stringify(obj: Record<string, any>, prefix?: string): string {
    const pairs: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
      const encodedKey = encodeURIComponent(key);
      const fullKey = prefix ? `${prefix}[${encodedKey}]` : encodedKey;

      if (value === undefined) {
        continue;
      }

      if (value === null) {
        pairs.push(`${fullKey}=`);
      } else if (typeof value === 'object' && !(value instanceof Date)) {
        // вызов через queryString, а не this — метод должен работать и в деструктурированном виде
        const nested = queryString.stringify(value, fullKey);
        if (nested) pairs.push(nested);
      } else {
        pairs.push(`${fullKey}=${encodeURIComponent(String(value))}`);
      }
    }
    return pairs.join('&');
  },
};
