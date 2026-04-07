'use client';

import { Button } from '@/components/ui/button';

export type CalendarView = 'week' | 'month' | 'year';

interface ViewSwitcherProps {
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
}

const VIEWS: { value: CalendarView; label: string }[] = [
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
  { value: 'year', label: 'Año' },
];

export function ViewSwitcher({ view, onViewChange }: ViewSwitcherProps) {
  return (
    <div className="flex gap-1 rounded-lg bg-muted p-1">
      {VIEWS.map((v) => (
        <Button
          key={v.value}
          variant={view === v.value ? 'default' : 'ghost'}
          size="sm"
          className="flex-1"
          onClick={() => onViewChange(v.value)}
        >
          {v.label}
        </Button>
      ))}
    </div>
  );
}
