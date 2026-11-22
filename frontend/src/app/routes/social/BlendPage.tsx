/**
 * Hub Music - BlendPage
 * Página de Blend (playlist colaborativa baseada no gosto musical)
 * Blend page (collaborative playlist based on music taste)
 *
 * @languages pt-BR / en-US
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users, UserPlus, Heart, Music, Sparkles, RefreshCw,
  Share2, MoreHorizontal, ChevronRight, Check, X,
  Calendar, Clock, TrendingUp, BarChart2
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Avatar } from '../../ui/avatar';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../ui/card';
import { ScrollArea } from '../../ui/scroll-area';
import { TrackCard } from '../../../components/track/TrackCard';
import { formatNumber, formatDuration } from '../../../lib/utils';
import { cn } from '../../../lib/utils';

interface BlendData {
  id: string;
  name: string;
  coverUrl?: string;
  users: Array<{
    id: string;
    displayName: string;
    username: string;
    avatarUrl?: string;
    color: string;
  }>;
  tracks: any[];
  matchPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export function BlendPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'tracks' | 'insights' | 'settings'>('tracks');
  const [blend, setBlend] = useState<BlendData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Mock data
  useEffect(() => {
    const mockBlend: BlendData = {
      id: 'blend-1',
      name: 'Nosso Blend',
      coverUrl: 'https://picsum.photos/seed/blend/600/600',
      users: [
        { id: '1', displayName: 'Você', username: 'voce', avatarUrl: 'https://picsum.photos/seed/user1/100/100', color: '#FF4081' },
        { id: '2', displayName: 'João Silva', username: 'joaosilva', avatarUrl: 'https://picsum.photos/seed/user2/100/100', color: '#00D4AA' },
        { id: '3', displayName: 'Maria Santos', username: 'mariasantos', avatarUrl: 'https://picsum.photos/seed/user3/100/100', color: '#FFB800' },
      ],
      tracks: Array.from({ length: 50 }, (_, i) => ({
        id: `track-${i}`,
        title: `Música ${i + 1}`,
        artist: { displayName: `Artista ${i + 1}`, username: `artista${i + 1}` },
        coverUrl: `https://picsum.photos/seed/track${i}/300/300`,
        duration: 180 + i * 10,
        addedBy: i % 3,
        matchScore: Math.random(),
      })),
      matchPercentage: 78,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setBlend(mockBlend);
    setIsLoading(false);
  }, []);

  const handleCreateBlend = async () => {
    setIsCreating(true);
    try {
      // TODO: Call API to create blend
      await new Promise(resolve => setTimeout(resolve, 2000));
      navigate('/blend/new-blend-id');
    } catch (error) {
      console.error('Create blend failed:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleInviteFriend = () => {
    // TODO: Open invite modal
    console.log('Invite friend clicked');
  };

  const handleLeaveBlend = () => {
    if (window.confirm('Tem certeza que quer sair deste Blend?')) {
      // TODO: Call API to leave blend
      navigate('/blend');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-6">
          <div className="h-8 bg-background-tertiary rounded w-1/3" />
          <div className="aspect-square bg-background-tertiary rounded-2xl" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-background-tertiary rounded-xl" />
            <div className="h-24 bg-background-tertiary rounded-xl" />
            <div className="h-24 bg-background-tertiary rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!blend) {
    return (
      <div className="flex-1 overflow-y-auto bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/30 to-primary-dark/30 flex items-center justify-center">
            <Users className="w-12 h-12 text-white/50" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Nenhum Blend ativo</h1>
          <p className="text-text-secondary mb-6">
            Crie um Blend com amigos para descobrir músicas que vocês dois amam
          </p>
          <Button variant="primary" size="lg" onClick={handleCreateBlend} className="w-full gap-2" disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Criar novo Blend
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  const currentUser = blend.users[0];
  const otherUsers = blend.users.slice(1);
  const totalDuration = blend.tracks.reduce((acc, t) => acc + (t.duration || 0), 0);

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <ScrollArea className="h-full">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
          {/* Header */}
          <header className="relative">
            {/* Cover */}
            <div className="relative aspect-square max-w-md mx-auto rounded-2xl overflow-hidden shadow-2xl">
              {blend.coverUrl ? (
                <img
                  src={blend.coverUrl}
                  alt={blend.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary-dark/30 flex items-center justify-center">
                  <Users className="w-24 h-24 text-white/50" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
            </div>

            {/* Title & Users */}
            <div className="mt-6 text-center space-y-4">
              <h1 className="text-3xl font-bold text-text-primary">{blend.name}</h1>

              {/* Users */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {blend.users.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background-tertiary/50 border border-border-primary"
                  >
                    <Avatar
                      src={user.avatarUrl}
                      name={user.displayName}
                      size="xs"
                      className="ring-2 ring-background"
                      style={{ borderColor: user.color }}
                    />
                    <span className="font-medium text-text-primary text-sm">
                      {user.id === currentUser.id ? 'Você' : user.displayName}
                    </span>
                    {index < blend.users.length - 1 && (
                      <span className="text-primary" style={{ color: user.color }}>+</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Match Percentage */}
              <div className="flex items-center justify-center gap-4">
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="32"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-border-primary"
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="32"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={201}
                      strokeDashoffset={201 * (1 - blend.matchPercentage / 100)}
                      strokeLinecap="round"
                      className="text-primary transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-text-primary">{blend.matchPercentage}%</span>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-medium text-text-primary">Compatibilidade musical</p>
                  <p className="text-text-secondary text-sm">
                    Baseado em artistas, gêneros e hábitos de escuta em comum
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center gap-6 text-text-muted text-sm">
                <span className="flex items-center gap-1">
                  <Music className="w-4 h-4" />
                  {blend.tracks.length} faixas
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDuration(totalDuration)}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Atualizado {formatRelativeTime(blend.updatedAt)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Button variant="primary" className="gap-2" onClick={() => {}}>
                  <Play className="w-4 h-4" />
                  Reproduzir Blend
                </Button>
                <Button variant="outline" className="gap-2" onClick={handleInviteFriend}>
                  <UserPlus className="w-4 h-4" />
                  Convidar amigo
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => {}}>
                  <Share2 className="w-4 h-4" />
                  Compartilhar
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="p-2" aria-label="Mais opções">
                      <MoreHorizontal className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {}}>
                      <Heart className="w-4 h-4 mr-2" /> Salvar na biblioteca
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {}}>
                      <Download className="w-4 h-4 mr-2" /> Baixar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLeaveBlend} className="text-error">
                      <LogOut className="w-4 h-4 mr-2" /> Sair do Blend
                    </DropdownMenuItem>
                  </DropdownMenuContent
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Tabs */}
          <div className="border-b border-border-primary">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 gap-1">
                <TabsTrigger value="tracks">
                  <Music className="w-4 h-4 mr-2" />
                  Faixas ({blend.tracks.length})
                </TabsTrigger>
                <TabsTrigger value="insights">
                  <BarChart2 className="w-4 h-4 mr-2" />
                  Insights
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Tab Content */}
          <TabsContent value="tracks" forceMount className="mt-6">
            {blend.tracks.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {blend.tracks.map((track, index) => (
                  <TrackCard
                    key={track.id}
                    track={{
                      ...track,
                      addedByUser: blend.users.find(u => u.id === track.addedBy),
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Music className="w-12 h-12 mx-auto mb-4 text-text-muted" />
                <p className="text-text-secondary">Nenhuma faixa no Blend ainda</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights" forceMount className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Top Artists */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Top artistas em comum
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['Taylor Swift', 'Drake', 'Bad Bunny', 'The Weeknd', 'Billie Eilish'].map((artist, i) => (
                      <div key={artist} className="flex items-center gap-3 p-3 bg-background-tertiary/50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-primary text-sm">{artist.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-text-primary truncate">{artist}</p>
                          <div className="h-1.5 bg-background-tertiary rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${80 - i * 10}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-text-secondary text-sm font-medium">{80 - i * 10}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Genres */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="w-5 h-5" />
                    Top gêneros em comum
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {['Pop', 'Hip Hop', 'R&B', 'Electronic', 'Indie', 'Rock'].map((genre) => (
                      <Badge key={genre} variant="outline" className="gap-1">
                        {genre}
                        <span className="text-xs bg-primary/10 text-primary px-1.5 rounded">
                          {Math.floor(Math.random() * 30) + 50}%
                        </span>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Listening Habits */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Hábitos de escuta
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: 'Horário preferido', value: 'Noite (20h-23h)', icon: Moon },
                      { label: 'Dias da semana', value: 'Fins de semana', icon: Calendar },
                      { label: 'Dispositivo principal', value: 'Mobile', icon: Smartphone },
                      { label: 'Modo de reprodução', value: 'Aleatório + Repeat', icon: Shuffle },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-3 bg-background-tertiary/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <item.icon className="w-5 h-5 text-primary" />
                          </div>
                          <span className="font-medium text-text-primary">{item.label}</span>
                        </div>
                        <span className="text-text-secondary">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Discovery Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Descoberta musical
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-text-primary">Novos artistas descobertos juntos</span>
                        <span className="text-text-secondary">12 este mês</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-text-primary">Gêneros explorados</span>
                        <span className="text-text-secondary">8 novos</span>
                      </div>
                      <Progress value={45} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-text-primary">Faixas salvas do Blend</span>
                        <span className="text-text-secondary">24</span>
                      </div>
                      <Progress value={30} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" forceMount className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Blend</CardTitle>
                <CardDescription>Gerencie seu Blend e preferências</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 bg-background-tertiary/50 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-text-primary">Atualizações automáticas</p>
                      <p className="text-text-secondary text-sm">Adicionar novas faixas baseadas no gosto em comum</p>
                    </div>
                    <Switch defaultChecked />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-background-tertiary/50 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-text-primary">Notificações de novas faixas</p>
                      <p className="text-text-secondary text-sm">Avisar quando novas músicas forem adicionadas</p>
                    </div>
                    <Switch defaultChecked />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-background-tertiary/50 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-text-primary">Perfil público do Blend</p>
                      <p className="text-text-secondary text-sm">Outros podem ver e seguir este Blend</p>
                    </div>
                    <Switch />
                  </label>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => {}}>
                    <UserPlus className="w-4 h-4" />
                    Convidar mais amigos
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => {}}>
                    <Edit className="w-4 h-4" />
                    Editar nome e capa
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2 text-error" onClick={handleLeaveBlend}>
                    <LogOut className="w-4 h-4" />
                    Sair do Blend
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </ScrollArea>
    </div>
  );
}

import { useEffect, Tabs, TabsList, TabsTrigger, TabsContent, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, Settings, Edit, Download, LogOut, Moon, Calendar, Smartphone, Shuffle } from 'lucide-react';