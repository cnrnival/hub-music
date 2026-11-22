/**
 * Hub Music - SocialPrompting
 * Seção para seguir amigos, conectar com Spotify/Apple Music
 * Section to follow friends, connect Spotify/Apple Music
 *
 * @languages pt-BR / en-US
 */

import { cn } from '../../../lib/utils';
import { Users, UserPlus, Spotify, Apple, Search, Check, Plus, MoreHorizontal } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Avatar } from '../../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../../ui/dropdown-menu';
import { ScrollArea } from '../../ui/scroll-area';

interface FriendSuggestion {
  id: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
  mutualFollowers?: number;
  isFollowing?: boolean;
  source?: 'contacts' | 'facebook' | 'spotify' | 'apple' | 'suggested';
}

interface SocialPromptingProps {
  friends?: FriendSuggestion[];
  onFollowClick?: (userId: string) => void;
  onConnectSpotify?: () => void;
  onConnectApple?: () => void;
  onFindFriends?: () => void;
  showSeeAll?: boolean;
  onSeeAll?: () => void;
}

export function SocialPrompting({
  friends = [],
  onFollowClick,
  onConnectSpotify,
  onConnectApple,
  onFindFriends,
  showSeeAll = true,
  onSeeAll,
}: SocialPromptingProps) {
  const handleFollowClick = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onFollowClick?.(userId);
  };

  return (
    <section className="py-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="font-semibold text-text-primary text-lg flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Encontre amigos
        </h2>
        {showSeeAll && onSeeAll && (
          <Button variant="ghost" size="sm" className="gap-1 text-text-secondary hover:text-primary" onClick={onSeeAll}>
            Ver todos
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Connect Services */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Spotify Connect */}
          <Button
            variant="outline"
            className="h-auto py-4 px-4 text-left gap-3 hover:border-primary/50 hover:bg-primary/5 transition-colors"
            onClick={onConnectSpotify}
            disabled={!onConnectSpotify}
          >
            <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center">
              <Spotify className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text-primary">Conectar Spotify</p>
              <p className="text-text-muted text-sm">Importe sua biblioteca e siga amigos</p>
            </div>
            <Plus className="w-5 h-5 text-text-muted" />
          </Button>

          {/* Apple Music Connect */}
          <Button
            variant="outline"
            className="h-auto py-4 px-4 text-left gap-3 hover:border-primary/50 hover:bg-primary/5 transition-colors"
            onClick={onConnectApple}
            disabled={!onConnectApple}
          >
            <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
              <Apple className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text-primary">Conectar Apple Music</p>
              <p className="text-text-muted text-sm">Importe playlists e siga artistas</p>
            </div>
            <Plus className="w-5 h-5 text-text-muted" />
          </Button>
        </div>
      </div>

      {/* Friend Suggestions */}
      {(friends.length > 0 || onFindFriends) && (
        <div className="px-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-text-primary">Pessoas que você pode conhecer</h3>
            {onFindFriends && (
              <Button variant="ghost" size="sm" className="gap-1 text-text-secondary hover:text-primary" onClick={onFindFriends}>
                <Search className="w-4 h-4" />
                Buscar mais
              </Button>
            )}
          </div>

          {friends.length > 0 ? (
            <ScrollArea className="h-auto" type="always">
              <div className="flex gap-3 pb-2" role="list" aria-label="Sugestões de amigos">
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex-shrink-0 w-40"
                    role="listitem"
                  >
                    <div className="card-hover p-3 text-center space-y-2">
                      <div className="relative">
                        <Avatar src={friend.avatarUrl} name={friend.displayName || friend.username} size="lg" />
                        {friend.source && (
                          <Badge variant="outline" className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] px-1.5 whitespace-nowrap">
                            {friend.source}
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-text-primary truncate">{friend.displayName || friend.username}</p>
                        <p className="text-text-muted text-[11px] truncate">@{friend.username}</p>
                        {friend.mutualFollowers && (
                          <p className="text-text-muted text-[11px] flex items-center justify-center gap-1">
                            <Users className="w-3 h-3" />
                            {friend.mutualFollowers} em comum
                          </p>
                        )}
                      </div>
                      <Button
                        variant={friend.isFollowing ? 'secondary' : 'outline'}
                        size="sm"
                        className="w-full gap-1"
                        onClick={(e) => handleFollowClick(friend.id, e)}
                        disabled={friend.isFollowing}
                      >
                        {friend.isFollowing ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Seguindo
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            Seguir
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="py-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-background-tertiary rounded-xl flex items-center justify-center">
                <Users className="w-8 h-8 text-text-muted" />
              </div>
              <p className="text-text-secondary mb-2">Nenhuma sugestão no momento</p>
              <p className="text-text-muted text-sm">Conecte suas contas ou busque amigos para ver sugestões</p>
              {onFindFriends && (
                <Button variant="primary" size="sm" className="mt-3 gap-1" onClick={onFindFriends}>
                  <Search className="w-4 h-4" />
                  Buscar amigos
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

import { ChevronRight, Users, UserPlus, Spotify, Apple, Search, Check, Plus, MoreHorizontal, User } from 'lucide-react';