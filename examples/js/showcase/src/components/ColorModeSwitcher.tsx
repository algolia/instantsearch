import { Monitor, Sun, Moon } from 'lucide-preact';

import { useColorMode, type ColorMode } from '../hooks/useColorMode';

import { SegmentedControl, type SegmentedOption } from './SegmentedControl';

const options: SegmentedOption<ColorMode>[] = [
  { value: 'system', label: 'System', icon: <Monitor size={14} /> },
  { value: 'light', label: 'Light', icon: <Sun size={14} /> },
  { value: 'dark', label: 'Dark', icon: <Moon size={14} /> },
];

export function ColorModeSwitcher() {
  const { mode, setMode } = useColorMode();

  return (
    <SegmentedControl
      class="shrink-0"
      options={options}
      value={mode}
      onChange={setMode}
    />
  );
}
