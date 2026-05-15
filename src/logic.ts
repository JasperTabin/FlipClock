import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

export interface ClockSettings {
  isMilitaryTime: boolean;
  hideSeconds: boolean;
  fullScreenMode: boolean;
}

export interface TimeState {
  hours: string;
  minutes: string;
  seconds: string;
  month: string;
  date: string;
  day: string;
}

export interface DigitUnitProps {
  value: string;
  label: string;
}

export interface FlipCardProps {
  value: string;
}

export interface FlipPanelProps {
  value: string;
  position: 'upper' | 'lower';
  className?: string;
}

export interface SeparatorProps {
  label: string;
}

export interface ToggleProps {
  checked: boolean;
  label: string;
  description: string;
  onChange: (checked: boolean) => void;
}

export interface SettingsPanelProps {
  settings: ClockSettings;
  onSettingChange: (settings: Partial<ClockSettings>) => void;
  onReset: () => void;
}

const FLIP_CLASS = 'is-flipping';
const FLIP_DURATION_MS = 450;
const SETTINGS_STORAGE_KEY = 'flip-clock-settings';

export const DEFAULT_SETTINGS: ClockSettings = {
  isMilitaryTime: true,
  hideSeconds: false,
  fullScreenMode: false,
};

export const pad = (value: number): string => value.toString().padStart(2, '0');

export const splitDigits = (value: string): [string, string] => {
  const paddedValue = value.padStart(2, '0');

  return [paddedValue[0] ?? '0', paddedValue[1] ?? '0'];
};

const isSettingsRecord = (value: unknown): value is Partial<ClockSettings> => {
  return typeof value === 'object' && value !== null;
};

const readStoredSettings = (): ClockSettings => {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }

  const storedValue = window.localStorage.getItem(SETTINGS_STORAGE_KEY);

  if (storedValue === null) {
    return DEFAULT_SETTINGS;
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue);

    if (!isSettingsRecord(parsedValue)) {
      return DEFAULT_SETTINGS;
    }

    return {
      isMilitaryTime:
        typeof parsedValue.isMilitaryTime === 'boolean'
          ? parsedValue.isMilitaryTime
          : DEFAULT_SETTINGS.isMilitaryTime,
      hideSeconds:
        typeof parsedValue.hideSeconds === 'boolean'
          ? parsedValue.hideSeconds
          : DEFAULT_SETTINGS.hideSeconds,
      fullScreenMode:
        typeof parsedValue.fullScreenMode === 'boolean'
          ? parsedValue.fullScreenMode
          : DEFAULT_SETTINGS.fullScreenMode,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const getCurrentTimeState = (isMilitaryTime: boolean): TimeState => {
  const now = new Date();
  const hours = now.getHours();
  const displayHours = isMilitaryTime ? hours : hours % 12 || 12;

  return {
    hours: pad(displayHours),
    minutes: pad(now.getMinutes()),
    seconds: pad(now.getSeconds()),
    month: now.toLocaleString(undefined, { month: 'long' }),
    date: pad(now.getDate()),
    day: now.toLocaleString(undefined, { weekday: 'long' }),
  };
};

export function useSettings(): {
  settings: ClockSettings;
  updateSettings: (nextSettings: Partial<ClockSettings>) => void;
  resetSettings: () => void;
} {
  const [settings, setSettings] = useState<ClockSettings>(() => readStoredSettings());

  useEffect(() => {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (nextSettings: Partial<ClockSettings>): void => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      ...nextSettings,
    }));
  };

  const resetSettings = (): void => {
    setSettings(DEFAULT_SETTINGS);
  };

  return { settings, updateSettings, resetSettings };
}

export function useFlipClock(isMilitaryTime: boolean): TimeState {
  const [time, setTime] = useState<TimeState>(() => getCurrentTimeState(isMilitaryTime));

  useEffect(() => {
    let intervalId: number | undefined;

    const syncTime = (): void => {
      setTime(getCurrentTimeState(isMilitaryTime));
    };

    syncTime();

    const now = new Date();
    const delayUntilNextSecond = 1_000 - now.getMilliseconds();

    const timeoutId = window.setTimeout(() => {
      syncTime();
      intervalId = window.setInterval(syncTime, 1_000);
    }, delayUntilNextSecond);

    return () => {
      window.clearTimeout(timeoutId);

      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
    };
  }, [isMilitaryTime]);

  return time;
}

export function useFlipAnimation(value: string, ref: RefObject<HTMLElement | null>): string {
  const previousValueRef = useRef<string>(value);
  const [outgoingValue, setOutgoingValue] = useState<string>(value);

  useEffect(() => {
    const el = ref.current;

    if (previousValueRef.current === value || el === null) {
      previousValueRef.current = value;
      return;
    }

    el.classList.remove(FLIP_CLASS);
    void el.offsetHeight;
    el.classList.add(FLIP_CLASS);

    const timeoutId = window.setTimeout(() => {
      el.classList.remove(FLIP_CLASS);
      previousValueRef.current = value;
      setOutgoingValue(value);
    }, FLIP_DURATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
      el.classList.remove(FLIP_CLASS);
    };
  }, [value, ref]);

  return outgoingValue;
}
