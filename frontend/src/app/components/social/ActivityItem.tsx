/**
 * Hub Music - ActivityItem
 * Item de atividade para feed (follows, likes, reposts)
 * Activity item for feed (follows, likes, reposts)
 *
 * @languages pt-BR / en-US
 */

import { Heart, Share2, UserPlus, Music, ListMusic, User, Clock, MoreHorizontal, Play, ChevronRight, MessageSquare, SquarePlay, Check, Flag } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { formatRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

type ActivityType = 'like' | 'repost' | 'follow' | 'playlist_create' | 'track_upload' | 'comment';

interface ActivityItemProps {
  activity: {
    id: string;
    type: ActivityType;
    user: {
      id: string;
      displayName: string;
      username: string;
      avatarUrl?: string;
      verified?: boolean;
    };
    target?: {
      id: string;
      type: 'track' | 'playlist' | 'artist' | 'album';
      title: string;
      coverUrl?: string;
      artist?: string;
    };
    createdAt: string;
  };
  onUserClick?: (userId: string) => void;
  onTargetClick?: (target: ActivityItemProps['activity']['target']) => void;
  onPlayClick?: (target: ActivityItemProps['activity']['target']) => void;
  showPlayButton?: boolean;
}

export function ActivityItem({
  activity,
  onUserClick,
  onTargetClick,
  onPlayClick,
  showPlayButton = true,
}: ActivityItemProps) {
  const getActivityIcon = () => {
    switch (activity.type) {
      case 'like': return <Heart className="w-4 h-4 text-error" />;
      case 'repost': return <Share2 className="w-4 h-4 text-primary" />;
      case 'follow': return <UserPlus className="w-4 h-4 text-success" />;
      case 'playlist_create': return <ListMusic className="w-4 h-4 text-primary" />;
      case 'track_upload': return <Music className="w-4 h-4 text-primary" />;
      case 'comment': return <MessageSquare className="w-4 h-4 text-primary" />;
    }
  };

  const getActivityText = () => {
    const userName = activity.user.displayName || activity.user.username;
    const target = activity.target;

    switch (activity.type) {
      case 'like':
        return `${userName} curtiu <strong>${target?.title}</strong>${target?.artist ? ` por ${target.artist}` : ''}`;
      case 'repost':
        return `${userName} repostou <strong>${target?.title}</strong>`;
      case 'follow':
        return `${userName} começou a seguir <strong>${target?.title}</strong>`;
      case 'playlist_create':
        return `${userName} criou a playlist <strong>${target?.title}</strong>`;
      case 'track_upload':
        return `${userName} enviou <strong>${target?.title}</strong>`;
      case 'comment':
        return `${userName} comentou em <strong>${target?.title}</strong>`;
    }
  };

  const getTargetIcon = (type?: ActivityItemProps['activity']['target']['type']) => {
    switch (type) {
      case 'track': return <Music className="w-4 h-4" />;
      case 'playlist': return <ListMusic className="w-4 h-4" />;
      case 'artist': return <User className="w-4 h-4" />;
      case 'album': return <SquarePlay className="w-4 h-4" />;
      default: return <Music className="w-4 h-4" />;
    }
  };

  return (
    <article className="card-hover group p-3 flex gap-3">
      {/* Activity Icon */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
        {getActivityIcon()}
      </div>

      {/* Activity Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-0 font-medium text-text-primary hover:text-primary"
            onClick={() => onUserClick?.(activity.user.id)}
          >
            {activity.user.displayName || activity.user.username}
          </Button>
          {activity.user.verified && <Check className="w-3 h-3 text-primary mt-0.5" />}
          <span className="text-text-muted text-sm mt-0.5" dangerouslySetInnerHTML={{ __html: getActivityText() }} />
        </div>

        {/* Target Preview */}
        {activity.target && (
          <div className="flex items-center gap-3 mt-2">
            <div className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden">
              {activity.target.coverUrl ? (
                <img src={activity.target.coverUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full bg-background-tertiary flex items-center justify-center">
                  {getTargetIcon(activity.target.type)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text-primary truncate">{activity.target.title}</p>
              {activity.target.artist && (
                <p className="text-text-secondary text-sm truncate">{activity.target.artist}</p>
              )}
              <p className="text-text-muted text-sm capitalize">{activity.target.type}</p>
            </div>
            {showPlayButton && activity.target.type === 'track' && (
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => { e.stopPropagation(); onPlayClick?.(activity.target!); }}
                aria-label="Reproduzir"
              >
                <Play className="w-5 h-5" />
              </Button>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 mt-2 text-text-muted text-sm">
          <span>{formatRelativeTime(activity.createdAt)}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="p-1" aria-label="Mais opções">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {activity.target && (
                <DropdownMenuItem onClick={() => onTargetClick?.(activity.target!)}>
                  <ChevronRight className="w-4 h-4 mr-2" />
                  Ver {activity.target.type === 'track' ? 'faixa' : activity.target.type === 'playlist' ? 'playlist' : 'artista'}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onUserClick?.(activity.user.id)}>
                <User className="w-4 h-4 mr-2" />
                Ver perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-error">
                <Flag className="w-4 h-4 mr-2" />
                Denunciar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </article>
  );
}

