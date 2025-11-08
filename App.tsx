import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Controls } from './components/Controls';
import { Grid } from './components/Grid';
import { Inventory } from './components/Inventory';
import { Modal } from './components/Modal';
import { TilePalette } from './components/TilePalette';
import { EditorControls } from './components/EditorControls';
import { MainMenu } from './components/MainMenu';
import { LevelBrowser } from './components/LevelBrowser';
import { DirectionModal } from './components/DirectionModal';
import { TICK_SPEED } from './constants';
import type { GameStatus, PlacedTool, ToolType, CollectorState, Direction, Level, AppView, PaletteSelection, Grid as GridType, TileType, SimulationState, Teleporter, RankingEntry } from './types';
import { StoryModal } from './components/StoryModal';
import { IntroCinematic } from './components/IntroCinematic';
import { StartScreen } from './components/StartScreen';
import { builtinLevels } from './levels';
import { InitialsModal } from './components/InitialsModal';
import { RankingModal } from './components/RankingModal'
import { ConfirmEffect } from './components/ConfirmEffect'

// API endpoint para ranking compartilhado (JSON Server)
const RANKING_API = 'http://localhost:4000/ranking';

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
   const [isInitialsOpen, setIsInitialsOpen] = useState<boolean>(false);
   const [isRankingOpen, setIsRankingOpen] = useState<boolean>(false);
   const [showConfirmEffect, setShowConfirmEffect] = useState<boolean>(false);
   
   // remove auto-open da intro; agora abrimos após Start
   // Intro não abre automaticamente; será acionada após Start
  // useEffect(() => {}, []);
  const currentLevel = view === 'EDITOR' || (view === 'PLAY' && !activeLevel) ? editorLevel : activeLevel;
  const [collector, setCollector] = useState<CollectorState>({ x: -1, y: -1, direction: { dx: 1, dy: 0 }, visible: false });
  
  const gameIntervalRef = useRef<number | null>(null);
  const simCollectorRef = useRef<CollectorState | null>(null);
  const liveSimStateRef = useRef<SimulationState | null>(null);
  const gameStatusRef = useRef<GameStatus>('SETUP');
  const skipNextResetRef = useRef<boolean>(false);

  // Mantém o status do jogo atualizado em uma ref para evitar closures obsoletas no setInterval
  useEffect(() => {
    gameStatusRef.current = gameStatus;
  }, [gameStatus]);
  
  useEffect(() => {
    try {
      const stored = localStorage.getItem('logicReflectLevels');
      const existing = stored ? JSON.parse(stored) : [];
      const builtins = builtinLevels();
      const byName = new Map<string, any>(existing.map((l: any) => [l.name, l]));
      for (const lvl of builtins) {
        if (!byName.has(lvl.name)) byName.set(lvl.name, lvl);
      }
      const merged = Array.from(byName.values());
      setSavedLevels(merged);
      localStorage.setItem('logicReflectLevels', JSON.stringify(merged));

      // Primeiro tenta carregar do servidor; se falhar, usa localStorage
      fetch(RANKING_API)
        .then(res => res.ok ? res.json() : Promise.reject())
        .then((data: any[]) => {
          const serverRanking = [...data].sort((a,b) => b.score - a.score).slice(0, 10);
          setRanking(serverRanking);
          try { localStorage.setItem('logicReflectRanking', JSON.stringify(serverRanking)); } catch {}
        })
        .catch(() => {
          const storedRanking = localStorage.getItem('logicReflectRanking');
          if (storedRanking) {
            try { setRanking(JSON.parse(storedRanking)); } catch {}
          }
        });
    } catch (error) {
      console.error('Failed to load levels:', error);
    }
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
      // Evita reset imediato quando atualizamos o nível após a vitória
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
        // Atualiza ponteiro do nível sem resetar imediatamente o tabuleiro
        skipNextResetRef.current = true;
        setActiveLevel(updatedLevel);
        const newSavedLevels = savedLevels.map(l => l.name === updatedLevel.name ? updatedLevel : l);
        setSavedLevels(newSavedLevels);
        localStorage.setItem('logicReflectLevels', JSON.stringify(newSavedLevels));
    }
  }, [activeLevel, savedLevels]);

  const gameTick = useCallback(() => {
      // Só processa ticks quando o jogo está efetivamente rodando
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

                  // Reativa o loop de jogo apenas se ainda estivermos rodando
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
            
            const newTeleporter: Omit<Teleporter, 'exitDirection'> & {exitDirection?: Direction} = { id: pairId, type: stage, x, y };
            newGrid[y][x] = 'teleporter';
            newTeleporters.push(newTeleporter as Teleporter);

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
    // Close win modal and return to editor for continuity
    resetBoard();
    setView('EDITOR');
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
    // Play confirm sound and burst effect
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
    // Tenta salvar no servidor; se falhar, faz fallback para localStorage
    try {
      const resp = await fetch(RANKING_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      if (!resp.ok) throw new Error('Failed to save to server');
      const list = await fetch(RANKING_API).then(r => r.json());
      const serverRanking = [...list].sort((a,b) => b.score - a.score).slice(0, 10);
      setRanking(serverRanking);
      try { localStorage.setItem('logicReflectRanking', JSON.stringify(serverRanking)); } catch {}
    } catch {
      const newRanking = [...ranking, entry].sort((a,b) => b.score - a.score).slice(0, 10);
      setRanking(newRanking);
      try { localStorage.setItem('logicReflectRanking', JSON.stringify(newRanking)); } catch {}
    }
    setIsInitialsOpen(false);
  }, [ranking, currentLevel]);

  const totalGlobalCoins = useMemo(() => savedLevels.reduce((sum, level) => sum + (level.highScore || 0), 0), [savedLevels]);

  const renderContent = () => {
    switch (view) {
      case 'MENU':
        return <MainMenu onOficina={() => setView('EDITOR')} onFases={() => setView('LEVEL_BROWSER')} onHistoria={() => setIsStoryOpen(true)} onRanking={() => setIsRankingOpen(true)} totalCoins={totalGlobalCoins} />;
      case 'LEVEL_BROWSER':
        return <LevelBrowser levels={savedLevels} onPlay={handleLoadLevelToPlay} />;
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
                    <EditorControls onTestLevel={() => { setActiveLevel(null); setView('PLAY'); }} onSaveLevel={handleSaveLevel} onClearGrid={() => { setEditorLevel(createBlankLevel()); setPaletteSelection(null); }} />
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
                             <button onClick={handleSaveLevel} className="px-8 py-3 bg-blue-600 text-white font-bold text-lg rounded-lg shadow-md hover:bg-blue-500">Salvar</button>
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

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 sm:p-8 font-sans">
      <div className="w-full max-w-7xl mx-auto">
        <header className="text-center mb-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-wider text-cyan-300">Logic <span className="text-indigo-400">Reflect</span></h1>
          {(!isStartOpen && !isIntroOpen) && view !== 'MENU' && (
             <button onClick={view === 'PLAY' && !activeLevel ? handleReturnToEditor : handleReturnToMenu} className='mt-4 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-500 transition-colors'>
                &larr; {view === 'PLAY' && !activeLevel ? 'Voltar para Oficina' : 'Menu Principal'}
            </button>
          )}
        </header>
        {renderContent()}
      </div>
      {directionModal.isOpen && <DirectionModal prompt={directionModal.prompt} onSelectDirection={directionModal.onSelect} />}
      <StoryModal isOpen={isStoryOpen} onClose={() => setIsStoryOpen(false)} />
      <IntroCinematic isOpen={isIntroOpen} onClose={() => { setIsIntroOpen(false); setView('MENU'); }} />
      <StartScreen isOpen={isStartOpen} onStart={() => { setIsStartOpen(false); setIsIntroOpen(true); }} onSkipMenu={() => { setIsStartOpen(false); setIsIntroOpen(false); setView('MENU'); }} />
      <InitialsModal open={isInitialsOpen && gameStatus === 'FAIL'} score={liveSimStateRef.current?.collectedCoins || 0} onSave={saveRankingEntry} onCancel={() => setIsInitialsOpen(false)} />
      {!(gameStatus === 'FAIL' && isInitialsOpen) && (
        <Modal status={gameStatus} onNextLevel={handleModalNext} onReset={resetBoard} isTestMode={view === 'PLAY' && !activeLevel} onSaveLevel={handleSaveLevel} onGoToEditor={handleReturnToEditor} />
      )}
      <RankingModal open={isRankingOpen} entries={ranking} onClose={() => setIsRankingOpen(false)} />
      <ConfirmEffect visible={showConfirmEffect} />
    </div>
  );
};

export default App;
