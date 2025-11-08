import React, { useEffect, useRef, useState } from 'react';

// Trilha sonora: duas faixas adicionadas na pasta components
// Use URL resolution to obter caminho estático compatível com Vite
const trilha1 = new URL('./trilha.mpeg', import.meta.url).href;
const trilha2 = new URL('./trilha2.mpeg', import.meta.url).href;
const trilha3 = new URL('./trilha 3.mpeg', import.meta.url).href;

const tracks = [
  { src: trilha1, name: 'Trilha 1' },
  { src: trilha2, name: 'Trilha 2' },
  { src: trilha3, name: 'Trilha 3' },
];

export const MusicPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('logicReflectMusicEnabled');
      return stored === null ? true : stored === 'true';
    } catch { return true; }
  });
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try { return localStorage.getItem('logicReflectMusicMuted') === 'true'; } catch { return false; }
  });
  const [volume, setVolume] = useState<number>(() => {
    try { const v = parseFloat(localStorage.getItem('logicReflectMusicVolume') || '0.5'); return isNaN(v) ? 0.5 : Math.min(1, Math.max(0, v)); } catch { return 0.5; }
  });
  const [trackIndex, setTrackIndex] = useState<number>(() => {
    try { const i = parseInt(localStorage.getItem('logicReflectMusicTrack') || '0'); return isNaN(i) ? 0 : Math.max(0, Math.min(tracks.length - 1, i)); } catch { return 0; }
  });

  // Inicializa o elemento de áudio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.loop = true;
    audio.src = tracks[trackIndex].src;
    audio.volume = volume;
    // Inicia mutado para cumprir políticas de autoplay
    audio.muted = true; setIsMuted(true);
    setIsPlaying(true);
    try { localStorage.setItem('logicReflectMusicEnabled', 'true'); } catch {}
    audio.play().catch(() => {/* pode ainda exigir interação, mas mutado costuma permitir */});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ouve o evento de início automático ao clicar em "Iniciar"
  useEffect(() => {
    const handler = () => {
      setIsPlaying(true);
      try { localStorage.setItem('logicReflectMusicEnabled', 'true'); } catch {}
      const audio = audioRef.current;
      if (audio) {
        audio.muted = false; setIsMuted(false);
        audio.play().catch(() => {/* pode precisar de interação adicional */});
      }
    };
    document.addEventListener('logicReflect:music:play', handler);
    return () => document.removeEventListener('logicReflect:music:play', handler);
  }, []);

  // Ouve configuração externa vinda do modal de configurações (apenas volume e mute)
  useEffect(() => {
    const onConfig = (e: Event) => {
      const anyEvent = e as CustomEvent<any>;
      const d = anyEvent.detail || {};
      if (typeof d.isMuted === 'boolean') setIsMuted(d.isMuted);
      if (typeof d.volume === 'number') setVolume(Math.min(1, Math.max(0, d.volume)));
      const audio = audioRef.current; if (!audio) return;
      audio.muted = !!d.isMuted;
      audio.volume = typeof d.volume === 'number' ? Math.min(1, Math.max(0, d.volume)) : audio.volume;
      // Mantém sempre tocando; o usuário não pausa música
      audio.play().catch(() => {});
    };
    document.addEventListener('logicReflect:music:config', onConfig as EventListener);
    return () => document.removeEventListener('logicReflect:music:config', onConfig as EventListener);
  }, []);

  // Reage a alterações de estado
  useEffect(() => {
    try { localStorage.setItem('logicReflectMusicEnabled', String(isPlaying)); } catch {}
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => {/* precisa de clique do usuário */});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    try { localStorage.setItem('logicReflectMusicMuted', String(isMuted)); } catch {}
    const audio = audioRef.current; if (!audio) return;
    audio.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    try { localStorage.setItem('logicReflectMusicVolume', String(volume)); } catch {}
    const audio = audioRef.current; if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  // Crossfade ao trocar de trilha para evitar cortes abruptos
  const fadeCancelRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    try { localStorage.setItem('logicReflectMusicTrack', String(trackIndex)); } catch {}
    const audio = audioRef.current; if (!audio) return;
    const nextSrc = tracks[trackIndex].src;
    const targetVol = Math.min(1, Math.max(0, volume));
    // Se mutado, troca diretamente sem fade audível
    if (isMuted) {
      audio.src = nextSrc;
      audio.play().catch(() => {});
      return;
    }
    // Cancela fade anterior se existir
    if (fadeCancelRef.current) fadeCancelRef.current();
    let cancelled = false;
    fadeCancelRef.current = () => { cancelled = true; };

    const startVol = audio.volume;
    const outMs = 500; const inMs = 700; const stepMs = 40;
    const outSteps = Math.max(1, Math.round(outMs / stepMs));
    let outStep = 0;
    const outTimer = setInterval(() => {
      if (cancelled) { clearInterval(outTimer); return; }
      outStep++;
      const nv = Math.max(0, startVol * (1 - outStep / outSteps));
      audio.volume = nv;
      if (outStep >= outSteps) {
        clearInterval(outTimer);
        // Troca de fonte e inicia em volume 0
        audio.src = nextSrc;
        audio.volume = 0;
        audio.play().catch(() => {});

        const inSteps = Math.max(1, Math.round(inMs / stepMs));
        let inStep = 0;
        const inTimer = setInterval(() => {
          if (cancelled) { clearInterval(inTimer); return; }
          inStep++;
          const nvIn = Math.min(targetVol, (targetVol * inStep / inSteps));
          audio.volume = nvIn;
          if (inStep >= inSteps) {
            clearInterval(inTimer);
          }
        }, stepMs);
      }
    }, stepMs);

    return () => { if (fadeCancelRef.current) fadeCancelRef.current(); };
  }, [trackIndex]);

  // Seleciona faixa automaticamente conforme contexto da aplicação
  useEffect(() => {
    const onSetContext = (e: Event) => {
      const anyEvent = e as CustomEvent<any>;
      const ctx = (anyEvent.detail && anyEvent.detail.context) || 'menu';
      // Mapear: menu/abertura -> trilha 1; jogo -> trilha 2; comunidade -> trilha 3
      const nextIndex = ctx === 'play' ? 1 : (ctx === 'community' ? 2 : 0);
      setTrackIndex(nextIndex);
      setIsPlaying(true);
      const audio = audioRef.current; if (audio) {
        audio.play().catch(() => {});
      }
    };
    document.addEventListener('logicReflect:music:setContext', onSetContext as EventListener);
    return () => document.removeEventListener('logicReflect:music:setContext', onSetContext as EventListener);
  }, []);

  // Desmutar/tocar ao primeiro clique em qualquer lugar, caso o navegador bloqueie autoplay audível
  useEffect(() => {
    const onFirstPointer = () => {
      const audio = audioRef.current; if (!audio) return;
      setIsPlaying(true);
      audio.muted = false; setIsMuted(false);
      audio.play().catch(() => {});
      document.removeEventListener('pointerdown', onFirstPointer);
    };
    document.addEventListener('pointerdown', onFirstPointer, { once: true });
    return () => document.removeEventListener('pointerdown', onFirstPointer);
  }, []);

  return (
    <audio ref={audioRef} preload="auto" autoPlay playsInline />
  );
}

export default MusicPlayer;