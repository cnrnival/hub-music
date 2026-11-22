/**
 * Hub Music - VolumeSlider
 * Slider de volume com ícone de mute
 * Volume slider with mute icon
 *
 * @languages pt-BR / en-US
 */

import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { Button } from '@/ui/button';
import { Slider } from '@/ui/slider';
import { cn } from '@/lib/utils';

interface VolumeSliderProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  isMuted: boolean;
  className?: string;
}

export function VolumeSlider({
  volume,
  onVolumeChange,
  onMuteToggle,
  isMuted,
  className,
}: VolumeSliderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sliderRef.current && !sliderRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  const handleVolumeChange = (value: number[]) => {
    onVolumeChange(value[0]);
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className="w-5 h-5" />;
    if (volume < 0.5) return <Volume1 className="w-5 h-5" />;
    return <Volume2 className="w-5 h-5" />;
  };

  return (
    <div
      ref={sliderRef}
      className={cn('flex items-center gap-2', className)}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onMuteToggle}
        aria-label={isMuted ? 'Ativar som' : 'Mutar'}
        className="text-text-secondary hover:text-primary"
      >
        {getVolumeIcon()}
      </Button>

      {isExpanded && (
        <div className="relative w-24">
          <Slider
            value={[volume]}
            max={[1]}
            step={0.05}
            onValueChange={handleVolumeChange}
            className="h-1"
            aria-label="Volume"
          />
        </div>
      )}
    </div>
  );
}