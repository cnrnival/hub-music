/**
 * Hub Music - Upload Page
 * Página de upload de áudio responsiva para desktop e mobile
 * Audio upload page responsive for desktop and mobile
 * @languages pt-BR / en-US
 */

import { useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { formatFileSize, getErrorMessage } from '../lib/utils';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar } from '../components/ui/avatar';
import {
  Upload as UploadIcon,
  Music,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Image,
  Globe,
  Lock,
  Play
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePlayer } from '../hooks/usePlayer';

const ALLOWED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'];
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export function Upload() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { play } = usePlayer();
  const queryClient = useQueryClient();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [description, setDescription] = useState('');
  const [genreId, setGenreId] = useState('');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<'idle' | 'uploading' | 'processing' | 'complete' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const { data: genres } = useQuery({
    queryKey: ['genres'],
    queryFn: async () => {
      const response = await api.getGenres();
      return response.data.genres;
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      setUploadStage('uploading');
      setUploadProgress(0);

      // Simulate progress (in real app, use axios onUploadProgress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      try {
        const response = await api.uploadTrack(formData);
        clearInterval(progressInterval);
        setUploadProgress(100);
        setUploadStage('processing');
        return response.data.track;
      } catch (err) {
        clearInterval(progressInterval);
        throw err;
      }
    },
    onSuccess: (track) => {
      setUploadStage('complete');
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });

      setTimeout(() => {
        navigate(`/track/${track.id}`);
      }, 1500);
    },
    onError: (err) => {
      setUploadStage('error');
      setError(getErrorMessage(err));
      setUploadProgress(0);
    }
  });

  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) return;

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError('Formato não suportado. Use MP3, WAV ou OGG');
      return;
    }

    if (selectedFile.size > MAX_SIZE) {
      setError(`Arquivo muito grande. Máximo ${formatFileSize(MAX_SIZE)}`);
      return;
    }

    setError(null);
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));

    // Auto-fill title from filename
    if (!title) {
      const name = selectedFile.name.replace(/\.[^/.]+$/, '');
      setTitle(name);
    }
  };

  const handleCoverSelect = (selectedFile: File | null) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      setError('Selecione uma imagem válida');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('Imagem muito grande. Máximo 5MB');
      return;
    }

    setError(null);
    setCoverFile(selectedFile);
    setCoverPreview(URL.createObjectURL(selectedFile));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setFile(null);
    setPreviewUrl(null);
    setCoverFile(null);
    setCoverPreview(null);
    setTitle('');
    setArtist('');
    setDescription('');
    setGenreId('');
    setVisibility('PUBLIC');
    setUploadProgress(0);
    setUploadStage('idle');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Selecione um arquivo de áudio');
      return;
    }

    if (!title.trim()) {
      setError('Título é obrigatório');
      return;
    }

    if (!artist.trim()) {
      setError('Artista é obrigatório');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('artist', artist);
    if (description) formData.append('description', description);
    if (genreId) formData.append('genreId', genreId);
    formData.append('visibility', visibility);
    if (coverFile) formData.append('cover', coverFile);

    uploadMutation.mutate(formData);
  };

  const canSubmit = file && title.trim() && artist.trim() && uploadStage === 'idle';
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className={cn(
      'max-w-3xl mx-auto space-y-6 px-4 lg:px-0',
      isMobile ? 'pb-safe-bottom' : ''
    )}>
      <div>
        <h1 className={cn('text-display-sm font-bold gradient-text', isMobile ? 'text-2xl' : 'text-display-sm')}>
          Nova faixa
        </h1>
        <p className="text-text-secondary mt-1">
          Faça upload da sua música para compartilhar com o mundo
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Drop Zone */}
        <Card
          className={cn(
            'relative p-6 lg:p-8 text-center transition-all',
            dragActive && 'border-primary bg-primary/5',
            file && 'border-success bg-success/5'
          )}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/mpeg,audio/wav,audio/ogg,audio/mp3"
            onChange={(e) => handleFileSelect(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploadStage !== 'idle'}
          />

          {file ? (
            <div className="space-y-4">
              {/* File Info */}
              <div className="flex items-center justify-center gap-4 p-4 bg-background-tertiary rounded-xl">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary-light/20 flex items-center justify-center flex-shrink-0">
                  <Music className={cn('w-8 h-8 text-primary', isMobile ? 'w-6 h-6' : 'w-8 h-8')} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className={cn('font-medium text-text-primary truncate', isMobile ? 'text-sm' : 'text-base')}>
                    {file.name}
                  </p>
                  <p className="text-text-secondary text-sm">{formatFileSize(file.size)} • {file.type}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={removeFile} aria-label="Remover arquivo">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Audio Preview */}
              {previewUrl && (
                <audio controls src={previewUrl} className="w-full" />
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <UploadIcon className={cn('w-12 h-12 mx-auto text-text-muted', isMobile ? 'w-10 h-10' : 'w-12 h-12')} />
              <p className="text-text-secondary text-lg">Arraste seu arquivo de áudio aqui</p>
              <p className="text-text-muted">ou clique para selecionar</p>
              <p className="text-caption text-text-muted">MP3, WAV, OGG • Máx. 50MB</p>
              <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                Selecionar arquivo
              </Button>
            </div>
          )}
        </Card>

        {/* Cover Upload */}
        <Card className="p-4 lg:p-6">
          <h3 className={cn('text-heading-sm font-bold mb-4', isMobile ? 'text-base' : 'text-heading-sm')}>
            Imagem de capa (opcional)
          </h3>
          <div className="flex items-center gap-4 flex-col lg:flex-row">
            <div
              className={cn(
                'relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0',
                coverPreview ? '' : 'bg-background-tertiary flex items-center justify-center'
              )}
            >
              {coverPreview ? (
                <>
                  <img src={coverPreview} alt="Capa" className="w-full h-full object-cover" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 bg-background/80"
                    onClick={() => { setCoverFile(null); setCoverPreview(null); coverInputRef.current!.value = ''; }}
                    aria-label="Remover capa"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Image className="w-8 h-8 text-text-muted" />
              )}
            </div>
            <div className="flex-1 mt-4 lg:mt-0">
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleCoverSelect(e.target.files[0])}
                className="hidden"
              />
              <Button
                variant="secondary"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadStage !== 'idle'}
                className="w-full lg:w-auto"
              >
                <UploadIcon className="w-4 h-4 mr-2" />
                {coverFile ? 'Alterar capa' : 'Adicionar capa'}
              </Button>
              <p className="text-caption text-text-muted mt-1">JPG, PNG • Máx. 5MB • Proporção 1:1 recomendada</p>
            </div>
          </div>
        </Card>

        {/* Metadata */}
        <Card className="p-4 lg:p-6 space-y-4">
          <h3 className={cn('text-heading-sm font-bold', isMobile ? 'text-base' : 'text-heading-sm')}>
            Informações da faixa
          </h3>

          <Input
            label="Título *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nome da música"
            disabled={uploadStage !== 'idle'}
            error={!title && uploadStage === 'error' ? 'Título é obrigatório' : undefined}
          />

          <Input
            label="Artista *"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Nome do artista"
            defaultValue={user?.displayName || user?.username}
            disabled={uploadStage !== 'idle'}
            error={!artist && uploadStage === 'error' ? 'Artista é obrigatório' : undefined}
          />

          <Textarea
            label="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Conte algo sobre esta faixa..."
            rows={3}
            disabled={uploadStage !== 'idle'}
          />

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Gênero</label>
            <select
              value={genreId}
              onChange={(e) => setGenreId(e.target.value)}
              className="input"
              disabled={uploadStage !== 'idle'}
            >
              <option value="">Selecione um gênero</option>
              {genres?.map((g: any) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Visibilidade</label>
            <div className={cn('flex gap-4', isMobile ? 'flex-col gap-2' : 'flex-row gap-4')}>
              <label className={cn(
                'flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl border-2 transition-colors',
                visibility === 'PUBLIC' ? 'border-primary bg-primary/10' : 'border-border hover:border-border-light',
                isMobile ? 'w-full justify-center' : ''
              )}>
                <input
                  type="radio"
                  name="visibility"
                  value="PUBLIC"
                  checked={visibility === 'PUBLIC'}
                  onChange={() => setVisibility('PUBLIC')}
                  className="sr-only"
                />
                <Globe className="w-5 h-5 text-primary" />
                <span className={cn('font-medium', isMobile ? 'text-sm' : 'text-base')}>Público</span>
              </label>
              <label className={cn(
                'flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl border-2 transition-colors',
                visibility === 'PRIVATE' ? 'border-warning bg-warning/10' : 'border-border hover:border-border-light',
                isMobile ? 'w-full justify-center' : ''
              )}>
                <input
                  type="radio"
                  name="visibility"
                  value="PRIVATE"
                  checked={visibility === 'PRIVATE'}
                  onChange={() => setVisibility('PRIVATE')}
                  className="sr-only"
                />
                <Lock className="w-5 h-5 text-warning" />
                <span className={cn('font-medium', isMobile ? 'text-sm' : 'text-base')}>Privado</span>
              </label>
            </div>
            <p className="text-caption text-text-muted mt-2">
              {visibility === 'PUBLIC'
                ? 'Qualquer pessoa pode ver e reproduzir esta faixa'
                : 'Apenas você pode ver e reproduzir esta faixa'}
            </p>
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <Card variant="error" className="p-4 flex items-center gap-3 bg-error/10 border-error/20">
            <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
            <p className="text-error">{error}</p>
          </Card>
        )}

        {/* Upload Progress */}
        {uploadStage !== 'idle' && (
          <Card className="p-4 lg:p-6 space-y-3">
            <div className="flex items-center gap-3">
              {uploadStage === 'uploading' && <Loader2 className="w-6 h-6 text-primary animate-spin" />}
              {uploadStage === 'processing' && <Loader2 className="w-6 h-6 text-primary animate-spin" />}
              {uploadStage === 'complete' && <CheckCircle className="w-6 h-6 text-success" />}
              {uploadStage === 'error' && <AlertCircle className="w-6 h-6 text-error" />}
              <span className="font-medium">
                {uploadStage === 'uploading' && `Enviando... ${uploadProgress}%`}
                {uploadStage === 'processing' && 'Processando...'}
                {uploadStage === 'complete' && 'Upload concluído!'}
                {uploadStage === 'error' && 'Erro no upload'}
              </span>
            </div>
            {uploadStage === 'uploading' || uploadStage === 'processing' ? (
              <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            ) : null}
          </Card>
        )}

        {/* Submit Button */}
        {uploadStage === 'idle' && (
          <Button type="submit" className="w-full" size="lg" disabled={!canSubmit}>
            <UploadIcon className="w-5 h-5 mr-2" />
            Publicar faixa
          </Button>
        )}

        {uploadStage === 'complete' && (
          <Button variant="secondary" className="w-full" onClick={removeFile}>
            Fazer novo upload
          </Button>
        )}
      </form>
    </div>
  );
}
