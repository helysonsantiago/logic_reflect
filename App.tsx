import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Controls } from './components/Controls';
import { Grid } from './components/Grid';
import { Inventory } from './components/Inventory';
import { Modal } from './components/Modal';
import { TilePalette } from './components/TilePalette';
import { EditorControls } from './components/EditorControls';
import { MainMenu } from './components/MainMenu';
import { LevelBrowser } from './components/LevelBrowser';
import { CommunityBrowser } from './components/CommunityBrowser';
import { DirectionModal } from './components/DirectionModal';
import { TICK_SPEED } from './constants';
import type { GameStatus, PlacedTool, ToolType, CollectorState, Direction, Level, AppView, PaletteSelection, Grid as GridType, TileType, SimulationState, Teleporter, RankingEntry, CommunityRating } from './types';
import { StoryModal } from './components/StoryModal';
import { IntroCinematic } from './components/IntroCinematic';
import { StartScreen } from './components/StartScreen';
import { builtinLevels } from './levels';
import { InitialsModal } from './components/InitialsModal';
import { RankingModal } from './components/RankingModal'
import { ConfirmEffect } from './components/ConfirmEffect'
import { MusicPlayer } from './components/MusicPlayer'
import { SettingsModal } from './components/SettingsModal'

// Removido suporte a JSON Server; utilizando apenas Supabase (e opcionalmente Git)

// Git-only mode configuration (reads db.json from GitHub)
const API_MODE = (import.meta.env.VITE_API_MODE || 'supabase') as 'git' | 'supabase';
const GITHUB_OWNER = import.meta.env.VITE_GITHUB_OWNER || '';
const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO || '';
const GITHUB_REF = import.meta.env.VITE_GITHUB_REF || 'main';
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || '';

// Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

async function fetchGitDb(owner: string, repo: string, ref: string): Promise<{ ranking?: any[]; communityLevels?: any[]; communityRatings?: any[]; }>
{
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/db.json?ref=${ref}`;
  const res = await fetch(url, { headers: GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : undefined });
  if (!res.ok) throw new Error('Failed to fetch GitHub db.json');
  const data = await res.json();
  const content = (data && data.content) ? atob(String(data.content).replace(/\n/g, '')) : '';
  return JSON.parse(content || '{}');
}

async function loadGitDbMeta(owner: string, repo: string, ref: string): Promise<{ sha: string; json: any }>{
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/db.json?ref=${ref}`;
  const res = await fetch(url, { headers: GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : undefined });
  if (!res.ok) throw new Error('Failed to fetch GitHub db.json meta');
  const meta = await res.json();
  const content = (meta && meta.content) ? atob(String(meta.content).replace(/\n/g, '')) : '';
  const json = JSON.parse(content || '{}');
  return { sha: meta.sha, json };
}

async function updateGitDb(patch: (db: any) => any, message: string): Promise<any> {
  if (!GITHUB_OWNER || !GITHUB_REPO || !GITHUB_TOKEN) throw new Error('Missing GitHub configuration');
  const { sha, json } = await loadGitDbMeta(GITHUB_OWNER, GITHUB_REPO, GITHUB_REF);
  const next = patch(json || {});
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(next, null, 2))));
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/db.json`;
  const resp = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GITHUB_TOKEN}`,
    },
    body: JSON.stringify({ message, content: encoded, sha, branch: GITHUB_REF }),
  });
  if (!resp.ok) throw new Error('Failed to update GitHub db.json');
  return resp.json();
}

// Helpers: map between Supabase rows and app types
function supaLevelToLevel(row: any): Level {
  return {
    id: row.id,
    name: row.name,
    grid: row.grid || [],
    startPosition: row.start_position || { x: -1, y: -1 },
    startDirection: row.start_direction || { dx: 1, dy: 0 },
    inventory: row.inventory || { 'rotator-cw': 1, 'rotator-ccw': 1, 'mirror': 1 },
    teleporters: row.teleporters || [],
    forceTiles: row.force_tiles || [],
    highScore: row.high_score || 0,
    totalCoins: row.total_coins || 0,
    origin: row.origin || 'community',
    createdBy: row.created_by || 'Anônimo',
  } as Level;
}

function levelToSupaRow(level: Level, createdByName?: string) {
  return {
    name: level.name,
    grid: level.grid,
    start_position: level.startPosition,
    start_direction: level.startDirection,
    inventory: level.inventory,
    teleporters: level.teleporters,
    force_tiles: level.forceTiles,
    total_coins: level.totalCoins || 0,
    high_score: level.highScore || 0,
    origin: level.origin || 'community',
    created_by: createdByName || level.createdBy || 'Anônimo',
  };
}

function supaRatingToRating(row: any): CommunityRating {
  return {
    id: row.id,
    levelId: row.level_id,
    user: row.user_name,
    stars: row.stars,
    at: row.at ? new Date(row.at).getTime() : Date.now(),
  };
}

function supaRankingToEntry(row: any): RankingEntry {
  return {
    initials: row.initials,
    score: row.score,
    level: row.level,
    at: row.at ? new Date(row.at).getTime() : Date.now(),
  };
}

