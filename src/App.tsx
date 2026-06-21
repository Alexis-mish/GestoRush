import { useState, useEffect, useRef } from 'react';
import type { WordCard } from './utils/words';
import { getRandomWords } from './utils/words';
import { sound } from './utils/sound';

type Screen = 'title' | 'setup' | 'turn-intro' | 'card-selection' | 'preparation' | 'action' | 'summary' | 'game-over';

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

    const randomWords = getRandomWords(1, difficulty);
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
  const rescueCard = (slotIdx: number) => {
    const card = slots[slotIdx];
    if (!card) return;
    if (cardStatus[card.id] !== 'active') return;

    sound.playSave();
    setCardStatus(prev => ({
      ...prev,
      [card.id]: 'saved'
    }));

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

    let turnPoints = 0;
    slots.forEach(card => {
      if (card && finalStatus[card.id] === 'saved') {
        turnPoints += card.points;
      }
    });

    setTeams(prev => {
      const next = [...prev];
      next[currentTeamIdx].score += turnPoints;
      return next;
    });

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
      {/* Top HUD bar */}
      <div className="top-bar">
        <button className="sound-toggle" onClick={toggleMuted} title={muted ? 'Activar sonido' : 'Silenciar'}>
          {muted ? '🔈' : '🔊'}
        </button>
        <button className="fullscreen-btn" onClick={toggleFullscreen}>
          {isFullscreen ? '📴 Ventana' : '📺 Completa'}
        </button>
        <button className="sound-toggle" onClick={() => setShowInstructions(true)} title="Instrucciones">
          ❓
        </button>
      </div>

      {/* A. TITLE SCREEN */}
      {screen === 'title' && (
        <div className="screen-layout screen-pop-elastic" style={{ justifyContent: 'space-between', padding: '15px 0 5px 0' }}>
          <div style={{ marginTop: '35px', width: '100%', flexShrink: 0 }}>
            <div className="hanging-sign-container">
              <div className="rope left-rope"></div>
              <div className="rope right-rope"></div>
              <div className="wooden-board">
                <div className="board-line board-line-1"></div>
                <div className="board-line board-line-2"></div>
                <div className="hanger-hole left-hole"></div>
                <div className="hanger-hole right-hole"></div>
                
                <span className="sign-icon left-icon">👋</span>
                
                <div className="sign-text-container">
                  <span className="sign-title-top">GESTO</span>
                  <span className="sign-title-bottom">RUSH</span>
                </div>
                
                <span className="sign-icon right-icon">🎭</span>
                
                <span className="sign-star star-1">★</span>
                <span className="sign-star star-2">★</span>
                <span className="sign-star star-3">★</span>
                <span className="sign-star star-4">★</span>
              </div>
            </div>
          </div>

          <div className="cartoon-card" style={{ padding: '12px', textAlign: 'center', margin: '15px 0' }}>
            <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#6b6375', margin: 0 }}>
              El clásico juego de mímica a toda velocidad. ¡Elige tus cartas, ordénalas en la claqueta y adivina antes de que sea tarde!
            </p>
          </div>
          
          <button 
            className="cartoon-btn" 
            style={{ padding: '14px', fontSize: '1.5rem', background: 'var(--accent-yellow)', width: '100%' }}
            onClick={startSetup}
          >
            ¡JUGAR! 🚀
          </button>
        </div>
      )}

      {/* B. SETUP SCREEN */}
      {screen === 'setup' && (
        <div className="screen-layout screen-pop-elastic setup-screen-layout">
          <div className="cartoon-card" style={{ textAlign: 'center', padding: '10px', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '1.3rem', margin: 0 }}>Configurar Partida ⚙️</h2>
          </div>

          <div className="cartoon-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, padding: '10px 14px', marginBottom: '8px' }}>
            <div className="setup-grid-layout">
              {/* Left Column */}
              <div className="setup-column-left">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '1rem', margin: 0 }}>Equipos</h3>
                  {teams.length < 8 && (
                    <button 
                      className="cartoon-btn" 
                      style={{ padding: '3px 8px', fontSize: '0.75rem', background: 'var(--card-easy)' }}
                      onClick={addTeam}
                    >
                      + Añadir
                    </button>
                  )}
                </div>
                
                <div className="setup-teams-list">
                  {teams.map((team, idx) => (
                    <div key={team.id} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ display: 'inline-block', width: '14px', height: '14px', borderRadius: '50%', backgroundColor: team.color, border: '2px solid #111', flexShrink: 0 }}></span>
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
                        style={{ flex: 1, padding: '4px 8px', fontSize: '0.85rem' }}
                      />
                      {teams.length > 2 && (
                        <button
                          className="cartoon-btn"
                          style={{ padding: '4px 8px', fontSize: '0.75rem', background: '#EF4444', color: 'white', border: '2px solid #111', borderRadius: '6px', flexShrink: 0 }}
                          onClick={() => removeTeam(team.id)}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <label style={{ fontWeight: 700, fontSize: '0.85rem' }}>Rondas:</label>
                  <select 
                    className="cartoon-input" 
                    value={rounds} 
                    onChange={(e) => setRounds(Number(e.target.value))}
                    style={{ width: '65px', padding: '2px 4px', fontSize: '0.85rem' }}
                  >
                    <option value={3}>3</option>
                    <option value={4}/><option value={4}>4</option>
                    <option value={5}>5</option>
                    <option value={7}>7</option>
                  </select>
                </div>
              </div>

              {/* Right Column */}
              <div className="setup-column-right">
                <h3 style={{ fontSize: '1rem', margin: '0 0 4px 0' }}>📝 Palabras Custom</h3>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                  <input
                    type="text"
                    className="cartoon-input"
                    value={customWordsInput}
                    onChange={(e) => setCustomWordsInput(e.target.value)}
                    placeholder="ej: Batman, Comer limón"
                    style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomWords()}
                  />
                  <button className="cartoon-btn" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={handleAddCustomWords}>Añadir</button>
                </div>
                
                <div className="setup-custom-words-bag">
                  {customWordPool.length > 0 ? (
                    customWordPool.map((word, idx) => (
                      <span 
                        key={idx} 
                        style={{ fontSize: '0.7rem', background: '#fff', border: '1.5px solid #111', padding: '1px 5px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '2px' }}
                      >
                        {word}
                        <button 
                          style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', color: 'red', padding: 0 }}
                          onClick={() => setCustomWordPool(prev => prev.filter((_, i) => i !== idx))}
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.75rem', opacity: 0.5, fontStyle: 'italic', padding: '4px' }}>Ninguna palabra añadida</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button className="cartoon-btn" style={{ width: '100%', marginTop: '4px' }} onClick={() => { sound.playSave(); setScreen('turn-intro'); }}>
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

      {/* D1. CARD SELECTION SCREEN */}
      {screen === 'card-selection' && (
        <div className="screen-layout screen-slide-bottom card-selection-screen-layout">
          <div className="cartoon-card" style={{ padding: '8px 12px', marginBottom: '8px', textAlign: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem' }}>🃏 {actorName}, Elige tus 4 cartas</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#555' }}>
              Toca los mazos de abajo. Las cartas que te salgan son las que jugarás (¡no se pueden cambiar!).
            </p>
          </div>

          {/* Chosen Cards Display Tray */}
          <div className="cartoon-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 0 }}>
            <h4 style={{ textAlign: 'center', fontSize: '0.95rem', margin: '0 0 10px 0' }}>
              Elegidas: {chosenCards.length}/4
            </h4>
            <div className="chosen-cards-grid">
              {[0, 1, 2, 3].map((idx) => {
                const card = chosenCards[idx];
                return (
                  <div 
                    key={idx}
                    style={{
                      height: '90px',
                      border: '3px solid var(--color-dark)',
                      borderRadius: '12px',
                      background: card ? (card.difficulty === 'Fácil' ? 'var(--card-easy)' : card.difficulty === 'Medio' ? 'var(--card-medium)' : 'var(--card-hard)') : 'rgba(0,0,0,0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: card ? 'white' : 'var(--color-dark)',
                      padding: '6px',
                      textAlign: 'center',
                      boxShadow: card ? '2px 2px 0 var(--color-dark)' : 'none',
                      borderStyle: card ? 'solid' : 'dashed',
                      boxSizing: 'border-box',
                      width: '100%',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {card ? (
                      <>
                        <span style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', background: '#fff', color: '#111', padding: '1px 4px', borderRadius: '4px', border: '1px solid #111', marginBottom: '4px' }}>
                          {card.difficulty}
                        </span>
                        <span style={{ 
                          fontSize: getCardFontSize(card.word, true), 
                          fontWeight: 'bold', 
                          color: '#111', 
                          background: '#fff', 
                          border: '1.5px solid #111', 
                          borderRadius: '6px', 
                          padding: '4px', 
                          width: '100%', 
                          boxSizing: 'border-box',
                          lineHeight: '1.15',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal',
                          maxHeight: '52px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                          flexGrow: 1
                        }}>
                          {card.word}
                        </span>
                      </>
                    ) : (
                      <span style={{ fontSize: '0.8rem', opacity: 0.5, fontStyle: 'italic' }}>Ranura {idx + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3 Decks (Mazos) to click and draw from */}
          <div className="decks-container" style={{ pointerEvents: chosenCards.length >= 4 ? 'none' : 'auto', opacity: chosenCards.length >= 4 ? 0.6 : 1 }}>
            <div 
              className="deck-pile Fácil"
              onClick={() => selectCardFromDeck('Fácil')}
            >
              <p className="deck-title">Fácil</p>
              <span className="deck-subtitle">1 punto</span>
            </div>
            
            <div 
              className="deck-pile Medio"
              onClick={() => selectCardFromDeck('Medio')}
            >
              <p className="deck-title">Medio</p>
              <span className="deck-subtitle">2 puntos</span>
            </div>

            <div 
              className="deck-pile Difícil"
              onClick={() => selectCardFromDeck('Difícil')}
            >
              <p className="deck-title">Difícil</p>
              <span className="deck-subtitle">3 puntos</span>
            </div>

            {/* Custom Deck if custom words pool is not empty */}
            {customWordPool.length > 0 && (
              <div 
                className="deck-pile"
                style={{ backgroundColor: 'var(--accent-purple)' }}
                onClick={() => selectCardFromDeck('Personalizada')}
              >
                <p className="deck-title" style={{ fontSize: '0.8rem' }}>Custom</p>
                <span className="deck-subtitle">2 puntos</span>
              </div>
            )}
          </div>

          {/* Action button */}
          <button 
            className={`cartoon-btn ${chosenCards.length < 4 ? 'disabled' : ''}`}
            style={{ width: '100%', background: '#22C55E' }}
            disabled={chosenCards.length < 4}
            onClick={() => { sound.playSave(); setScreen('preparation'); }}
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
        <div className="screen-layout screen-pop-elastic action-screen-layout">
          {/* Header & Mask Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexShrink: 0 }}>
            <div className="cartoon-card" style={{ padding: '6px 12px', margin: 0, background: activeTeam.color, flex: 1 }}>
              <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Mímica: {actorName}</span>
            </div>
            
            <button 
              className="cartoon-btn" 
              style={{ padding: '6px 10px', fontSize: '0.8rem', marginLeft: '8px' }}
              onClick={() => setRevealToActor(!revealToActor)}
            >
              {revealToActor ? '🙈 Ocultar a Equipo' : '👁️ Mostrar Cartas'}
            </button>
          </div>

          {/* Action Claqueta */}
          <div className="claqueta-container">
            <div className="claqueta-board">
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
                  if (card.difficulty) cardClass += ` ${card.difficulty}`;

                  // Timer calculations for this slot
                  const limit = 15 * (idx + 1);
                  const elapsed = 60 - turnTimeLeft;
                  const timeLeftForSlot = Math.max(0, limit - elapsed);
                  const percentage = status === 'active' ? (timeLeftForSlot / 15) * 100 : 0;

                  return (
                    <div key={card.id} className="claqueta-slot-target">
                      <div
                        className={cardClass}
                        onClick={() => rescueCard(idx)}
                      >
                        <div className="card-title-header"></div>
                        {revealToActor ? (
                           <span className="card-word" style={{ fontSize: getCardFontSize(card.word) }}>{card.word}</span>
                        ) : (
                          <span className="card-word" style={{ fontSize: '2.5rem' }}>❓</span>
                        )}
                        <span className="card-points">+{card.points} pts</span>
                      </div>
                      
                      {/* Individual slot timer bar */}
                      {status === 'active' && (
                        <div 
                          className="slot-timer-bar" 
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: percentage < 30 ? 'var(--card-hard)' : 'var(--card-easy)' 
                          }}
                        ></div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Blue front plate of clapper box */}
              <div className="claqueta-front-box">
                <h2 className="claqueta-title-text" style={{ fontSize: '2.5rem' }}>Gesto Rush</h2>
              </div>
            </div>
          </div>

          {/* Master HUD & Alarm */}
          <div className="claqueta-hud">
            <span className={`hud-timer-display ${turnTimeLeft <= 10 ? 'warning' : ''}`}>🕒 {turnTimeLeft}s</span>
            <span className="hud-points-display" style={{ color: 'var(--card-easy)' }}>
              Salvadas: {slots.filter(c => c && cardStatus[c.id] === 'saved').length}/4
            </span>
          </div>

          <div className="cartoon-card" style={{ padding: '8px 12px', textAlign: 'center', marginTop: '8px', marginBottom: '8px' }}>
            <p style={{ fontSize: '0.8rem', margin: 0, fontWeight: 600 }}>
              {revealToActor ? '👇 Haz clic en la carta cuando tu equipo la adivine para salvarla' : '⚠️ Gira la pantalla hacia el actor para ver las palabras'}
            </p>
          </div>

          <button className="cartoon-btn" style={{ background: '#EF4444', padding: '10px' }} onClick={() => endTurn(cardStatus, false)}>
            Terminar Turno Prontamente 🛑
          </button>
        </div>
      )}

      {/* F. TURN SUMMARY SCREEN */}
      {screen === 'summary' && (
        <div className="screen-layout screen-pop-elastic">
          <div className="cartoon-card" style={{ textAlign: 'center', margin: '8px 0' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Turno de {activeTeam.name} 🎬</h2>
            <h1 style={{ fontSize: '3rem', margin: '4px 0', color: turnPointsEarned > 0 ? 'var(--card-easy)' : 'var(--card-hard)' }}>
              +{turnPointsEarned} pts
            </h1>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>¡Buen esfuerzo de {actorName}!</p>
          </div>

          {/* Slots results summary */}
          <div className="cartoon-card" style={{ flex: 1, overflowY: 'auto', margin: '4px 0', padding: '10px' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem' }}>Resultados:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                      padding: '6px 10px', 
                      border: '2px solid #111', 
                      borderRadius: '8px', 
                      fontSize: '0.85rem',
                      background: isSaved ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)' 
                    }}
                  >
                    <span>R{idx + 1}: <strong>{card.word}</strong></span>
                    <span style={{ fontWeight: 'bold' }}>
                      {isSaved ? `Salvada (+${card.points}) ✅` : 'Hundida (0) ❌'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Marcador general */}
          <div className="cartoon-card" style={{ margin: '8px 0', padding: '10px' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem' }}>Marcador General</h4>
            <div className="score-board-compact">
              {teams.map(t => (
                <div key={t.id} className="team-score-row-compact" style={{ borderColor: t.color }}>
                  <span>{t.name}</span>
                  <span style={{ background: t.color, color: 'white', border: '2px solid #111', padding: '1px 8px', borderRadius: '6px', fontSize: '1rem' }}>{t.score} pts</span>
                </div>
              ))}
            </div>
          </div>

          <button className="cartoon-btn animate-float" style={{ background: 'var(--accent-yellow)', width: '100%' }} onClick={nextTurn}>
            Continuar Juego ➡️
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
