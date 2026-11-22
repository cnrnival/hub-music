/**
 * Hub Music - DevicePicker
 * Seletor de dispositivo de saída de áudio (Web Audio API)
 * Audio output device picker (Web Audio API)
 *
 * @languages pt-BR / en-US
 */

import { useState, useEffect, useRef } from 'react';
import { Speaker, Headphones, Monitor, Smartphone, Check, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '../ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface MediaDeviceInfoExtended extends MediaDeviceInfo {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
  groupId: string;
}

interface DevicePickerProps {
  currentDeviceId?: string;
  onDeviceChange: (deviceId: string) => void;
  className?: string;
}

export function DevicePicker({
  currentDeviceId,
  onDeviceChange,
  className,
}: DevicePickerProps) {
  const [devices, setDevices] = useState<MediaDeviceInfoExtended[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDevices = async () => {
      try {
        // Request permission first
        await navigator.mediaDevices.getUserMedia({ audio: true });

        const deviceList = await navigator.mediaDevices.enumerateDevices();
        const audioOutputDevices = deviceList
          .filter((device): device is MediaDeviceInfoExtended =>
            device.kind === 'audiooutput'
          )
          .map((device) => ({
            deviceId: device.deviceId,
            label: device.label || `Dispositivo ${device.deviceId.slice(0, 8)}`,
            kind: device.kind,
            groupId: device.groupId,
          }));

        setDevices(audioOutputDevices);
      } catch (err) {
        console.error('Failed to enumerate audio devices:', err);
        setError('Não foi possível acessar dispositivos de áudio');
      } finally {
        setIsLoading(false);
      }
    };

    loadDevices();

    // Listen for device changes
    const handleDeviceChange = () => {
      loadDevices();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    return () => navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
  }, []);

  const getDeviceIcon = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('headphone') || lowerLabel.includes('fone') || lowerLabel.includes('headset')) {
      return <Headphones className="w-4 h-4" />;
    }
    if (lowerLabel.includes('speaker') || lowerLabel.includes('alto') || lowerLabel.includes('som')) {
      return <Speaker className="w-4 h-4" />;
    }
    if (lowerLabel.includes('monitor') || lowerLabel.includes('display') || lowerLabel.includes('hdmi')) {
      return <Monitor className="w-4 h-4" />;
    }
    if (lowerLabel.includes('phone') || lowerLabel.includes('iphone') || lowerLabel.includes('android')) {
      return <Smartphone className="w-4 h-4" />;
    }
    return <Speaker className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled
        className={cn('text-text-muted', className)}
        aria-label="Carregando dispositivos..."
      >
        <Loader2 className="w-5 h-5 animate-spin" />
      </Button>
    );
  }

  if (error || devices.length === 0) {
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled
        className={cn('text-text-muted', className)}
        aria-label="Nenhum dispositivo de áudio encontrado"
      >
        <Speaker className="w-5 h-5" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('text-text-secondary hover:text-primary', className)}
          aria-label="Selecionar dispositivo de saída"
        >
          <Speaker className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Dispositivo de saída</DropdownMenuLabel>
        {devices.map((device) => (
          <DropdownMenuItem
            key={device.deviceId}
            onClick={() => onDeviceChange(device.deviceId)}
            className={cn(
              'flex items-center gap-2',
              currentDeviceId === device.deviceId && 'bg-primary/10'
            )}
          >
            {getDeviceIcon(device.label)}
            <span className="flex-1 truncate">{device.label}</span>
            {currentDeviceId === device.deviceId && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDeviceChange('default')}
          className={cn(
            'flex items-center gap-2',
            !currentDeviceId || currentDeviceId === 'default' && 'bg-primary/10'
          )}
        >
          <Speaker className="w-4 h-4" />
          <span className="flex-1">Padrão do sistema</span>
          {(!currentDeviceId || currentDeviceId === 'default') && (
            <Check className="w-4 h-4 text-primary" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

