import { useState, useEffect, useRef } from 'react';
import type { WordCard } from './utils/words';
import { getRandomWords } from './utils/words';
import { sound } from './utils/sound';

type Screen = 'title' | 'setup' | 'turn-intro' | 'card-selection' | 'preparation' | 'action' | 'summary' | 'game-over';

// Custom SVGs and icon components matching user designs
const SoundIcon = ({ muted }: { muted: boolean }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill={muted ? "none" : "#3B82F6"} stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill={muted ? "none" : "#3B82F6"} />
    {!muted && (
      <>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      </>
    )}
    {muted && (
      <>
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
      </>
    )}
  </svg>
);
const QuestionIcon = () => (
  <span style={{ color: '#E53B3B', fontSize: '1.6rem', fontWeight: 900, fontFamily: 'Fredoka', lineHeight: 1 }}>?</span>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 008 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 8a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

const SparkIcon = ({ style }: { style: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" width="26" height="26" style={{ position: 'absolute', pointerEvents: 'none', filter: 'drop-shadow(2px 2px 0px #000)', ...style }}>
    <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9Z" fill="#E53B3B" stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
);

const BlueMaskIcon = () => (
  <svg viewBox="0 0 100 100" width="55" height="55" style={{ marginLeft: '8px', alignSelf: 'center', filter: 'drop-shadow(2px 2px 0px #000)', transform: 'rotate(5deg)' }}>
    <path d="M10,40 C10,15 90,15 90,40 C90,75 70,90 50,90 C30,90 10,75 10,40 Z" fill="#459CFF" stroke="#000" strokeWidth="6" strokeLinejoin="round" />
    <path d="M25,40 Q35,30 45,40" fill="none" stroke="#000" strokeWidth="6" strokeLinecap="round" />
    <path d="M55,40 Q65,30 75,40" fill="none" stroke="#000" strokeWidth="6" strokeLinecap="round" />
    <path d="M30,60 Q50,80 70,60 Q50,70 30,60" fill="#000" stroke="#000" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const WindowIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <rect x="2" y="2" width="20" height="20" rx="3" ry="3" fill="#FF8A00" />
    <line x1="2" y1="8" x2="22" y2="8" />
    <rect x="5" y="11" width="14" height="8" fill="#FFFFFF" stroke="#000000" strokeWidth="2" rx="1" ry="1" />
  </svg>
);


const MiniClapperboard = () => (
  <div 
    style={{ 
      position: 'absolute', 
      top: '-15px', 
      right: '10px', 
      background: '#000000', 
      color: '#FFFFFF', 
      border: '3px solid #000000',
      borderRadius: '8px',
      padding: '4px 8px',
      transform: 'rotate(10deg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      zIndex: 10,
      boxShadow: '2px 2px 0px rgba(0,0,0,0.15)',
      boxSizing: 'border-box'
    }}
  >
    {/* Diagonal stripes */}
    <div style={{ 
      width: '100%', 
      height: '6px', 
      background: 'repeating-linear-gradient(-45deg, #fff, #fff 4px, #000 4px, #000 8px)',
      borderBottom: '2.5px solid #fff',
      marginBottom: '2px'
    }}></div>
    <span style={{ fontSize: '0.55rem', fontWeight: 900, letterSpacing: '0.2px', color: '#FFCC00', lineHeight: 1 }}>GESTOS</span>
    <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.2px', color: '#FFFFFF', lineHeight: 1 }}>RUSH</span>
  </div>
);

interface Team {
  id: string;
  name: string;
  score: number;
  color: string;
}

function App() {
  // Dynamic font sizing based on card text length
  const getCardFontSize = (text: string, isSmallCard: boolean = false) => {
    const len = text.length;
    if (isSmallCard) {
      if (len > 30) return '0.45rem';
      if (len > 22) return '0.52rem';
      if (len > 15) return '0.62rem';
      if (len > 8) return '0.72rem';
      return '0.8rem';
    }
    if (len > 35) return '0.58rem';
    if (len > 25) return '0.66rem';
    if (len > 15) return '0.75rem';
    return '0.85rem';
  };
  // Game Configuration States
  const [screen, setScreen] = useState<Screen>('title');
  const [playedWordIds, setPlayedWordIds] = useState<string[]>([]);
  const [gameMode, setGameMode] = useState<'classic' | 'all-vs-all'>('classic');
  const [rescuingSlotIdx, setRescuingSlotIdx] = useState<number | null>(null);
  const [cardSavedByTeam, setCardSavedByTeam] = useState<Record<string, string>>({});
  const [teams, setTeams] = useState<Team[]>([
    { id: '1', name: 'Equipo Rojo', score: 0, color: '#EF4444' },
    { id: '2', name: 'Equipo Azul', score: 0, color: '#3B82F6' },
  ]);
  
  const TEAM_COLORS = ['#EF4444', '#3B82F6', '#22C55E', '#EAB308', '#A855F7', '#F97316', '#EC4899', '#06B6D4'];

  const addTeam = () => {
    if (teams.length >= 8) {
      alert('¡El límite es de 8 equipos!');
      return;
    }
    sound.playSave();
    const nextIdx = teams.length;
    const color = TEAM_COLORS[nextIdx] || `#${Math.floor(Math.random()*16777215).toString(16)}`;
    const teamNames = ['Rojo', 'Azul', 'Verde', 'Amarillo', 'Púrpura', 'Naranja', 'Rosa', 'Celeste'];
    const defaultName = `Equipo ${teamNames[nextIdx] || nextIdx + 1}`;
    
    setTeams(prev => [
      ...prev,
      { id: `${Date.now()}`, name: defaultName, score: 0, color }
    ]);
  };

  const removeTeam = (id: string) => {
    if (teams.length <= 2) return;
    sound.playDrag();
    setTeams(prev => prev.filter(t => t.id !== id));
  };

  const [rounds, setRounds] = useState<number>(3);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [currentTeamIdx, setCurrentTeamIdx] = useState<number>(0);
  
  // Custom Words State (Digital "Marcador Borrable")
  const [customWordsInput, setCustomWordsInput] = useState<string>('');
  const [customWordPool, setCustomWordPool] = useState<string[]>([]);

  // Turn States
  const [actorName, setActorName] = useState<string>('');
  const [chosenCards, setChosenCards] = useState<WordCard[]>([]);
  const [slots, setSlots] = useState<(WordCard | null)[]>([null, null, null, null]);
  const [cardStatus, setCardStatus] = useState<Record<string, 'active' | 'saved' | 'sunk'>>({});

  // Timer & Game Loop States
  const [turnTimeLeft, setTurnTimeLeft] = useState<number>(60);
  const [claquetaOpen, setClaquetaOpen] = useState<boolean>(true);
  const [muted, setMuted] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [revealToActor, setRevealToActor] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Drag and drop / swap helpers
  const [draggingCard, setDraggingCard] = useState<WordCard | null>(null);
  const [draggingSlotIdx, setDraggingSlotIdx] = useState<number | null>(null);
  const [selectedTrayCard, setSelectedTrayCard] = useState<WordCard | null>(null);
  const [selectedSlotIdx, setSelectedSlotIdx] = useState<number | null>(null);

  // Mobile Touch Drag State & Handlers
  interface TouchState {
    card: WordCard;
    sourceSlotIdx: number | null;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  }
  const [activeTouch, setActiveTouch] = useState<TouchState | null>(null);

  const handleTouchStart = (e: React.TouchEvent, card: WordCard, sourceSlotIdx: number | null) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    sound.playDrag();
    setActiveTouch({
      card,
      sourceSlotIdx,
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!activeTouch) return;
    const touch = e.touches[0];
    setActiveTouch(prev => {
      if (!prev) return null;
      return {
        ...prev,
        currentX: touch.clientX,
        currentY: touch.clientY
      };
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!activeTouch) return;
    const touch = e.changedTouches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    let targetSlotIdx: number | null = null;
    let curr = element;
    while (curr) {
      if (curr.classList.contains('claqueta-slot-target')) {
        const idxAttr = curr.getAttribute('data-slot-idx');
        if (idxAttr !== null) {
          targetSlotIdx = parseInt(idxAttr, 10);
        }
        break;
      }
      curr = curr.parentElement;
    }

    if (targetSlotIdx !== null) {
      sound.playSave();
      if (activeTouch.sourceSlotIdx !== null) {
        setSlots(prev => {
          const next = [...prev];
          const temp = next[activeTouch.sourceSlotIdx!];
          next[activeTouch.sourceSlotIdx!] = next[targetSlotIdx!];
          next[targetSlotIdx!] = temp;
          return next;
        });
      } else {
        setSlots(prev => {
          const next = [...prev];
          const prevIdx = next.findIndex(s => s?.id === activeTouch.card.id);
          if (prevIdx !== -1) next[prevIdx] = null;
          next[targetSlotIdx!] = activeTouch.card;
          return next;
        });
      }
    }
    setActiveTouch(null);
  };

  // Refs for tracking timer
  const timerRef = useRef<number | null>(null);
  const turnTimeLeftRef = useRef<number>(60);

  // Sync ref with state for use in interval
  useEffect(() => {
    turnTimeLeftRef.current = turnTimeLeft;
  }, [turnTimeLeft]);

  // Sync fullscreen state changes and handle BGM autoplay on mount/interaction
  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFSChange);

    // Try to play BGM immediately
    sound.playBGM();

    // Fallback: start BGM on first user interaction anywhere (bypasses browser autoplay restrictions)
    const startBGMOnInteraction = () => {
      sound.playBGM();
      window.removeEventListener('click', startBGMOnInteraction);
      window.removeEventListener('touchstart', startBGMOnInteraction);
      window.removeEventListener('keydown', startBGMOnInteraction);
    };

    window.addEventListener('click', startBGMOnInteraction);
    window.addEventListener('touchstart', startBGMOnInteraction);
    window.addEventListener('keydown', startBGMOnInteraction);

    return () => {
      document.removeEventListener('fullscreenchange', handleFSChange);
      if (timerRef.current) clearInterval(timerRef.current);
      window.removeEventListener('click', startBGMOnInteraction);
      window.removeEventListener('touchstart', startBGMOnInteraction);
      window.removeEventListener('keydown', startBGMOnInteraction);
    };
  }, []);

  const toggleMuted = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    sound.setMuted(nextMuted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const startSetup = () => {
    sound.playSave();
    sound.playBGM();
    setScreen('setup');
  };

  // Add Custom Words
  const handleAddCustomWords = () => {
    if (!customWordsInput.trim()) return;
    const words = customWordsInput
      .split(',')
      .map(w => w.trim())
      .filter(w => w.length > 0);
    
    setCustomWordPool(prev => [...prev, ...words]);
    setCustomWordsInput('');
    sound.playSave();
  };

  // Start Turn Selection
  const startTurnSelection = () => {
    if (!actorName.trim()) {
      alert('Por favor introduce el nombre del actor para este turno.');
      return;
    }
    sound.playDrag();
    setChosenCards([]);
    setSlots([null, null, null, null]);
    setCardStatus({});
    setScreen('card-selection');
  };

  // Draw card helper from decks
  const drawCard = (difficulty: 'Fácil' | 'Medio' | 'Difícil' | 'Personalizada'): WordCard => {
    if (difficulty === 'Personalizada') {
      if (customWordPool.length === 0) {
        return {
          id: `empty-${Date.now()}`,
          word: '¡Crea más palabras!',
          difficulty: 'Medio',
          points: 2,
          category: 'Personalizada'
        };
      }
      const randomWord = customWordPool[Math.floor(Math.random() * customWordPool.length)];
      return {
        id: `custom-${Math.random()}-${Date.now()}`,
        word: randomWord,
        difficulty: 'Medio',
        points: 2,
        category: 'Personalizada'
      };
    }

    const randomWords = getRandomWords(1, difficulty, playedWordIds);
    return randomWords[0];
  };

  // Click deck to select card
  const selectCardFromDeck = (difficulty: 'Fácil' | 'Medio' | 'Difícil' | 'Personalizada') => {
    if (chosenCards.length >= 4) return;
    
    sound.playSave();
    let newCard = drawCard(difficulty);
    
    // Prevent drawing duplicate words in the same turn selection
    let attempts = 0;
    while (chosenCards.some(c => c.word === newCard.word) && attempts < 25) {
      newCard = drawCard(difficulty);
      attempts++;
    }
    
    setChosenCards(prev => [...prev, newCard]);
  };

  // Drag start from tray cards
  const handleTrayDragStart = (card: WordCard) => {
    setDraggingCard(card);
    setDraggingSlotIdx(null);
    sound.playDrag();
  };

  // Drag start from placed slot card
  const handleSlotDragStart = (e: React.DragEvent, slotIdx: number) => {
    setDraggingSlotIdx(slotIdx);
    setDraggingCard(null);
    e.dataTransfer.setData('text/plain', 'slot');
    sound.playDrag();
  };

  // Drop on slot
  const handleSlotDrop = (e: React.DragEvent, targetSlotIdx: number) => {
    e.preventDefault();
    if (draggingSlotIdx !== null) {
      // Reordering between slots (swap)
      sound.playSave();
      setSlots(prev => {
        const next = [...prev];
        const temp = next[draggingSlotIdx];
        next[draggingSlotIdx] = next[targetSlotIdx];
        next[targetSlotIdx] = temp;
        return next;
      });
      setDraggingSlotIdx(null);
    } else if (draggingCard) {
      // Placing from tray into slot
      sound.playSave();
      setSlots(prev => {
        const next = [...prev];
        // If card was in another slot, clear it
        const prevIdx = next.findIndex(s => s?.id === draggingCard.id);
        if (prevIdx !== -1) {
          next[prevIdx] = null;
        }
        
        // If slot is occupied, push displaced card back to tray if it wasn't already there
        next[targetSlotIdx] = draggingCard;
        return next;
      });
      setDraggingCard(null);
    }
  };

  // Mobile Click Fallbacks (Tray Card -> Slot Card swap/placement)
  const handleTrayCardClick = (card: WordCard) => {
    sound.playDrag();
    // If card is already in a slot, clicking it pulls it back to the tray
    const slotIdx = slots.findIndex(s => s?.id === card.id);
    if (slotIdx !== -1) {
      setSlots(prev => {
        const next = [...prev];
        next[slotIdx] = null;
        return next;
      });
      setSelectedTrayCard(null);
      return;
    }

    setSelectedTrayCard(card);
    
    // Automatically fill first empty slot if any
    const firstEmpty = slots.findIndex(s => s === null);
    if (firstEmpty !== -1) {
      setSlots(prev => {
        const next = [...prev];
        next[firstEmpty] = card;
        return next;
      });
      setSelectedTrayCard(null);
    }
  };

  const handleSlotClick = (slotIdx: number) => {
    if (selectedTrayCard) {
      // Place selected tray card here
      sound.playSave();
      setSlots(prev => {
        const next = [...prev];
        // If card was in another slot, clear it
        const prevIdx = next.findIndex(s => s?.id === selectedTrayCard.id);
        if (prevIdx !== -1) next[prevIdx] = null;

        next[slotIdx] = selectedTrayCard;
        return next;
      });
      setSelectedTrayCard(null);
      setSelectedSlotIdx(null);
    } else if (selectedSlotIdx !== null) {
      // Swap slots
      sound.playDrag();
      setSlots(prev => {
        const next = [...prev];
        const temp = next[selectedSlotIdx];
        next[selectedSlotIdx] = next[slotIdx];
        next[slotIdx] = temp;
        return next;
      });
      setSelectedSlotIdx(null);
    } else {
      // Select slot for swapping
      setSelectedSlotIdx(slotIdx);
    }
  };

  // Discard card from slot (sends back to tray)
  const discardSlotCard = (e: React.MouseEvent, slotIdx: number) => {
    e.stopPropagation();
    sound.playDrag();
    setSlots(prev => {
      const next = [...prev];
      next[slotIdx] = null;
      return next;
    });
    setSelectedSlotIdx(null);
  };

  // Start Action Countdown
  const startActionPhase = () => {
    if (slots.some(s => s === null)) {
      alert('¡Debes acomodar las 4 tarjetas en la claqueta para jugar!');
      return;
    }

    sound.playClapboard();
    sound.stopBGM();
    setClaquetaOpen(false); // Snap!
    
    // Set all placed cards to active
    const initialStatus: Record<string, 'active' | 'saved' | 'sunk'> = {};
    slots.forEach(s => {
      if (s) initialStatus[s.id] = 'active';
    });
    setCardStatus(initialStatus);

    setTurnTimeLeft(60);
    setScreen('action');
    setRevealToActor(true);

    // Wait 1 second before opening clapper and starting timer
    setTimeout(() => {
      setClaquetaOpen(true);
      startCountdown();
    }, 850);
  };

  const startCountdown = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = window.setInterval(() => {
      setTurnTimeLeft(prev => {
        const next = prev - 1;

        if (next > 0) {
          if (next <= 10) {
            sound.playTock(); // Warning sound
          } else {
            sound.playTick(); // Tick sound
          }
        }

        checkSinkingThresholds(next);

        if (next <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          
          // Switch-style snap closure on time-up!
          setClaquetaOpen(false);
          sound.playClapboard(); // Switch click!
          sound.playBuzzer(); // Buzz timbre!

          setTimeout(() => {
            setCardStatus(current => {
              endTurn(current, true);
              return current;
            });
          }, 450);
          return 0;
        }
        return next;
      });
    }, 1000);
  };

  const checkSinkingThresholds = (secondsLeft: number) => {
    setSlots(currentSlots => {
      setCardStatus(currentStatus => {
        let changed = false;
        const nextStatus = { ...currentStatus };

        // Slot 0
        if (secondsLeft <= 45 && currentSlots[0] && nextStatus[currentSlots[0]!.id] === 'active') {
          nextStatus[currentSlots[0]!.id] = 'sunk';
          sound.playSink();
          changed = true;
        }
        // Slot 1
        if (secondsLeft <= 30 && currentSlots[1] && nextStatus[currentSlots[1]!.id] === 'active') {
          nextStatus[currentSlots[1]!.id] = 'sunk';
          sound.playSink();
          changed = true;
        }
        // Slot 2
        if (secondsLeft <= 15 && currentSlots[2] && nextStatus[currentSlots[2]!.id] === 'active') {
          nextStatus[currentSlots[2]!.id] = 'sunk';
          sound.playSink();
          changed = true;
        }
        // Slot 3
        if (secondsLeft <= 0 && currentSlots[3] && nextStatus[currentSlots[3]!.id] === 'active') {
          nextStatus[currentSlots[3]!.id] = 'sunk';
          sound.playSink();
          changed = true;
        }

        return changed ? nextStatus : currentStatus;
      });
      return currentSlots;
    });
  };

  // Grab/Save Card
  const rescueCard = (slotIdx: number, targetTeamId?: string) => {
    const card = slots[slotIdx];
    if (!card) return;
    if (cardStatus[card.id] !== 'active') return;

    sound.playSave();
    setCardStatus(prev => ({
      ...prev,
      [card.id]: 'saved'
    }));

    if (gameMode === 'all-vs-all' && targetTeamId) {
      setTeams(prev => prev.map(t => t.id === targetTeamId ? { ...t, score: t.score + card.points } : t));
      setCardSavedByTeam(prev => ({ ...prev, [card.id]: targetTeamId }));
    } else if (gameMode === 'classic') {
      setTeams(prev => prev.map((t, idx) => idx === currentTeamIdx ? { ...t, score: t.score + card.points } : t));
    }

    setTimeout(() => {
      checkAllCardsResolved();
    }, 100);
  };

  const checkAllCardsResolved = () => {
    setCardStatus(current => {
      const statuses = Object.values(current);
      const allResolved = statuses.every(s => s === 'saved' || s === 'sunk');
      if (allResolved) {
        if (timerRef.current) clearInterval(timerRef.current);
        
        // Snap clapper shut early since round is done!
        setClaquetaOpen(false);
        sound.playClapboard(); // Switch click!

        setTimeout(() => {
          endTurn(current, false);
        }, 450);
      }
      return current;
    });
  };

  // End Turn
  const endTurn = (finalStatus: Record<string, 'active' | 'saved' | 'sunk'>, timeEnded: boolean = false) => {
    sound.playBGM();

    const turnPoints = slots.reduce((acc, card) => {
      if (card && finalStatus[card.id] === 'saved') {
        return acc + card.points;
      }
      return acc;
    }, 0);

    // Play fanfare if not timed-out buzzer
    if (!timeEnded) {
      if (turnPoints > 0) {
        sound.playWin();
      } else {
        sound.playLose();
      }
    }

    setScreen('summary');
  };

  const nextTurn = () => {
    sound.playDrag();
    setActorName('');
    setSlots([null, null, null, null]);
    setChosenCards([]);
    setSelectedSlotIdx(null);
    setSelectedTrayCard(null);
    setCardSavedByTeam({});
    setRescuingSlotIdx(null);
    
    const nextTeamIdx = (currentTeamIdx + 1) % teams.length;
    
    if (nextTeamIdx === 0) {
      const nextRound = currentRound + 1;
      if (nextRound > rounds) {
        setScreen('game-over');
        sound.playWin();
        return;
      }
      setCurrentRound(nextRound);
    }
    
    setCurrentTeamIdx(nextTeamIdx);
    setScreen('turn-intro');
  };

  const resetGame = () => {
    sound.playDrag();
    setCurrentRound(1);
    setCurrentTeamIdx(0);
    setTeams(prev => prev.map(t => ({ ...t, score: 0 })));
    setSlots([null, null, null, null]);
    setChosenCards([]);
    setSelectedSlotIdx(null);
    setSelectedTrayCard(null);
    setPlayedWordIds([]);
    setCardSavedByTeam({});
    setRescuingSlotIdx(null);
    sound.playBGM();
    setScreen('setup');
  };

  // Render Helpers
  const activeTeam = teams[currentTeamIdx];
  const turnPointsEarned = slots.reduce((acc, card) => {
    if (card && cardStatus[card.id] === 'saved') {
      return acc + card.points;
    }
    return acc;
  }, 0);

  return (
    <div className="screen-body">
      {/* Conditionally render header based on screen */}
      {screen === 'title' && (
        <div className="top-bar" style={{ padding: '4px 6px' }}>
          <button className="sound-toggle" onClick={toggleMuted} title={muted ? 'Activar sonido' : 'Silenciar'}>
            <SoundIcon muted={muted} />
          </button>
          
          <button 
            className="fullscreen-btn" 
            onClick={toggleFullscreen}
            style={{
              background: '#FFFFFF',
              border: '3.5px solid #000000',
              borderRadius: '20px',
              padding: '4px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '2px 2px 0px #000000',
              cursor: 'pointer'
            }}
          >
            <WindowIcon />
            <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#000000', fontFamily: 'Fredoka' }}>{isFullscreen ? 'Ventana' : 'Completa'}</span>
          </button>
          
          <button className="sound-toggle" onClick={() => setShowInstructions(true)} title="Instrucciones">
            <QuestionIcon />
          </button>
        </div>
      )}

      {/* A. TITLE SCREEN */}
      {screen === 'title' && (
        <div className="screen-layout screen-pop-elastic" style={{ justifyContent: 'space-between', padding: '10px 0 5px 0' }}>
          <div style={{ marginTop: '20px', width: '100%', flexShrink: 0 }}>
            <div className="hanging-sign-container">
              <div className="rope-nail"></div>
              <div className="rope-diagonal left-diag"></div>
              <div className="rope-diagonal right-diag"></div>
              <div className="rope left-rope"></div>
              <div className="rope right-rope"></div>
              <div className="wooden-board">
                <div className="board-line board-line-1"></div>
                <div className="board-line board-line-2"></div>
                <div className="hanger-hole left-hole"></div>
                <div className="hanger-hole right-hole"></div>
                
                <div className="sign-text-container">
                  <span className="sign-title-top">GESTO</span>
                  <div className="sign-title-bottom-row">
                    <span className="sign-title-bottom">RUSH</span>
                    <BlueMaskIcon />
                  </div>
                </div>
                
                <SparkIcon style={{ top: '-10px', left: '15%', transform: 'rotate(-15deg)' }} />
                <SparkIcon style={{ top: '35px', left: '8%', transform: 'rotate(20deg) scale(0.8)' }} />
                <SparkIcon style={{ top: '10px', right: '12%', transform: 'rotate(15deg)' }} />
                <SparkIcon style={{ bottom: '20px', right: '15%', transform: 'rotate(-10deg) scale(0.9)' }} />
              </div>
            </div>
          </div>
          
          <div style={{ flex: 1 }}></div>

          <button 
            className="cartoon-btn" 
            style={{ 
              padding: '16px 20px', 
              fontSize: '1.8rem', 
              background: 'var(--accent-yellow)', 
              width: '100%',
              borderWidth: '5px',
              borderRadius: '16px',
              boxShadow: '0 6px 0px #000'
            }}
            onClick={startSetup}
          >
            ¡JUGAR! 🚀
          </button>
        </div>
      )}

      {/* Header for Setup screen */}
      {screen === 'setup' && (
        <div className="top-bar" style={{ padding: '4px 6px' }}>
          <button className="sound-toggle" onClick={toggleMuted} title={muted ? 'Activar sonido' : 'Silenciar'}>
            <SoundIcon muted={muted} />
          </button>
          
          {/* Top-center Ventana capsule */}
          <button 
            className="fullscreen-btn" 
            onClick={toggleFullscreen}
            style={{
              background: '#FFFFFF',
              border: '3.5px solid #000000',
              borderRadius: '20px',
              padding: '4px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '2px 2px 0px #000000',
              cursor: 'pointer'
            }}
          >
            <WindowIcon />
            <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#000000', fontFamily: 'Fredoka' }}>{isFullscreen ? 'Ventana' : 'Completa'}</span>
          </button>
          
          <button className="sound-toggle" onClick={() => setShowInstructions(true)} title="Instrucciones">
            <QuestionIcon />
          </button>
        </div>
      )}

      {/* B. SETUP SCREEN */}
      {screen === 'setup' && (
        <div className="screen-layout screen-pop-elastic setup-screen-layout" style={{ justifyContent: 'space-between', paddingBottom: '5px' }}>
          {/* Header capsule */}
          <div 
            style={{ 
              background: '#FFFFFF', 
              border: '4.5px solid #000000', 
              borderRadius: '25px', 
              textAlign: 'center', 
              padding: '6px 16px', 
              marginBottom: '12px',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 900, letterSpacing: '-0.5px' }}>Configurar Partida</h2>
          </div>

          {/* Main config card */}
          <div 
            className="cartoon-card" 
            style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              minHeight: 0, 
              padding: '14px 18px', 
              marginBottom: '12px',
              borderWidth: '5px',
              borderColor: '#000000',
              boxShadow: 'none',
              borderRadius: '24px'
            }}
          >
            <div className="setup-grid-layout" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Left Column (Teams and Rounds) */}
              <div className="setup-column-left" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 900 }}>Equipos</h3>
                  {teams.length < 8 && (
                    <button 
                      className="cartoon-btn" 
                      style={{ 
                        padding: '4px 10px', 
                        fontSize: '0.8rem', 
                        background: 'var(--card-easy)', 
                        borderWidth: '3px',
                        boxShadow: '2px 2px 0px #000'
                      }}
                      onClick={addTeam}
                    >
                      + Añadir
                    </button>
                  )}
                </div>
                
                <div className="setup-teams-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {teams.map((team, idx) => (
                    <div key={team.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {/* Solid color circle dot */}
                      <span 
                        style={{ 
                          display: 'inline-block', 
                          width: '18px', 
                          height: '18px', 
                          borderRadius: '50%', 
                          backgroundColor: team.color, 
                          border: '3.5px solid #000000', 
                          flexShrink: 0 
                        }}
                      ></span>
                      <input
                        type="text"
                        className="cartoon-input"
                        value={team.name}
                        onChange={(e) => setTeams(prev => {
                          const n = [...prev];
                          const match = n.find(t => t.id === team.id);
                          if (match) match.name = e.target.value;
                          return n;
                        })}
                        placeholder={`Nombre del Equipo ${idx + 1}`}
                        style={{ 
                          flex: 1, 
                          padding: '6px 12px', 
                          fontSize: '0.9rem', 
                          borderWidth: '3.5px',
                          borderRadius: '16px',
                          fontWeight: 900
                        }}
                      />
                      {teams.length > 2 && (
                        <button
                          className="cartoon-btn"
                          style={{ 
                            padding: '6px 10px', 
                            fontSize: '0.8rem', 
                            background: '#EF4444', 
                            color: 'white', 
                            borderWidth: '3px', 
                            borderRadius: '12px', 
                            flexShrink: 0,
                            boxShadow: '2px 2px 0px #000'
                          }}
                          onClick={() => removeTeam(team.id)}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                  <label style={{ fontWeight: 900, fontSize: '0.95rem' }}>Rondas:</label>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <select 
                      className="cartoon-input" 
                      value={rounds} 
                      onChange={(e) => setRounds(Number(e.target.value))}
                      style={{ 
                        width: '75px', 
                        padding: '4px 24px 4px 10px', 
                        fontSize: '0.9rem', 
                        borderWidth: '3.5px',
                        borderRadius: '14px',
                        fontWeight: 900,
                        appearance: 'none'
                      }}
                    >
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                      <option value={5}>5</option>
                      <option value={7}>7</option>
                    </select>
                    {/* Downward Chevron indicator */}
                    <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontWeight: 900, fontSize: '0.8rem' }}>▼</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                  <label style={{ fontWeight: 900, fontSize: '0.95rem' }}>Modo de Juego:</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      type="button"
                      className={`cartoon-btn`}
                      style={{ 
                        flex: 1, 
                        padding: '8px 12px', 
                        fontSize: '0.85rem', 
                        background: gameMode === 'classic' ? 'var(--accent-yellow)' : '#FFFFFF',
                        borderColor: gameMode === 'classic' ? '#000000' : '#888888',
                        color: gameMode === 'classic' ? '#000000' : '#666666',
                        borderWidth: '3.5px',
                        boxShadow: gameMode === 'classic' ? '0px 3px 0px #000000' : '0px 3px 0px #888888',
                        borderRadius: '14px'
                      }}
                      onClick={() => { sound.playSave(); setGameMode('classic'); }}
                    >
                      <span style={{ marginRight: '4px' }}>👥</span> Tradicional
                    </button>
                    <button 
                      type="button"
                      className={`cartoon-btn`}
                      style={{ 
                        flex: 1, 
                        padding: '8px 12px', 
                        fontSize: '0.85rem', 
                        background: gameMode === 'all-vs-all' ? 'var(--accent-yellow)' : '#FFFFFF',
                        borderColor: gameMode === 'all-vs-all' ? '#000000' : '#888888',
                        color: gameMode === 'all-vs-all' ? '#000000' : '#666666',
                        borderWidth: '3.5px',
                        boxShadow: gameMode === 'all-vs-all' ? '0px 3px 0px #000000' : '0px 3px 0px #888888',
                        borderRadius: '14px'
                      }}
                      onClick={() => { sound.playSave(); setGameMode('all-vs-all'); }}
                    >
                      <span style={{ marginRight: '4px' }}>👑</span> Todos vs Todos
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column (Custom Words) */}
              <div className="setup-column-right" style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '2px dashed #000000', paddingTop: '10px' }}>
                <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 900 }}>📝 Palabras Custom</h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="cartoon-input"
                    value={customWordsInput}
                    onChange={(e) => setCustomWordsInput(e.target.value)}
                    placeholder="ej: Batman, Comer limón"
                    style={{ 
                      padding: '6px 12px', 
                      fontSize: '0.85rem',
                      borderWidth: '3.5px',
                      borderRadius: '16px',
                      fontWeight: 900
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomWords()}
                  />
                  <button 
                    className="cartoon-btn" 
                    style={{ 
                      padding: '8px 16px', 
                      fontSize: '0.85rem', 
                      background: 'var(--accent-yellow)',
                      borderWidth: '3.5px',
                      borderRadius: '14px',
                      boxShadow: '0 3px 0px #000'
                    }} 
                    onClick={handleAddCustomWords}
                  >
                    Añadir
                  </button>
                </div>
                
                <div className="setup-custom-words-bag" style={{ minHeight: '30px', maxHeight: '80px', overflowY: 'auto' }}>
                  {customWordPool.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {customWordPool.map((word, idx) => (
                        <span 
                          key={idx} 
                          style={{ 
                            fontSize: '0.75rem', 
                            background: '#FFFFFF', 
                            border: '2px solid #000000', 
                            padding: '2px 8px', 
                            borderRadius: '10px', 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '4px',
                            fontWeight: 900
                          }}
                        >
                          {word}
                          <button 
                            style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', color: 'red', padding: 0, fontSize: '0.85rem' }}
                            onClick={() => setCustomWordPool(prev => prev.filter((_, i) => i !== idx))}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.85rem', opacity: 0.5, fontStyle: 'italic', paddingLeft: '4px' }}>Ninguna palabra añadida</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button 
            className="cartoon-btn" 
            style={{ 
              width: '100%', 
              padding: '14px 20px', 
              fontSize: '1.5rem', 
              background: 'var(--accent-yellow)',
              borderWidth: '5px',
              borderRadius: '16px',
              boxShadow: '0 6px 0px #000'
            }} 
            onClick={() => { sound.playSave(); setScreen('turn-intro'); }}
          >
            Continuar ➡️
          </button>
        </div>
      )}

      {/* C. TURN INTRO SCREEN */}
      {screen === 'turn-intro' && (
        <div className="screen-layout screen-slide-right" style={{ justifyContent: 'center', gap: '16px' }}>
          <div className="cartoon-card" style={{ backgroundColor: activeTeam.color, color: '#1E1E24', textAlign: 'center', padding: '24px 12px' }}>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>RONDA {currentRound} DE {rounds}</h2>
            <h1 style={{ fontSize: '2.1rem', margin: '10px 0', textShadow: '2px 2px 0px #fff' }}>¡Turno de {activeTeam.name}!</h1>
            <p style={{ fontWeight: 700, margin: 0 }}>Marcador: {activeTeam.score} pts</p>
          </div>

          <div className="cartoon-card">
            <h3 style={{ fontSize: '1.05rem', marginBottom: '8px' }}>Ingresar Actor</h3>
            <p style={{ fontSize: '0.85rem', marginBottom: '8px' }}>¿Quién representará la mímica en esta ronda?</p>
            <input
              type="text"
              className="cartoon-input"
              value={actorName}
              onChange={(e) => setActorName(e.target.value)}
              placeholder="Nombre del Actor"
            />
          </div>

          <button className="cartoon-btn" style={{ width: '100%' }} onClick={startTurnSelection}>
            Elegir Tarjetas 🃏
          </button>
        </div>
      )}

      {/* Header for Card Selection screen */}
      {screen === 'card-selection' && (
        <div className="top-bar" style={{ padding: '4px 6px' }}>
          <button className="sound-toggle" onClick={resetGame} title="Ajustes / Reiniciar">
            <SettingsIcon />
          </button>
          
          {/* Top-center Gesto Rush Title Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none', transform: 'rotate(-2deg)' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FFFFFF', WebkitTextStroke: '1.5px #000', textShadow: '1.5px 1.5px 0 #000', lineHeight: 0.8 }}>Gestos</span>
            <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#459CFF', WebkitTextStroke: '1.5px #000', textShadow: '1.5px 1.5px 0 #000', lineHeight: 0.8 }}>Rush</span>
          </div>
          
          <button className="sound-toggle" onClick={() => setShowInstructions(true)} title="Instrucciones">
            <QuestionIcon />
          </button>
        </div>
      )}

      {/* D1. CARD SELECTION SCREEN */}
      {screen === 'card-selection' && (
        <div className="screen-layout screen-slide-bottom card-selection-screen-layout" style={{ justifyContent: 'space-between', paddingBottom: '5px' }}>
          {/* Slots display */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 0, margin: '10px 0' }}>
            <div className="chosen-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', width: '100%' }}>
              {[0, 1, 2, 3].map((idx) => {
                const card = chosenCards[idx];
                return (
                  <div 
                    key={idx}
                    style={{
                      height: '110px',
                      border: card ? '3.5px solid #000000' : '3px dashed #B0B0B0',
                      borderRadius: '16px',
                      background: card ? (card.difficulty === 'Fácil' ? 'var(--card-easy)' : card.difficulty === 'Medio' ? 'var(--card-medium)' : 'var(--card-hard)') : '#EAEAE6',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#000000',
                      padding: '8px 4px',
                      textAlign: 'center',
                      boxShadow: card ? '0px 4px 0px #000000' : 'none',
                      boxSizing: 'border-box',
                      width: '100%',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {card ? (
                      <>
                        <div style={{ 
                          width: '100%', 
                          height: '10px', 
                          background: 'repeating-linear-gradient(-45deg, #fff, #fff 4px, #000 4px, #000 8px)',
                          borderBottom: '2px solid #000',
                          marginBottom: '4px'
                        }}></div>
                        <span style={{ 
                          fontSize: getCardFontSize(card.word, true), 
                          fontWeight: 900, 
                          color: '#000000', 
                          background: '#FFFFFF', 
                          border: '2px solid #000000', 
                          borderRadius: '8px', 
                          padding: '4px 2px', 
                          width: '100%', 
                          boxSizing: 'border-box',
                          lineHeight: '1.1',
                          wordBreak: 'break-word',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexGrow: 1
                        }}>
                          {card.word}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#FFFFFF', textShadow: '1px 1px 0px #000', marginTop: '2px' }}>
                          +{card.points} pts
                        </span>
                      </>
                    ) : (
                      <span style={{ fontSize: '0.85rem', opacity: 0.6, fontWeight: 900, color: '#666666', lineHeight: '1.2' }}>
                        Ranura {idx + 1}<br/>(Vacía)
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3 Decks (Mazos) to click and draw from */}
          <div 
            className="decks-container" 
            style={{ 
              pointerEvents: chosenCards.length >= 4 ? 'none' : 'auto', 
              opacity: chosenCards.length >= 4 ? 0.6 : 1,
              display: 'flex',
              gap: '10px',
              padding: '10px',
              background: 'none',
              border: 'none',
              marginBottom: '10px'
            }}
          >
            {/* EASY DECK */}
            <div 
              className="deck-pile"
              style={{
                background: 'var(--card-easy)',
                border: '4px solid #000000',
                borderRadius: '16px',
                boxShadow: '0 5px 0px #000000',
                height: '110px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              onClick={() => selectCardFromDeck('Fácil')}
            >
              <span style={{ fontSize: '1.8rem', marginBottom: '2px' }}>👍</span>
              <p style={{ margin: 0, color: '#FFFFFF', fontWeight: 900, fontSize: '1.1rem', textShadow: '1.5px 1.5px 0 #000' }}>FÁCIL</p>
              <span style={{ color: '#FFFFFF', fontSize: '0.8rem', fontWeight: 900, textShadow: '1px 1px 0 #000' }}>(1 punto)</span>
            </div>
            
            {/* MEDIUM DECK */}
            <div 
              className="deck-pile"
              style={{
                background: 'var(--card-medium)',
                border: '4px solid #000000',
                borderRadius: '16px',
                boxShadow: '0 5px 0px #000000',
                height: '110px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              onClick={() => selectCardFromDeck('Medio')}
            >
              <span style={{ fontSize: '1.8rem', marginBottom: '2px' }}>💪</span>
              <p style={{ margin: 0, color: '#FFFFFF', fontWeight: 900, fontSize: '1.1rem', textShadow: '1.5px 1.5px 0 #000' }}>MEDIO</p>
              <span style={{ color: '#FFFFFF', fontSize: '0.8rem', fontWeight: 900, textShadow: '1px 1px 0 #000' }}>(2 puntos)</span>
            </div>

            {/* HARD DECK */}
            <div 
              className="deck-pile"
              style={{
                background: 'var(--card-hard)',
                border: '4px solid #000000',
                borderRadius: '16px',
                boxShadow: '0 5px 0px #000000',
                height: '110px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              onClick={() => selectCardFromDeck('Difícil')}
            >
              <span style={{ fontSize: '1.8rem', marginBottom: '2px' }}>🎭</span>
              <p style={{ margin: 0, color: '#FFFFFF', fontWeight: 900, fontSize: '1.1rem', textShadow: '1.5px 1.5px 0 #000' }}>DIFÍCIL</p>
              <span style={{ color: '#FFFFFF', fontSize: '0.8rem', fontWeight: 900, textShadow: '1px 1px 0 #000' }}>(3 puntos)</span>
            </div>
          </div>

          <button 
            className={`cartoon-btn ${chosenCards.length < 4 ? 'disabled' : ''}`}
            style={{ 
              width: '100%', 
              background: '#4BB75C',
              borderWidth: '5px',
              borderRadius: '16px',
              boxShadow: '0 6px 0px #000',
              padding: '14px 20px',
              fontSize: '1.5rem',
              color: '#FFFFFF',
              textShadow: '2px 2px 0px #000'
            }}
            disabled={chosenCards.length < 4}
            onClick={() => {
              sound.playSave();
              setPlayedWordIds(prev => [...prev, ...chosenCards.map(c => c.id)]);
              setScreen('preparation');
            }}
          >
            Acomodar Tarjetas ➡️
          </button>
        </div>
      )}

      {/* D2. PREPARATION / ARRANGE SCREEN */}
      {screen === 'preparation' && (
        <div className="screen-layout screen-slide-right preparation-screen-layout">
          {/* Header */}
          <div className="cartoon-card" style={{ padding: '8px 12px', marginBottom: '6px', textAlign: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem' }}>🧩 Acomoda las cartas en la Claqueta</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#555' }}>
              Arrastra o haz clic en las cartas de abajo para posicionarlas en las ranuras.
            </p>
          </div>

          {/* Claqueta with Slots */}
          <div className="claqueta-container">
            <div className="claqueta-board">
              <div className="claqueta-arm-hinge snapped">
                <div className="claqueta-arm-stripes"></div>
              </div>

              {/* Target slots for cards */}
              <div className="claqueta-slots-wrapper">
                {slots.map((slotCard, idx) => {
                  const isSelected = selectedSlotIdx === idx;
                  return (
                    <div
                      key={idx}
                      className={`claqueta-slot-target ${isSelected ? 'selected' : ''}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleSlotDrop(e, idx)}
                      onClick={() => handleSlotClick(idx)}
                      data-slot-idx={idx}
                    >
                      {slotCard ? (
                        <div 
                          className="card-standing" 
                          draggable
                          onDragStart={(e) => handleSlotDragStart(e, idx)}
                          onTouchStart={(e) => handleTouchStart(e, slotCard, idx)}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={handleTouchEnd}
                          style={{
                            backgroundColor: slotCard.difficulty === 'Fácil' ? 'var(--card-easy)' : slotCard.difficulty === 'Medio' ? 'var(--card-medium)' : 'var(--card-hard)',
                            color: 'white',
                            opacity: activeTouch?.card.id === slotCard.id ? 0.35 : 1,
                            touchAction: 'none'
                          }}
                        >
                          <button 
                            onClick={(e) => discardSlotCard(e, idx)}
                            style={{
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              background: '#EF4444',
                              color: 'white',
                              border: '2px solid #111',
                              borderRadius: '50%',
                              width: '18px',
                              height: '18px',
                              fontSize: '9px',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              zIndex: 12
                            }}
                          >
                            ×
                          </button>
                          <div className="card-title-header"></div>
                          <span className="card-word" style={{ fontSize: getCardFontSize(slotCard.word) }}>{slotCard.word}</span>
                          <span className="card-points">+{slotCard.points} pts</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.7rem', opacity: 0.6, textAlign: 'center', pointerEvents: 'none', padding: '0 4px', bottom: '40px', position: 'absolute' }}>
                          Ranura {idx + 1}<br/>(Vacía)
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Blue front plate of the clapper box */}
              <div className="claqueta-front-box">
                <h2 className="claqueta-title-text" style={{ fontSize: '2.5rem' }}>Gesto Rush</h2>
              </div>
            </div>
          </div>

          {/* Cards Tray (Source) at bottom */}
          <div className="cartoon-card" style={{ padding: '6px', marginBottom: '6px' }}>
            <h4 style={{ margin: '0 0 4px 4px', fontSize: '0.85rem' }}>Tus 4 cartas:</h4>
            <div style={{ display: 'flex', gap: '6px', minHeight: '60px', overflowX: 'auto', padding: '2px' }}>
              {chosenCards
                .filter(card => !slots.some(slot => slot?.id === card.id))
                .map(card => {
                  const isSelected = selectedTrayCard?.id === card.id;
                  return (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={() => handleTrayDragStart(card)}
                      onClick={() => handleTrayCardClick(card)}
                      onTouchStart={(e) => handleTouchStart(e, card, null)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      style={{
                        flex: '0 0 80px',
                        height: '55px',
                        border: isSelected ? '3px solid var(--accent-yellow)' : '2px solid var(--color-dark)',
                        borderRadius: '8px',
                        background: card.difficulty === 'Fácil' ? 'var(--card-easy)' : card.difficulty === 'Medio' ? 'var(--card-medium)' : 'var(--card-hard)',
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        boxShadow: '1.5px 1.5px 0 var(--color-dark)',
                        cursor: 'grab',
                        padding: '2px',
                        opacity: activeTouch?.card.id === card.id ? 0.35 : 1,
                        touchAction: 'none'
                      }}
                    >
                      <span style={{ 
                        background: '#fff', 
                        color: '#111', 
                        fontSize: getCardFontSize(card.word, true), 
                        border: '1px solid #111', 
                        padding: '2px 4px', 
                        borderRadius: '4px', 
                        width: '100%', 
                        boxSizing: 'border-box',
                        lineHeight: '1.15',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        whiteSpace: 'normal',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        textAlign: 'center'
                      }}>
                        {card.word}
                      </span>
                    </div>
                  );
                })}
              {chosenCards.filter(card => !slots.some(slot => slot?.id === card.id)).length === 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#22C55E', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  ✓ ¡Todas acomodadas!
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button className="cartoon-btn" style={{ background: '#E5E7EB', flex: 1, padding: '8px' }} onClick={() => setScreen('card-selection')}>
              Atrás
            </button>
            <button 
              className={`cartoon-btn ${slots.some(s => s === null) ? 'disabled' : ''}`}
              style={{ background: '#22C55E', flex: 2, padding: '8px' }}
              onClick={startActionPhase}
              disabled={slots.some(s => s === null)}
            >
              ¡ACCION! 🎬
            </button>
          </div>
        </div>
      )}

      {/* E. ACTIVE GAME SCREEN */}
      {screen === 'action' && (
        <div 
          className="screen-layout screen-pop-elastic action-screen-layout"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 100,
            background: '#FAF6EE',
            backgroundImage: 'radial-gradient(#D3D3D3 10%, transparent 10%)',
            backgroundSize: '16px 16px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box'
          }}
        >
          {/* Red header bar spanning entire width */}
          <div 
            style={{ 
              background: '#E53B3B', 
              color: '#FFFFFF', 
              textAlign: 'center', 
              padding: '10px', 
              margin: '-12px -12px 10px -12px',
              borderBottom: '4px solid #000000',
              fontWeight: 900,
              fontSize: '1.25rem',
              letterSpacing: '0.5px'
            }}
          >
            Mímica: {actorName}
          </div>

          {/* Action Claqueta */}
          <div className="claqueta-container" style={{ flex: 1, margin: '10px 0' }}>
            <div className="claqueta-board" style={{ maxWidth: '420px', height: '260px' }}>
              <div className={`claqueta-arm-hinge ${claquetaOpen ? 'open' : 'snapped'}`}>
                <div className="claqueta-arm-stripes"></div>
              </div>

              {/* Target slots containing active/sinking/saved cards */}
              <div className="claqueta-slots-wrapper">
                {slots.map((card, idx) => {
                  if (!card) return <div key={idx} className="claqueta-slot-target"></div>;
                  
                  const status = cardStatus[card.id];
                  let cardClass = 'card-standing';
                  if (status === 'saved') cardClass += ' saved';
                  if (status === 'sunk') cardClass += ' sunk';

                  // Timer calculations for this slot
                  const limit = 15 * (idx + 1);
                  const elapsed = 60 - turnTimeLeft;
                  const timeLeftForSlot = Math.max(0, limit - elapsed);
                  const percentage = status === 'active' ? (timeLeftForSlot / 15) * 100 : 0;

                  return (
                    <div key={card.id} className="claqueta-slot-target" style={{ overflow: 'visible' }}>
                      <div
                        className={cardClass}
                        style={{
                          backgroundColor: '#FFFFFF',
                          color: '#000000',
                          border: '3.5px solid #000000',
                          boxShadow: '0 -4px 0px #000000',
                          cursor: status === 'active' ? 'pointer' : 'default',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          padding: '6px 4px',
                          borderRadius: '12px'
                        }}
                        onClick={() => {
                          if (status !== 'active') return;
                          if (gameMode === 'all-vs-all') {
                            setRescuingSlotIdx(idx);
                          } else {
                            rescueCard(idx);
                          }
                        }}
                      >
                        {/* Film clapper stripe on top of card */}
                        <div style={{ 
                          width: '100%', 
                          height: '8px', 
                          background: 'repeating-linear-gradient(-45deg, #fff, #fff 4px, #000 4px, #000 8px)',
                          borderBottom: '2.5px solid #000',
                          marginBottom: '4px'
                        }}></div>

                        {revealToActor ? (
                          <span 
                            style={{ 
                              fontSize: getCardFontSize(card.word, true), 
                              fontWeight: 900, 
                              color: '#000000',
                              lineHeight: '1.1',
                              flexGrow: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              wordBreak: 'break-word',
                              padding: '2px'
                            }}
                          >
                            {card.word}
                          </span>
                        ) : (
                          <span style={{ fontSize: '2rem', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>❓</span>
                        )}
                        <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#000000', marginTop: '2px' }}>+{card.points} pts</span>
                      </div>
                      
                      {gameMode === 'all-vs-all' && status === 'active' && rescuingSlotIdx === idx && (
                        <div className="team-rescue-overlay">
                          <div className="team-buttons-grid">
                            {teams.map(t => (
                              <button 
                                key={t.id} 
                                className="team-rescue-btn" 
                                style={{ backgroundColor: t.color }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  rescueCard(idx, t.id);
                                  setRescuingSlotIdx(null);
                                }}
                                title={t.name}
                              >
                                {t.name.substring(0, 2).toUpperCase()}
                              </button>
                            ))}
                          </div>
                          <button className="cancel-rescue-btn" onClick={(e) => { e.stopPropagation(); setRescuingSlotIdx(null); }}>✕</button>
                        </div>
                      )}
                      
                      {/* Individual slot timer bar */}
                      {status === 'active' && (
                        <div 
                          className="slot-timer-bar" 
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: percentage < 30 ? '#E53B3B' : '#4BB75C' 
                          }}
                        ></div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Black clapperboard box front plate */}
              <div className="claqueta-front-box" style={{ background: '#000000', border: '5px solid #000000', borderRadius: '0 0 20px 20px', boxShadow: 'none' }}>
                {/* No text inside clapper box to follow user design */}
              </div>
            </div>
          </div>

          {/* Bottom control bar styled exactly like Image 4 */}
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              background: '#1A1A1A', 
              borderRadius: '35px', 
              padding: '8px 16px',
              border: '4px solid #000000',
              boxSizing: 'border-box',
              width: '100%',
              marginBottom: '10px'
            }}
          >
            {/* Left: timer inside white circle */}
            <div 
              style={{ 
                background: '#FFFFFF', 
                borderRadius: '50%', 
                width: '50px', 
                height: '50px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '3.5px solid #000000',
                fontWeight: 900,
                fontSize: '1.25rem',
                color: '#000000',
                flexShrink: 0
              }}
            >
              {turnTimeLeft}s
            </div>
            
            {/* Center status */}
            <span style={{ color: '#FFFFFF', fontWeight: 900, fontSize: '1.15rem' }}>
              Salvadas: {slots.filter(c => c && cardStatus[c.id] === 'saved').length}/4
            </span>
            
            {/* Right Terminar button */}
            <button 
              className="cartoon-btn" 
              style={{ 
                background: '#E53B3B', 
                color: '#FFFFFF', 
                padding: '6px 14px', 
                fontSize: '0.85rem', 
                borderWidth: '3.5px',
                borderRadius: '20px',
                boxShadow: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                margin: 0
              }}
              onClick={() => endTurn(cardStatus, false)}
            >
              <span>Terminar Turno</span>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* F. TURN SUMMARY SCREEN */}
      {/* F. TURN SUMMARY SCREEN */}
      {screen === 'summary' && (
        <div className="screen-layout screen-pop-elastic" style={{ justifyContent: 'space-between', paddingBottom: '5px' }}>
          {/* Header block with massive score text */}
          <div style={{ textAlign: 'center', margin: '20px 0 10px 0', position: 'relative' }}>
            <h1 
              style={{ 
                fontSize: '4.5rem', 
                margin: 0, 
                color: '#E53B3B', 
                WebkitTextStroke: '3px #000000',
                textShadow: '0 8px 0px rgba(0,0,0,0.15)',
                fontWeight: 900,
                lineHeight: 1
              }}
            >
              +{turnPointsEarned} pts
            </h1>
            <p style={{ fontWeight: 900, fontSize: '1.25rem', color: '#000000', margin: '6px 0 0 0' }}>
              ¡Buen esfuerzo de {actorName}!
            </p>
            
            {/* Top-right mini clapperboard graphic */}
            <MiniClapperboard />
          </div>

          {/* Results summary (scrollable list of cards) */}
          <div 
            className="cartoon-card" 
            style={{ 
              flex: 1, 
              overflowY: 'auto', 
              margin: '10px 0', 
              padding: '12px',
              borderWidth: '4px',
              borderRadius: '20px',
              boxShadow: 'none'
            }}
          >
            <h4 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', fontWeight: 900 }}>Resultados:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {slots.map((card, idx) => {
                if (!card) return null;
                const status = cardStatus[card.id];
                const isSaved = status === 'saved';
                return (
                  <div 
                    key={card.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 12px', 
                      border: '3px solid #000000', 
                      borderRadius: '12px', 
                      fontSize: '0.85rem',
                      fontWeight: 900,
                      background: isSaved ? '#E2F7E4' : '#FDE8E8' 
                    }}
                  >
                    <span>R{idx + 1}: <strong>{card.word}</strong></span>
                    <span style={{ color: isSaved ? '#4BB75C' : '#E53B3B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {isSaved ? (
                        gameMode === 'all-vs-all' ? (
                          `Adivinada por ${teams.find(t => t.id === cardSavedByTeam[card.id])?.name || 'Equipo'} (+${card.points}) ✅`
                        ) : (
                          `Salvada (+${card.points}) ✅`
                        )
                      ) : (
                        <>Hundida (0) ❌</>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team score cards with offset background shadows */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', margin: '10px 0 20px 0' }}>
            {teams.slice(0, 2).map(t => (
              <div key={t.id} style={{ position: 'relative', height: '100px' }}>
                {/* Shadow card offset background */}
                <div 
                  style={{ 
                    position: 'absolute', 
                    top: '6px', 
                    left: '6px', 
                    right: '-6px', 
                    bottom: '-6px', 
                    background: t.color, 
                    border: '4.5px solid #000000', 
                    borderRadius: '20px',
                    zIndex: 1
                  }}
                ></div>
                
                {/* Main card foreground */}
                <div 
                  style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    background: '#FFFFFF', 
                    border: '4.5px solid #000000', 
                    borderRadius: '20px',
                    padding: '10px 6px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    zIndex: 2,
                    boxSizing: 'border-box'
                  }}
                >
                  {/* Circular profile dot */}
                  <div 
                    style={{ 
                      width: '28px', 
                      height: '28px', 
                      borderRadius: '50%', 
                      backgroundColor: t.color, 
                      border: '3px solid #000000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#FFFFFF" strokeWidth="3">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  
                  <span style={{ fontWeight: 900, fontSize: '0.85rem', color: '#000000', textAlign: 'center' }}>
                    {t.name}
                  </span>
                  
                  <span style={{ fontWeight: 900, fontSize: '1.15rem', color: t.color, textShadow: '1px 1px 0px #000000' }}>
                    {t.score} pts
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button 
            className="cartoon-btn" 
            style={{ 
              background: 'var(--accent-yellow)', 
              width: '100%',
              padding: '14px 20px',
              fontSize: '1.5rem',
              borderWidth: '5px',
              borderRadius: '16px',
              boxShadow: '0 6px 0px #000',
              fontWeight: 900
            }} 
            onClick={nextTurn}
          >
            Siguiente Ronda ➔
          </button>
        </div>
      )}

      {/* G. GAME OVER SCREEN */}
      {screen === 'game-over' && (
        <div className="screen-layout screen-pop-elastic" style={{ justifyContent: 'center', gap: '16px' }}>
          <div className="cartoon-card animate-float" style={{ textAlign: 'center', background: 'var(--accent-yellow)', padding: '24px 12px' }}>
            <h1 className="game-title" style={{ fontSize: '2rem', margin: '0 0 10px 0' }}>🏆 ¡FIN DE JUEGO! 🏆</h1>
            
            {(() => {
              const sorted = [...teams].sort((a, b) => b.score - a.score);
              const winner = sorted[0];
              const isTie = sorted[1] && sorted[0].score === sorted[1].score;

              return (
                <div style={{ margin: '12px 0' }}>
                  {isTie ? (
                    <h2 style={{ fontSize: '1.6rem', margin: 0 }}>¡Empate de Leyendas! 🤝</h2>
                  ) : (
                    <>
                      <h2 style={{ fontSize: '1.5rem', margin: 0 }}>¡Ganador: {winner.name}! 🎉</h2>
                      <div style={{ fontSize: '3.5rem', marginTop: '6px' }}>👑</div>
                    </>
                  )}
                </div>
              );
            })()}
          </div>

          <div className="cartoon-card">
            <h3 style={{ fontSize: '1.05rem', marginBottom: '8px' }}>Resultados Finales</h3>
            <div className="score-board-compact">
              {teams.map(t => (
                <div key={t.id} className="team-score-row-compact" style={{ borderColor: t.color }}>
                  <span>{t.name}</span>
                  <span style={{ background: t.color, color: 'white', border: '2px solid #111', padding: '1px 8px', borderRadius: '6px' }}>{t.score} pts</span>
                </div>
              ))}
            </div>
          </div>

          <button className="cartoon-btn" style={{ background: 'var(--card-easy)' }} onClick={resetGame}>
            ¡Volver a Jugar! 🔄
          </button>
        </div>
      )}

      {/* Instructions Modal Overlay */}
      {showInstructions && (
        <div className="modal-overlay" onClick={() => setShowInstructions(false)}>
          <div className="modal-content animate-pop" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ textAlign: 'center', fontSize: '1.5rem', margin: '0 0 12px 0' }}>🎭 Cómo Jugar</h2>
            <div className="instruction-list">
              <div className="instruction-step">
                <span className="step-num">1</span>
                <p>Arma tus equipos, selecciona las rondas y añade palabras personalizadas.</p>
              </div>
              <div className="instruction-step">
                <span className="step-num">2</span>
                <p>**Fase 1: Elegir Cartas**: Toca los mazos Fácil, Medio y Difícil para obtener 4 cartas. La carta que sale es final.</p>
              </div>
              <div className="instruction-step">
                <span className="step-num">3</span>
                <p>**Fase 2: Acomodar Cartas**: Arrastra o selecciona tus 4 cartas para ponerlas en las ranuras. Arrastra una carta sobre otra para intercambiar posiciones.</p>
              </div>
              <div className="instruction-step">
                <span className="step-num">4</span>
                <p>**Fase 3: ¡Acción!**: El actor actúa. Cuando adivinen, toca la carta para salvarla. Las cartas se hunden solas cada 15 segundos.</p>
              </div>
              <div className="instruction-step">
                <span className="step-num">5</span>
                <p>Al agotarse el tiempo general, la claqueta se cerrará y sonará un timbre Switch.</p>
              </div>
            </div>
            <button className="cartoon-btn" style={{ width: '100%', marginTop: '14px', padding: '8px' }} onClick={() => setShowInstructions(false)}>
              ¡Entendido! 🎮
            </button>
          </div>
        </div>
      )}

      {/* Global Touch Drag Preview to prevent z-index / stacking context issues */}
      {activeTouch && (
        <div
          style={{
            position: 'fixed',
            left: `${activeTouch.currentX - 40}px`,
            top: `${activeTouch.currentY - (activeTouch.sourceSlotIdx !== null ? 70 : 27)}px`,
            width: '80px',
            height: activeTouch.sourceSlotIdx !== null ? '120px' : '55px',
            border: '3px solid var(--accent-yellow)',
            borderRadius: activeTouch.sourceSlotIdx !== null ? '10px' : '8px',
            background: activeTouch.card.difficulty === 'Fácil' ? 'var(--card-easy)' : activeTouch.card.difficulty === 'Medio' ? 'var(--card-medium)' : 'var(--card-hard)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '4px 4px 0 var(--color-dark)',
            pointerEvents: 'none',
            zIndex: 99999,
            transform: 'scale(1.15)',
            padding: '6px 4px',
            boxSizing: 'border-box'
          }}
        >
          {activeTouch.sourceSlotIdx !== null && <div className="card-title-header" style={{ width: '100%', height: '10px', marginBottom: '4px' }}></div>}
          <span style={{ 
            background: '#fff', 
            color: '#111', 
            fontSize: getCardFontSize(activeTouch.card.word, activeTouch.sourceSlotIdx === null), 
            border: '1.5px solid #111', 
            padding: '2px 4px', 
            borderRadius: '6px', 
            width: '100%', 
            boxSizing: 'border-box',
            lineHeight: '1.15',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            whiteSpace: 'normal',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexGrow: 1,
            textAlign: 'center'
          }}>
            {activeTouch.card.word}
          </span>
          {activeTouch.sourceSlotIdx !== null && <span className="card-points" style={{ fontSize: '0.75rem', fontWeight: 900, marginTop: '4px' }}>+{activeTouch.card.points} pts</span>}
        </div>
      )}
    </div>
  );
}

export default App;
