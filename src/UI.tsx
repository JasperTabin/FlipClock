import { useEffect, useRef } from 'react';
import {
  Clock3,
  Maximize2,
  Minimize2,
  RotateCcw,
  TimerOff,
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

interface IconButtonProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

function IconButton({ icon: Icon, label, isActive = false, onClick }: IconButtonProps) {
  return (
    <button
      type="button"
      className={[
        'flex h-12 w-12 items-center justify-center rounded-full border shadow-2xl shadow-black/50 backdrop-blur transition',
        isActive
          ? 'border-white bg-white text-black'
          : 'border-neutral-800 bg-black/80 text-neutral-300 hover:border-white hover:text-white',
      ].join(' ')}
      onClick={onClick}
      aria-label={label}
    >
      <Icon size={22} strokeWidth={2.5} aria-hidden="true" />
    </button>
  );
}

interface SettingsDockProps {
  isMilitaryTime: boolean;
  hideSeconds: boolean;
  onToggleMilitaryTime: () => void;
  onToggleHideSeconds: () => void;
  onEnterFullScreen: () => void;
  onReset: () => void;
}

function SettingsDock({
  isMilitaryTime,
  hideSeconds,
  onToggleMilitaryTime,
  onToggleHideSeconds,
  onEnterFullScreen,
  onReset,
}: SettingsDockProps) {
  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-3">
      <IconButton
        icon={Clock3}
        label="Toggle 24-hour time"
        isActive={isMilitaryTime}
        onClick={onToggleMilitaryTime}
      />
      <IconButton
        icon={TimerOff}
        label="Toggle seconds"
        isActive={hideSeconds}
        onClick={onToggleHideSeconds}
      />
      <IconButton icon={Maximize2} label="Enter full screen" onClick={onEnterFullScreen} />
      <IconButton icon={RotateCcw} label="Reset settings" onClick={onReset} />
    </div>
  );
}

interface FullScreenExitProps {
  onExit: () => void;
}

function FullScreenExit({ onExit }: FullScreenExitProps) {
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <IconButton icon={Minimize2} label="Exit full screen" onClick={onExit} />
    </div>
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
        <FullScreenExit
          onExit={() => {
            requestFullscreenMode(false);
            updateSettings({ fullScreenMode: false });
          }}
        />
      )}

      {!settings.fullScreenMode && (
        <SettingsDock
          isMilitaryTime={settings.isMilitaryTime}
          hideSeconds={settings.hideSeconds}
          onToggleMilitaryTime={() => {
            updateSettings({ isMilitaryTime: !settings.isMilitaryTime });
          }}
          onToggleHideSeconds={() => {
            updateSettings({ hideSeconds: !settings.hideSeconds });
          }}
          onEnterFullScreen={() => {
            requestFullscreenMode(true);
            updateSettings({ fullScreenMode: true });
          }}
          onReset={() => {
            requestFullscreenMode(false);
            resetSettings();
          }}
        />
      )}
    </div>
  );
}
