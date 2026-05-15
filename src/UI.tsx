import { useEffect, useRef, useState } from 'react';
import {
  Clock3,
  Maximize2,
  Minimize2,
  RotateCcw,
  Settings,
  TimerOff,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  useSettings,
  splitDigits,
  useFlipAnimation,
  useFlipClock,
  type ClockSettings,
  type DigitUnitProps,
  type FlipCardProps,
  type FlipPanelProps,
  type SeparatorProps,
  type SettingsPanelProps,
  type ToggleProps,
} from './logic';

function FlipPanel({ value, position, className = '' }: FlipPanelProps) {
  const isUpper = position === 'upper';

  return (
    <div
      className={[
        'absolute left-0 right-0 overflow-hidden bg-neutral-800',
        isUpper
          ? 'top-0 h-1/2 rounded-t-lg items-end shadow-[inset_0_-1px_0_#171717]'
          : 'bottom-0 h-1/2 rounded-b-lg items-start shadow-[inset_0_1px_0_#171717]',
        className,
      ].join(' ')}
      style={{ display: 'flex', justifyContent: 'center' }}
    >
      <span
        className="select-none font-mono font-bold leading-none tracking-normal text-white tabular-nums"
        style={{
          fontSize: 'clamp(4rem, 14vw, 13rem)',
          position: 'absolute',
          [isUpper ? 'bottom' : 'top']: 0,
          transform: isUpper ? 'translateY(50%)' : 'translateY(-50%)',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function FlipCard({ value }: FlipCardProps) {
  const cardRef = useRef<HTMLElement | null>(null);
  const previousValue = useFlipAnimation(value, cardRef);

  return (
    <section
      ref={cardRef}
      className="flip-card relative h-[clamp(7rem,18vw,16rem)] w-[clamp(4.5rem,11vw,10rem)] overflow-hidden rounded-lg bg-black shadow-2xl shadow-black/60"
      aria-label={value}
    >
      <FlipPanel
        value={previousValue}
        position="lower"
        className="absolute bottom-0 left-0 right-0 z-10"
      />
      <FlipPanel
        value={value}
        position="upper"
        className="absolute left-0 right-0 top-0 z-20"
      />
      <FlipPanel
        value={previousValue}
        position="upper"
        className="flap-top pointer-events-none"
      />
      <FlipPanel
        value={value}
        position="lower"
        className="flap-bottom pointer-events-none"
      />
    </section>
  );
}

function DigitUnit({ value, label }: DigitUnitProps) {
  const [tens, ones] = splitDigits(value);

  return (
    <div className="flex flex-col items-center gap-4" aria-label={label}>
      <div className="flex gap-[clamp(0.35rem,1vw,0.8rem)]">
        <FlipCard value={tens} />
        <FlipCard value={ones} />
      </div>
      <span className="font-mono text-sm font-black uppercase tracking-[0.35em] text-zinc-200 sm:text-base">
        {label}
      </span>
    </div>
  );
}

function Separator({ label }: SeparatorProps) {
  return (
    <div
      className="flex h-[clamp(7rem,18vw,16rem)] items-center px-[clamp(0.2rem,1vw,0.8rem)] font-mono text-[clamp(3rem,8vw,7rem)] font-bold leading-none text-zinc-500"
      aria-label={label}
      role="separator"
    >
      :
    </div>
  );
}

interface IconToggleProps extends ToggleProps {
  icon: LucideIcon;
}

function IconToggle({ checked, label, description, onChange, icon: Icon }: IconToggleProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-neutral-800 bg-neutral-950/80 px-4 py-3">
      <span className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-neutral-900 text-white">
          <Icon size={20} strokeWidth={2.5} aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block font-mono text-sm font-black uppercase tracking-[0.18em] text-white">
            {label}
          </span>
          <span className="mt-1 block text-sm leading-5 text-neutral-400">{description}</span>
        </span>
      </span>

      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(event) => {
          onChange(event.currentTarget.checked);
        }}
      />
      <span
        className={[
          'relative h-7 w-12 shrink-0 rounded-full shadow-inner shadow-black transition',
          checked ? 'bg-white' : 'bg-neutral-800',
        ].join(' ')}
      >
        <span
          className={[
            'absolute left-1 top-1 h-5 w-5 rounded-full transition',
            checked ? 'translate-x-5 bg-black' : 'translate-x-0 bg-white',
          ].join(' ')}
        />
      </span>
    </label>
  );
}

function SettingsPanel({ settings, onSettingChange, onReset }: SettingsPanelProps) {
  return (
    <aside className="fixed bottom-20 left-4 z-50 w-[calc(100vw-2rem)] max-w-md rounded-xl border border-neutral-800 bg-black/90 p-4 shadow-2xl shadow-black/60 backdrop-blur">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-3 font-mono text-sm font-black uppercase tracking-[0.35em] text-white">
          <Settings size={18} strokeWidth={2.5} aria-hidden="true" />
          General
        </h2>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-md border border-neutral-700 text-neutral-200 transition hover:border-white hover:text-white"
          onClick={onReset}
          aria-label="Reset settings"
          title="Reset settings"
        >
          <RotateCcw size={18} strokeWidth={2.5} aria-hidden="true" />
        </button>
      </div>

      <div className="grid gap-3">
        <IconToggle
          checked={settings.isMilitaryTime}
          icon={Clock3}
          label="Military Time"
          description="Use 24-hour time instead of 12-hour time."
          onChange={(checked) => {
            onSettingChange({ isMilitaryTime: checked });
          }}
        />
        <IconToggle
          checked={settings.hideSeconds}
          icon={TimerOff}
          label="Hours + Minutes"
          description="Hide seconds and show only hours and minutes."
          onChange={(checked) => {
            onSettingChange({ hideSeconds: checked });
          }}
        />
        <IconToggle
          checked={settings.fullScreenMode}
          icon={Maximize2}
          label="Full Screen Mode"
          description="Expand the clock and hide the settings panel."
          onChange={(checked) => {
            onSettingChange({ fullScreenMode: checked });
          }}
        />
      </div>
    </aside>
  );
}

function requestFullscreenMode(enabled: boolean): void {
  if (enabled && document.fullscreenElement === null) {
    void document.documentElement.requestFullscreen?.();
    return;
  }

  if (!enabled && document.fullscreenElement !== null) {
    void document.exitFullscreen?.();
  }
}

function FlipClock({ settings }: { settings: ClockSettings }) {
  const time = useFlipClock(settings.isMilitaryTime);

  return (
    <div className="flex flex-col items-center gap-8" aria-label="Current time">
      <div className="font-mono text-sm font-black uppercase tracking-[0.35em] text-zinc-200 sm:text-base">
        {time.month} <span className="text-zinc-500">|</span> {time.date}{' '}
        <span className="text-zinc-500">|</span> {time.day}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-y-8">
        <DigitUnit value={time.hours} label="Hour" />
        <Separator label="Hours minutes separator" />
        <DigitUnit value={time.minutes} label="Min" />
        {!settings.hideSeconds && (
          <>
            <Separator label="Minutes seconds separator" />
            <DigitUnit value={time.seconds} label="Sec" />
          </>
        )}
      </div>
    </div>
  );
}

export function ClockApp() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = (): void => {
      if (document.fullscreenElement === null && settings.fullScreenMode) {
        updateSettings({ fullScreenMode: false });
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [settings.fullScreenMode, updateSettings]);

  return (
    <div
      className={[
        'flex min-h-screen w-full flex-col items-center justify-center bg-black px-4 py-8 text-white',
        settings.fullScreenMode ? 'gap-0' : 'gap-10',
      ].join(' ')}
    >
      <FlipClock settings={settings} />

      {settings.fullScreenMode && (
        <button
          type="button"
          className="fixed bottom-4 left-4 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-neutral-800 bg-black/80 text-neutral-300 shadow-2xl shadow-black/50 backdrop-blur transition hover:border-white hover:text-white"
          onClick={() => {
            requestFullscreenMode(false);
            updateSettings({ fullScreenMode: false });
          }}
          aria-label="Exit full screen"
          title="Exit full screen"
        >
          <Minimize2 size={22} strokeWidth={2.5} aria-hidden="true" />
        </button>
      )}

      {!settings.fullScreenMode && isSettingsOpen && (
        <SettingsPanel
          settings={settings}
          onReset={() => {
            requestFullscreenMode(false);
            resetSettings();
          }}
          onSettingChange={(nextSettings) => {
            if (nextSettings.fullScreenMode !== undefined) {
              requestFullscreenMode(nextSettings.fullScreenMode);
              setIsSettingsOpen(false);
            }

            updateSettings(nextSettings);
          }}
        />
      )}

      {!settings.fullScreenMode && (
        <button
          type="button"
          className="fixed bottom-4 left-4 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-neutral-800 bg-black/80 text-neutral-300 shadow-2xl shadow-black/50 backdrop-blur transition hover:border-white hover:text-white"
          onClick={() => {
            setIsSettingsOpen((currentValue) => !currentValue);
          }}
          aria-label={isSettingsOpen ? 'Close settings' : 'Open settings'}
          title={isSettingsOpen ? 'Close settings' : 'Open settings'}
        >
          {isSettingsOpen ? (
            <X size={22} strokeWidth={2.5} aria-hidden="true" />
          ) : (
            <Settings size={22} strokeWidth={2.5} aria-hidden="true" />
          )}
        </button>
      )}
    </div>
  );
}