const EDITOR_GRID_SIZE = 10;
const createBlankLevel = (): Level => ({
  name: `New Level ${new Date().toLocaleTimeString()}`,
  grid: Array(EDITOR_GRID_SIZE).fill(0).map(() => Array(EDITOR_GRID_SIZE).fill('empty')),
  startPosition: { x: -1, y: -1 },
  startDirection: { dx: 1, dy: 0 },
  inventory: { 'rotator-cw': 1, 'rotator-ccw': 1, 'mirror': 1 },
  teleporters: [],
  forceTiles: [],
  highScore: 0,
  totalCoins: 0,
  origin: 'user',
  createdBy: (typeof localStorage !== 'undefined' && localStorage.getItem('logicReflectAuthor')) || 'Você',
});

const initialSimState = (): SimulationState => ({
  collectedCoins: 0,
  hasKey: false,
  collectedItems: new Set(),
});

type EditorSubState = {
  teleporterPlacement: { pairId: number; stage: 'in' | 'out' } | null;
  selectedForceTileAction: ToolType;
}

type DirectionModalState = {
  isOpen: boolean;
  prompt: string;
  onSelect: (direction: Direction) => void;
}

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('MENU');
  const [savedLevels, setSavedLevels] = useState<Level[]>([]);
  const [editorLevel, setEditorLevel] = useState<Level>(createBlankLevel());
  const [activeLevel, setActiveLevel] = useState<Level | null>(null);

  const [gameStatus, setGameStatus] = useState<GameStatus>('SETUP');
  const [placedTools, setPlacedTools] = useState<PlacedTool[]>([]);
  const [selectedTool, setSelectedTool] = useState<ToolType | null>(null);
  
  const [paletteSelection, setPaletteSelection] = useState<PaletteSelection | null>(null);
  const [editorSubState, setEditorSubState] = useState<EditorSubState>({
    teleporterPlacement: null,
    selectedForceTileAction: 'rotator-cw',
  });
  const [directionModal, setDirectionModal] = useState<DirectionModalState>({ isOpen: false, prompt: '', onSelect: () => {} });
  
  const [simulationState, setSimulationState] = useState<SimulationState>(initialSimState());
  const [isStoryOpen, setIsStoryOpen] = useState<boolean>(false);
  const [isIntroOpen, setIsIntroOpen] = useState<boolean>(false);
  const [isStartOpen, setIsStartOpen] = useState<boolean>(true);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [communityLevels, setCommunityLevels] = useState<Level[]>([]);
  const [communityRatings, setCommunityRatings] = useState<CommunityRating[]>([]);
  const [authorName, setAuthorName] = useState<string>((typeof localStorage !== 'undefined' && localStorage.getItem('logicReflectAuthor')) || '');
  const [isInitialsOpen, setIsInitialsOpen] = useState<boolean>(false);
  const [isRankingOpen, setIsRankingOpen] = useState<boolean>(false);
  const [showConfirmEffect, setShowConfirmEffect] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isPlayingCommunity, setIsPlayingCommunity] = useState<boolean>(false);
  
  const currentLevel = view === 'EDITOR' || (view === 'PLAY' && !activeLevel) ? editorLevel : activeLevel;
  const [collector, setCollector] = useState<CollectorState>({ x: -1, y: -1, direction: { dx: 1, dy: 0 }, visible: false });
  
  const gameIntervalRef = useRef<number | null>(null);
  const simCollectorRef = useRef<CollectorState | null>(null);
  const liveSimStateRef = useRef<SimulationState | null>(null);
  const gameStatusRef = useRef<GameStatus>('SETUP');
  const skipNextResetRef = useRef<boolean>(false);

  useEffect(() => {
    gameStatusRef.current = gameStatus;
  }, [gameStatus]);
  
  // Carrega ranking + níveis oficiais
  useEffect(() => {
    try {
      const stored = localStorage.getItem('logicReflectLevels');
      const existing = stored ? JSON.parse(stored) : [];
      const builtins = builtinLevels();
      const merged = builtins;
      setSavedLevels(merged);
      localStorage.setItem('logicReflectLevels', JSON.stringify(merged));
      
      if (API_MODE === 'git' && GITHUB_OWNER && GITHUB_REPO) {
        fetchGitDb(GITHUB_OWNER, GITHUB_REPO, GITHUB_REF)
          .then(db => {
            const serverRanking = [...(db.ranking || [])].sort((a,b) => b.score - a.score).slice(0, 10);
            setRanking(serverRanking);
            setCommunityLevels(db.communityLevels || []);
            setCommunityRatings(db.communityRatings || []);
            try { localStorage.setItem('logicReflectRanking', JSON.stringify(serverRanking)); } catch {}
          })
          .catch(() => {
            const storedRanking = localStorage.getItem('logicReflectRanking');
            if (storedRanking) {
              try { setRanking(JSON.parse(storedRanking)); } catch {}
            }
          });
      } else if (API_MODE === 'supabase' && supabase) {
        supabase.from('ranking')
          .select('*')
          .order('score', { ascending: false })
          .limit(10)
          .then(({ data, error }) => {
            if (error) throw error;
            const serverRanking = (data || []).map(supaRankingToEntry);
            setRanking(serverRanking);
            try { localStorage.setItem('logicReflectRanking', JSON.stringify(serverRanking)); } catch {}
          })
          .catch(() => {
            const storedRanking = localStorage.getItem('logicReflectRanking');
            if (storedRanking) {
              try { setRanking(JSON.parse(storedRanking)); } catch {}
            }
          });
      }
    } catch (error) {
      console.error('Failed to load levels:', error);
    }
  }, []);

  // Carrega níveis e avaliações da comunidade
  useEffect(() => {
    
    if (API_MODE === 'git') return; // já carregado junto do ranking via Git
    if (API_MODE === 'supabase' && supabase) {
      const fetchCommunity = async () => {
        try {
          const [{ data: lvls, error: lerr }, { data: rts, error: rerr }] = await Promise.all([
            supabase.from('community_levels').select('*'),
            supabase.from('community_ratings').select('*'),
          ]);
          if (lerr) console.warn('Erro ao carregar levels da comunidade:', lerr);
          if (rerr) console.warn('Erro ao carregar ratings da comunidade:', rerr);
          setCommunityLevels((lvls || []).map(supaLevelToLevel));
          setCommunityRatings((rts || []).map(supaRatingToRating));
        } catch (e) {
          console.warn('Falha ao carregar dados da comunidade (Supabase):', e);
        }
      };
      fetchCommunity();
      return;
    }
    // Sem JSON Server: dados da comunidade são carregados pelo Supabase quando ativo.
  }, []);

  const resetBoard = useCallback(() => {
    if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    gameIntervalRef.current = null;

    setPlacedTools([]);
    setSelectedTool(null);
    setSimulationState(initialSimState());
    if(currentLevel) {
       setCollector({
        ...currentLevel.startPosition,
        direction: currentLevel.startDirection,
        visible: currentLevel.startPosition.x !== -1,
        isTeleporting: false,
      });
    }
    setGameStatus('SETUP');
  }, [currentLevel]);
  
  useEffect(() => {
    if (!currentLevel) return;
    if (skipNextResetRef.current) {
      skipNextResetRef.current = false;
      return;
    }
    resetBoard();
  }, [currentLevel, resetBoard]);

  const handleWin = useCallback(() => {
    setGameStatus('WIN');
    if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);

    if (activeLevel) {
        const currentHighScore = activeLevel.highScore || 0;
        const liveSimState = liveSimStateRef.current || initialSimState();
        const nextHigh = Math.max(currentHighScore, liveSimState.collectedCoins);
        const updatedLevel = { ...activeLevel, highScore: nextHigh, completedAt: activeLevel.completedAt || Date.now() };
        skipNextResetRef.current = true;
        setActiveLevel(updatedLevel);
        const newSavedLevels = savedLevels.map(l => l.name === updatedLevel.name ? updatedLevel : l);
        setSavedLevels(newSavedLevels);
        localStorage.setItem('logicReflectLevels', JSON.stringify(newSavedLevels));
    }
  }, [activeLevel, savedLevels]);

  const gameTick = useCallback(() => {
      if (gameStatusRef.current !== 'RUNNING') return;
      if (!simCollectorRef.current || !liveSimStateRef.current || !currentLevel) return;

      const { x, y, direction } = simCollectorRef.current;
      let nextX = x + direction.dx;
      let nextY = y + direction.dy;
      let nextDirection = {...direction};
      
      const checkFail = (isFail: boolean) => {
        if (isFail) {
            setGameStatus('FAIL');
            setIsInitialsOpen(true);
            if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
        }
        return isFail;
      }

      if (checkFail(nextX < 0 || nextX >= currentLevel.grid[0].length || nextY < 0 || nextY >= currentLevel.grid.length)) return;

      const nextTile = currentLevel.grid[nextY][nextX];
      if (checkFail(nextTile === 'obstacle')) return;
      if (checkFail(nextTile === 'gate' && !liveSimStateRef.current.hasKey)) return;

      if (nextTile === 'end') {
        simCollectorRef.current = {...simCollectorRef.current, x: nextX, y: nextY };
        setCollector(simCollectorRef.current);
        setSimulationState(liveSimStateRef.current);
        handleWin();
        return;
      }
      
      const itemCoord = `${nextX},${nextY}`;
      if (!liveSimStateRef.current.collectedItems.has(itemCoord)) {
          if (nextTile === 'coin') {
              liveSimStateRef.current.collectedCoins++;
              liveSimStateRef.current.collectedItems.add(itemCoord);
          }
          if (nextTile === 'key') {
              liveSimStateRef.current.hasKey = true;
              liveSimStateRef.current.collectedItems.add(itemCoord);
          }
      }
      
      const teleporter = currentLevel.teleporters.find(t => t.x === nextX && t.y === nextY);
      if (teleporter && teleporter.type === 'in') {
          const pair = currentLevel.teleporters.find(t => t.id === teleporter.id && t.type === 'out');
          if (pair) {
              if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
              
              simCollectorRef.current = { ...simCollectorRef.current, x: nextX, y: nextY, isTeleporting: true };
              setCollector(simCollectorRef.current);

              setTimeout(() => {
                  nextX = pair.x;
                  nextY = pair.y;
                  nextDirection = pair.exitDirection;

                  simCollectorRef.current = { ...simCollectorRef.current, x: nextX, y: nextY, direction: nextDirection, isTeleporting: false };
                  setCollector(simCollectorRef.current);
                  setSimulationState({ ...liveSimStateRef.current! });

                  if (gameStatusRef.current === 'RUNNING') {
                    gameIntervalRef.current = window.setInterval(gameTick, TICK_SPEED);
                  }
              }, 500);
              return;
          }
      }

      const tool = placedTools.find(t => t.x === nextX && t.y === nextY);
      if (tool) {
        if (tool.type === 'rotator-cw') nextDirection = { dx: -nextDirection.dy as Direction['dx'], dy: nextDirection.dx as Direction['dy'] };
        else if (tool.type === 'rotator-ccw') nextDirection = { dx: nextDirection.dy as Direction['dx'], dy: -nextDirection.dx as Direction['dy'] };
        else if (tool.type === 'mirror') nextDirection = { dx: -nextDirection.dx as Direction['dx'], dy: -nextDirection.dy as Direction['dy'] };
      }

      const forceTile = currentLevel.forceTiles.find(t => t.x === nextX && t.y === nextY);
      if (forceTile) {
          if (forceTile.action === 'rotator-cw') nextDirection = { dx: -nextDirection.dy as Direction['dx'], dy: nextDirection.dx as Direction['dy'] };
          else if (forceTile.action === 'rotator-ccw') nextDirection = { dx: nextDirection.dy as Direction['dx'], dy: -nextDirection.dx as Direction['dy'] };
          else if (forceTile.action === 'mirror') nextDirection = { dx: -nextDirection.dx as Direction['dx'], dy: -nextDirection.dy as Direction['dy'] };
      }
      
      simCollectorRef.current = { ...simCollectorRef.current, x: nextX, y: nextY, direction: nextDirection };
      setCollector(simCollectorRef.current);
      setSimulationState({ ...liveSimStateRef.current });
  }, [currentLevel, placedTools, handleWin]);

  const handlePlay = () => {
    if (gameStatus !== 'SETUP' || !currentLevel || currentLevel.startPosition.x === -1) return;
    setGameStatus('RUNNING');
    
    simCollectorRef.current = {
      ...currentLevel.startPosition,
      direction: currentLevel.startDirection,
      visible: true,
      isTeleporting: false,
    };
    liveSimStateRef.current = initialSimState();

    setCollector(simCollectorRef.current);
    setSimulationState(liveSimStateRef.current);
    
    gameIntervalRef.current = window.setInterval(gameTick, TICK_SPEED);
  };
  
  const handleTileClick = (x: number, y: number) => {
    if (view === 'PLAY' && gameStatus === 'SETUP') {
        const existingToolIndex = placedTools.findIndex(tool => tool.x === x && tool.y === y);
        if (existingToolIndex > -1) {
            setPlacedTools(placedTools.filter((_, index) => index !== existingToolIndex));
        } else if (selectedTool && currentLevel) {
            const usedCount = placedTools.filter(tool => tool.type === selectedTool).length;
            if (currentLevel.inventory[selectedTool] > usedCount) {
                setPlacedTools([...placedTools, { type: selectedTool, x, y }]);
            }
        }
    } else if (view === 'EDITOR') {
        const newGrid = editorLevel.grid.map(row => [...row]) as GridType;
        let newStartPos = { ...editorLevel.startPosition };
        let newTeleporters = [...editorLevel.teleporters];
        let newForceTiles = [...editorLevel.forceTiles];

        newTeleporters = newTeleporters.filter(t => t.x !== x || t.y !== y);
        newForceTiles = newForceTiles.filter(t => t.x !== x || t.y !== y);
        if (editorLevel.startPosition.x === x && editorLevel.startPosition.y === y) newStartPos = {x: -1, y: -1};

        if (editorSubState.teleporterPlacement) {
            const { pairId, stage } = editorSubState.teleporterPlacement;
            
            const newTeleporter: Teleporter = { id: pairId, type: stage, x, y, exitDirection: stage === 'in' ? editorLevel.startDirection : { dx: 1, dy: 0 } };
            newGrid[y][x] = 'teleporter';
            newTeleporters.push(newTeleporter);

            if (stage === 'out') {
                setDirectionModal({
                    isOpen: true,
                    prompt: `Qual a direção de saída deste portal?`,
                    onSelect: (direction) => {
                        setEditorLevel(prev => ({
                            ...prev,
                            teleporters: prev.teleporters.map(t => t.x === x && t.y === y ? {...t, exitDirection: direction} : t)
                        }));
                        setDirectionModal({ isOpen: false, prompt: '', onSelect: () => {} });
                    }
                });
            }

            if (stage === 'in') {
                setEditorSubState(s => ({ ...s, teleporterPlacement: { pairId, stage: 'out' }}));
            } else {
                setEditorSubState(s => ({ ...s, teleporterPlacement: null }));
                setPaletteSelection(null);
            }
        } else if (paletteSelection) {
            const placeableTiles: PaletteSelection[] = ['end', 'obstacle', 'empty', 'coin', 'key', 'gate'];
            if(placeableTiles.includes(paletteSelection)) newGrid[y][x] = paletteSelection as TileType;

            if (paletteSelection === 'start') {
                if (newStartPos.x !== -1) newGrid[newStartPos.y][newStartPos.x] = 'empty';
                newGrid[y][x] = 'start';
                newStartPos = { x, y };
                setDirectionModal({
                    isOpen: true,
                    prompt: 'Qual a direção inicial do Collector?',
                    onSelect: (direction) => {
                        setEditorLevel(prev => ({ ...prev, startDirection: direction }));
                        setDirectionModal({isOpen: false, prompt: '', onSelect: () => {}});
                    }
                })
            } else if (paletteSelection === 'force-tile-editor') {
                newForceTiles.push({ action: editorSubState.selectedForceTileAction, x, y });
            }
        }
        
        setEditorLevel(prev => ({ ...prev, grid: newGrid, startPosition: newStartPos, teleporters: newTeleporters, forceTiles: newForceTiles }));
    }
  };
  
  const handleSaveLevel = () => {
    if (!editorLevel.name.trim()) { alert("Por favor, digite um nome."); return; }
    const totalCoins = editorLevel.grid.flat().filter(t => t === 'coin').length;
    const highScoreFromRun = simulationState.collectedCoins || 0;
    const levelToSave = { ...editorLevel, totalCoins, highScore: Math.max(editorLevel.highScore || 0, highScoreFromRun) };

    const newSavedLevels = [...savedLevels.filter(l => l.name !== levelToSave.name), levelToSave];
    setSavedLevels(newSavedLevels);
    localStorage.setItem('logicReflectLevels', JSON.stringify(newSavedLevels));
    alert(`Nível "${levelToSave.name}" salvo!`);
    resetBoard();
    setView('EDITOR');
  };

  const handlePublishLevel = async () => {
    
    if (API_MODE === 'git') {
      if (GITHUB_TOKEN && GITHUB_OWNER && GITHUB_REPO) {
        try {
          const name = (authorName || localStorage.getItem('logicReflectAuthor') || '').trim() || 'Anônimo';
          const totalCoins = editorLevel.grid.flat().filter(t => t === 'coin').length;
          const levelToPublish: Level = { ...editorLevel, totalCoins, origin: 'community', createdBy: name };
          await updateGitDb((db: any) => {
            const levels: any[] = Array.isArray(db.communityLevels) ? db.communityLevels : [];
            const existing = levels.find(l => (l.createdBy || 'Anônimo') === name);
            if (existing) {
              // update existing, keep id
              const updated = { ...existing, ...levelToPublish, id: existing.id };
              db.communityLevels = levels.map(l => (l.id === existing.id ? updated : l));
            } else {
              const nextId = (levels.reduce((m, it) => Math.max(m, Number(it.id || 0)), 0) || 0) + 1;
              db.communityLevels = [...levels, { ...levelToPublish, id: nextId }];
            }
            return db;
          }, `Publish community level by ${name}`);
          const db = await fetchGitDb(GITHUB_OWNER, GITHUB_REPO, GITHUB_REF);
          setCommunityLevels(db.communityLevels || []);
          alert('Fase publicada na comunidade (commit no Git)!');
          setView('COMMUNITY_BROWSER');
        } catch (e) {
          console.error(e);
          alert('Não foi possível publicar via GitHub. Verifique token/permissões.');
        }
        return;
      }
      const ghEditUrl = (GITHUB_OWNER && GITHUB_REPO) ? `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/edit/${GITHUB_REF}/db.json` : 'https://github.com/';
      alert(`Modo Git ativado: configure VITE_GITHUB_TOKEN para publicar automaticamente.\nSem token, edite via PR: ${ghEditUrl}`);
      return;
    }
    if (API_MODE === 'supabase' && supabase) {
      const name = (authorName || localStorage.getItem('logicReflectAuthor') || '').trim() || 'Anônimo';
      const totalCoins = editorLevel.grid.flat().filter(t => t === 'coin').length;
      const levelToPublish: Level = {
        ...editorLevel,
        totalCoins,
        origin: 'community',
        createdBy: name,
      };
      try {
        const row = levelToSupaRow(levelToPublish, name);
        const { error } = await supabase.from('community_levels').insert({ ...row, created_at: new Date().toISOString() });
        if (error) throw error;
        const { data: lvls } = await supabase.from('community_levels').select('*');
        setCommunityLevels((lvls || []).map(supaLevelToLevel));
        alert('Fase publicada na comunidade!');
        setView('COMMUNITY_BROWSER');
      } catch (e) {
        console.error(e);
        alert('Não foi possível publicar. Verifique credenciais/políticas do backend.');
      }
      return;
    }
    const name = (authorName || localStorage.getItem('logicReflectAuthor') || '').trim() || 'Anônimo';
    const totalCoins = editorLevel.grid.flat().filter(t => t === 'coin').length;
    const levelToPublish: Level = {
      ...editorLevel,
      totalCoins,
      origin: 'community',
      createdBy: name,
    };

    alert('Publicação indisponível: backend JSON Server foi removido.');
  };

  const handleRateCommunityLevel = async (level: Level, stars: number) => {
    
    if (API_MODE === 'git') {
      if (GITHUB_TOKEN && GITHUB_OWNER && GITHUB_REPO) {
        try {
          const userName = (authorName || localStorage.getItem('logicReflectAuthor') || '').trim() || 'Visitante';
          await updateGitDb((db: any) => {
            const ratings: any[] = Array.isArray(db.communityRatings) ? db.communityRatings : [];
            const existing = ratings.find(r => r.levelId === level.id && r.user === userName);
            if (existing) {
              db.communityRatings = ratings.map(r => r.id === existing.id ? { ...existing, stars, at: Date.now() } : r);
            } else {
              const nextId = (ratings.reduce((m, it) => Math.max(m, Number(it.id || 0)), 0) || 0) + 1;
              db.communityRatings = [...ratings, { levelId: level.id, user: userName, stars, at: Date.now(), id: nextId }];
            }
            return db;
          }, `Rate community level ${level.id} by ${userName}`);
          const db = await fetchGitDb(GITHUB_OWNER, GITHUB_REPO, GITHUB_REF);
          setCommunityRatings(db.communityRatings || []);
          alert('Obrigado pela avaliação! (gravada via commit)');
        } catch (e) {
          console.error(e);
          alert('Não foi possível avaliar via GitHub. Verifique token/permissões.');
        }
        return;
      }
      const ghEditUrl = (GITHUB_OWNER && GITHUB_REPO) ? `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/edit/${GITHUB_REF}/db.json` : 'https://github.com/';
      alert(`Modo Git ativado: configure VITE_GITHUB_TOKEN para avaliar automaticamente.\nSem token, edite via PR: ${ghEditUrl}`);
      return;
    }
    if (API_MODE === 'supabase' && supabase) {
      if (!level.id) { alert('Nível inválido para avaliação.'); return; }
      const userName = (authorName || localStorage.getItem('logicReflectAuthor') || '').trim() || 'Visitante';
      try {
        const { data: existing, error: findErr } = await supabase
          .from('community_ratings')
          .select('id')
          .eq('level_id', level.id)
          .eq('user_name', userName)
          .limit(1)
          .maybeSingle();
        if (findErr) console.warn(findErr);
        if (existing?.id) {
          const { error } = await supabase
            .from('community_ratings')
            .update({ stars, at: new Date().toISOString() })
            .eq('id', existing.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('community_ratings')
            .insert({ level_id: level.id, user_name: userName, stars, at: new Date().toISOString() });
          if (error) throw error;
        }
        const { data: rts } = await supabase.from('community_ratings').select('*');
        setCommunityRatings((rts || []).map(supaRatingToRating));
        alert('Obrigado pela avaliação!');
      } catch (e) {
        console.error(e);
        alert('Não foi possível avaliar. Tente novamente mais tarde.');
      }
      return;
    }
    if (!level.id) { alert('Nível inválido para avaliação.'); return; }
    const userName = (authorName || localStorage.getItem('logicReflectAuthor') || '').trim() || 'Visitante';
    const existing = communityRatings.find(r => r.levelId === level.id && r.user === userName);

    alert('Avaliação indisponível: backend JSON Server foi removido.');
  };

  const handleLoadLevelToPlay = (level: Level) => { setActiveLevel(level); setView('PLAY'); };
  const handleDeleteLevel = (level: Level) => {
    if (level.origin === 'builtin') {
      alert('Este nível é oficial e não pode ser excluído.');
      return;
    }
    const newSavedLevels = savedLevels.filter(l => l.name !== level.name);
    setSavedLevels(newSavedLevels);
    localStorage.setItem('logicReflectLevels', JSON.stringify(newSavedLevels));
  }
  const handleReturnToMenu = () => { setActiveLevel(null); setView('MENU'); resetBoard(); }
  const handleReturnToEditor = () => { resetBoard(); setView('EDITOR'); }
  const handleModalNext = () => {
    if (view === 'PLAY' && activeLevel) {
      const idx = savedLevels.findIndex(l => l.name === activeLevel.name);
      const nextLevel = idx >= 0 && idx + 1 < savedLevels.length ? savedLevels[idx + 1] : null;
      if (nextLevel) {
        setActiveLevel(nextLevel);
        setView('PLAY');
        setGameStatus('SETUP');
      } else {
        setGameStatus('ALL_LEVELS_COMPLETE');
      }
    } else {
      resetBoard();
    }
  };

  const saveRankingEntry = useCallback(async (initials: string) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = ctx.currentTime;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.5, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      const osc1 = ctx.createOscillator(); osc1.type = 'square'; osc1.frequency.setValueAtTime(880, now); osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.2); osc1.connect(gain);
      const osc2 = ctx.createOscillator(); osc2.type = 'sawtooth'; osc2.frequency.setValueAtTime(220, now); osc2.frequency.exponentialRampToValueAtTime(440, now + 0.15); osc2.connect(gain);
      gain.connect(ctx.destination); osc1.start(now); osc2.start(now); osc1.stop(now + 0.32); osc2.stop(now + 0.3);
    } catch {}
    setShowConfirmEffect(true);
    setTimeout(() => setShowConfirmEffect(false), 480);

    const entry: RankingEntry = {
      initials,
      score: liveSimStateRef.current?.collectedCoins || 0,
      level: currentLevel?.name,
      at: Date.now(),
    };
    
    if (API_MODE === 'git') {
      if (GITHUB_TOKEN && GITHUB_OWNER && GITHUB_REPO) {
        try {
          await updateGitDb((db: any) => {
            const list: any[] = Array.isArray(db.ranking) ? db.ranking : [];
            const nextId = (list.reduce((m, it) => Math.max(m, Number(it.id || 0)), 0) || 0) + 1;
            db.ranking = [...list, { ...entry, id: nextId }];
            return db;
          }, `Add ranking entry by ${initials}`);
          const db = await fetchGitDb(GITHUB_OWNER, GITHUB_REPO, GITHUB_REF);
          const serverRanking = [...(db.ranking || [])].sort((a,b) => b.score - a.score).slice(0, 10);
          setRanking(serverRanking);
          try { localStorage.setItem('logicReflectRanking', JSON.stringify(serverRanking)); } catch {}
        } catch (e) {
          console.error(e);
          // Fallback local
          const newRanking = [...ranking, entry].sort((a,b) => b.score - a.score).slice(0, 10);
          setRanking(newRanking);
          try { localStorage.setItem('logicReflectRanking', JSON.stringify(newRanking)); } catch {}
        }
        setIsInitialsOpen(false);
        return;
      }
      const newRanking = [...ranking, entry].sort((a,b) => b.score - a.score).slice(0, 10);
      setRanking(newRanking);
      try { localStorage.setItem('logicReflectRanking', JSON.stringify(newRanking)); } catch {}
      setIsInitialsOpen(false);
      return;
    }
    if (API_MODE === 'supabase' && supabase) {
      try {
        const entryRow = { initials, score: liveSimStateRef.current?.collectedCoins || 0, level: currentLevel?.name, at: new Date().toISOString() };
        const { error } = await supabase.from('ranking').insert(entryRow);
        if (error) throw error;
        const { data: list } = await supabase
          .from('ranking')
          .select('*')
          .order('score', { ascending: false })
          .limit(10);
        const serverRanking = (list || []).map(supaRankingToEntry);
        setRanking(serverRanking);
        try { localStorage.setItem('logicReflectRanking', JSON.stringify(serverRanking)); } catch {}
      } catch (e) {
        console.error(e);
        const newRanking = [...ranking, { initials, score: liveSimStateRef.current?.collectedCoins || 0, level: currentLevel?.name, at: Date.now() }].sort((a,b) => b.score - a.score).slice(0, 10);
        setRanking(newRanking);
        try { localStorage.setItem('logicReflectRanking', JSON.stringify(newRanking)); } catch {}
      }
      setIsInitialsOpen(false);
      return;
    }
    // Tenta salvar no servidor; se falhar, faz fallback para localStorage
    // JSON Server removido: ranking é salvo via Supabase ou Git. Fallback local abaixo.
    const newRanking = [...ranking, entry].sort((a,b) => b.score - a.score).slice(0, 10);
    setRanking(newRanking);
    localStorage.setItem('logicReflectRanking', JSON.stringify(newRanking));
    setIsInitialsOpen(false);
  }, [ranking, currentLevel]);

  const totalGlobalCoins = useMemo(() => savedLevels.reduce((sum, level) => sum + (level.highScore || 0), 0), [savedLevels]);

  const ratingsSummary = useMemo(() => {
    const summary: Record<number, { average: number; count: number }> = {};
    for (const r of communityRatings) {
      const key = r.levelId;
      if (!summary[key]) summary[key] = { average: 0, count: 0 };
      summary[key].average = ((summary[key].average * summary[key].count) + r.stars) / (summary[key].count + 1);
      summary[key].count += 1;
    }
    return summary;
  }, [communityRatings]);

  const renderContent = () => {
    switch (view) {
      case 'MENU':
        return <MainMenu onOficina={() => setView('EDITOR')} onFases={() => setView('LEVEL_BROWSER')} onComunidade={() => setView('COMMUNITY_BROWSER')} onHistoria={() => setIsStoryOpen(true)} onRanking={() => setIsRankingOpen(true)} totalCoins={totalGlobalCoins} />;
      case 'LEVEL_BROWSER':
        return <LevelBrowser levels={savedLevels} onPlay={(lvl) => { setIsPlayingCommunity(false); handleLoadLevelToPlay(lvl); }} />;
      case 'COMMUNITY_BROWSER':
        return (
          <CommunityBrowser
            levels={communityLevels}
            ratingsSummary={ratingsSummary}
            onPlay={(lvl) => { setIsPlayingCommunity(true); handleLoadLevelToPlay(lvl); }}
            onRate={(lvl, stars) => handleRateCommunityLevel(lvl, stars)}
            ratingsEnabled={true}
          />
        );
      case 'EDITOR':
      case 'PLAY':
        if (!currentLevel) return <div>Carregando...</div>;
        const isTestMode = view === 'PLAY' && !activeLevel;

        return (
            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
              <div className="lg:col-span-2">
                <Grid
                  level={currentLevel}
                  placedTools={placedTools}
                  collector={collector}
                  simulationState={simulationState}
                  onTileClick={handleTileClick}
                  gameStatus={view === 'EDITOR' ? 'SETUP' : gameStatus}
                />
              </div>
              <aside className="flex flex-col space-y-4">
                {view === 'EDITOR' ? (
                  <>
                    <TilePalette 
                      level={editorLevel} 
                      setLevel={setEditorLevel} 
                      selection={paletteSelection}
                      onSelectionChange={setPaletteSelection}
                      subState={editorSubState}
                      onSubStateChange={setEditorSubState}
                    />
                    <EditorControls authorName={authorName} onAuthorNameChange={setAuthorName} onTestLevel={() => { setActiveLevel(null); setView('PLAY'); }} onPublishLevel={handlePublishLevel} onClearGrid={() => { setEditorLevel(createBlankLevel()); setPaletteSelection(null); }} />
                  </>
                ) : (
                  <>
                    <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 text-center">
                        <p className="text-2xl font-bold text-yellow-400">Moedas: {simulationState.collectedCoins} / {currentLevel.totalCoins || 0}</p>
                    </div>
                    <Inventory inventory={currentLevel.inventory} placedTools={placedTools} selectedTool={selectedTool} onSelectTool={setSelectedTool} gameStatus={gameStatus}/>
                    <Controls status={gameStatus} onPlay={handlePlay} onReset={resetBoard} canPlay={currentLevel.startPosition.x !== -1} isPlayingCustom={!isTestMode}/>
                    {isTestMode && (
                        <div className="flex items-center justify-center space-x-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                             <button onClick={handleReturnToEditor} className="px-8 py-3 bg-purple-600 text-white font-bold text-lg rounded-lg shadow-md hover:bg-purple-500">Editar</button>
                        </div>
                    )}
                  </>
                )}
              </aside>
            </main>
        );
      default: return null;
    }
  };

  useEffect(() => {
    let context: 'menu' | 'play' | 'community' = 'menu';
    if (view === 'PLAY') context = isPlayingCommunity ? 'community' : 'play';
    else if (view === 'COMMUNITY_BROWSER') context = 'community';
    document.dispatchEvent(new CustomEvent('logicReflect:music:setContext', { detail: { context } }));
  }, [view, isStartOpen, isIntroOpen, isPlayingCommunity]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 sm:p-8 font-sans">
      <div className="w-full max-w-7xl mx-auto">
        <header className="text-center mb-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-wider text-cyan-300">Logic <span className="text-indigo-400">Reflect</span></h1>
          {(!isStartOpen && !isIntroOpen) && view !== 'MENU' && (
             <button onClick={view === 'PLAY' && !activeLevel ? handleReturnToEditor : handleReturnToMenu} className='mt-4 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-500 transition-colors'>
                ← {view === 'PLAY' && !activeLevel ? 'Voltar para Oficina' : 'Menu Principal'}
            </button>
          )}
        </header>
        {renderContent()}
      </div>
      {directionModal.isOpen && <DirectionModal prompt={directionModal.prompt} onSelectDirection={directionModal.onSelect} />}
      <StoryModal isOpen={isStoryOpen} onClose={() => setIsStoryOpen(false)} />
      <IntroCinematic isOpen={isIntroOpen} onClose={() => { setIsIntroOpen(false); setView('MENU'); }} />
      <StartScreen isOpen={isStartOpen} onStart={() => { setIsStartOpen(false); setIsIntroOpen(true); try { localStorage.setItem('logicReflectMusicEnabled', 'true'); } catch {}; document.dispatchEvent(new Event('logicReflect:music:play')); }} onSkipMenu={() => { setIsStartOpen(false); setIsIntroOpen(false); setView('MENU'); }} />
      <InitialsModal open={isInitialsOpen && gameStatus === 'FAIL'} score={liveSimStateRef.current?.collectedCoins || 0} onSave={saveRankingEntry} onCancel={() => setIsInitialsOpen(false)} />
      {!(gameStatus === 'FAIL' && isInitialsOpen) && (
        <Modal status={gameStatus} onNextLevel={handleModalNext} onReset={resetBoard} isTestMode={view === 'PLAY' && !activeLevel} onGoToEditor={handleReturnToEditor} />
      )}
      <RankingModal open={isRankingOpen} entries={ranking} onClose={() => setIsRankingOpen(false)} />
      <ConfirmEffect visible={showConfirmEffect} />
      <MusicPlayer />
      <SettingsModal open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <button
        onClick={() => setIsSettingsOpen(true)}
        className="fixed bottom-4 right-4 z-50 px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg shadow hover:bg-gray-700"
        aria-label="Abrir Configurações"
      >
        Configurações
      </button>
    </div>
  );
};

export default App;
