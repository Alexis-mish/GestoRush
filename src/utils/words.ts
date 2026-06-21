export interface WordCard {
  id: string;
  word: string;
  difficulty: 'Fácil' | 'Medio' | 'Difícil';
  points: number;
  category: string;
}

export const WORD_DATABASE: WordCard[] = [
  // ==================== FÁCIL (1 punto) ====================
  // Acciones
  { id: 'f1', word: 'Dormir', difficulty: 'Fácil', points: 1, category: 'Acciones' },
  { id: 'f2', word: 'Llorar', difficulty: 'Fácil', points: 1, category: 'Acciones' },
  { id: 'f3', word: 'Bailar', difficulty: 'Fácil', points: 1, category: 'Acciones' },
  { id: 'f4', word: 'Comer', difficulty: 'Fácil', points: 1, category: 'Acciones' },
  { id: 'f5', word: 'Cepillarse los dientes', difficulty: 'Fácil', points: 1, category: 'Acciones' },
  { id: 'f6', word: 'Cantar', difficulty: 'Fácil', points: 1, category: 'Acciones' },
  { id: 'f7', word: 'Correr', difficulty: 'Fácil', points: 1, category: 'Acciones' },
  { id: 'f8', word: 'Manejar un auto', difficulty: 'Fácil', points: 1, category: 'Acciones' },
  { id: 'f9', word: 'Escribir', difficulty: 'Fácil', points: 1, category: 'Acciones' },
  { id: 'f10', word: 'Aplaudir', difficulty: 'Fácil', points: 1, category: 'Acciones' },
  { id: 'f11', word: 'Cocinar', difficulty: 'Fácil', points: 1, category: 'Acciones' },
  { id: 'f12', word: 'Pintar una pared', difficulty: 'Fácil', points: 1, category: 'Acciones' },
  { id: 'f13', word: 'Lanzar un beso', difficulty: 'Fácil', points: 1, category: 'Acciones' },
  { id: 'f14', word: 'Saludar', difficulty: 'Fácil', points: 1, category: 'Acciones' },
  { id: 'f15', word: 'Lavar platos', difficulty: 'Fácil', points: 1, category: 'Acciones' },
  
  // Animales
  { id: 'f16', word: 'Gato', difficulty: 'Fácil', points: 1, category: 'Animales' },
  { id: 'f17', word: 'Perro', difficulty: 'Fácil', points: 1, category: 'Animales' },
  { id: 'f18', word: 'Mono', difficulty: 'Fácil', points: 1, category: 'Animales' },
  { id: 'f19', word: 'Serpiente', difficulty: 'Fácil', points: 1, category: 'Animales' },
  { id: 'f20', word: 'Pájaro volando', difficulty: 'Fácil', points: 1, category: 'Animales' },
  { id: 'f21', word: 'Conejo', difficulty: 'Fácil', points: 1, category: 'Animales' },
  { id: 'f22', word: 'Pez nadando', difficulty: 'Fácil', points: 1, category: 'Animales' },
  { id: 'f23', word: 'Rana saltando', difficulty: 'Fácil', points: 1, category: 'Animales' },

  // Objetos y cotidianidad
  { id: 'f24', word: 'Guitarra', difficulty: 'Fácil', points: 1, category: 'Objetos' },
  { id: 'f25', word: 'Teléfono celular', difficulty: 'Fácil', points: 1, category: 'Objetos' },
  { id: 'f26', word: 'Tijeras', difficulty: 'Fácil', points: 1, category: 'Objetos' },
  { id: 'f27', word: 'Sombrero', difficulty: 'Fácil', points: 1, category: 'Objetos' },
  { id: 'f28', word: 'Lentes / Anteojos', difficulty: 'Fácil', points: 1, category: 'Objetos' },
  { id: 'f29', word: 'Taza de café', difficulty: 'Fácil', points: 1, category: 'Objetos' },

  // Cultura Pop Básica
  { id: 'f30', word: 'Batman', difficulty: 'Fácil', points: 1, category: 'Cultura Pop' },
  { id: 'f31', word: 'Spider-Man lanzando telaraña', difficulty: 'Fácil', points: 1, category: 'Cultura Pop' },
  { id: 'f32', word: 'Superman volando', difficulty: 'Fácil', points: 1, category: 'Cultura Pop' },
  { id: 'f33', word: 'Zombi caminando', difficulty: 'Fácil', points: 1, category: 'Cultura Pop' },
  { id: 'f34', word: 'Boxeador peleando', difficulty: 'Fácil', points: 1, category: 'Deportes' },
  { id: 'f35', word: 'Bebé llorón', difficulty: 'Fácil', points: 1, category: 'Acciones' },

  // ==================== MEDIO (2 puntos) ====================
  // Acciones y Profesiones
  { id: 'm1', word: 'Peluquero', difficulty: 'Medio', points: 2, category: 'Profesiones' },
  { id: 'm2', word: 'Fotógrafo', difficulty: 'Medio', points: 2, category: 'Profesiones' },
  { id: 'm3', word: 'Pescar', difficulty: 'Medio', points: 2, category: 'Acciones' },
  { id: 'm4', word: 'Planchar', difficulty: 'Medio', points: 2, category: 'Acciones' },
  { id: 'm5', word: 'Caminar en la luna', difficulty: 'Medio', points: 2, category: 'Acciones' },
  { id: 'm6', word: 'Jugar tenis', difficulty: 'Medio', points: 2, category: 'Acciones' },
  { id: 'm7', word: 'Inflar un globo', difficulty: 'Medio', points: 2, category: 'Acciones' },
  { id: 'm8', word: 'Montar a caballo', difficulty: 'Medio', points: 2, category: 'Acciones' },
  { id: 'm9', word: 'Coser', difficulty: 'Medio', points: 2, category: 'Acciones' },
  { id: 'm10', word: 'Médico', difficulty: 'Medio', points: 2, category: 'Profesiones' },
  { id: 'm11', word: 'Bombero', difficulty: 'Medio', points: 2, category: 'Profesiones' },
  { id: 'm12', word: 'Policía', difficulty: 'Medio', points: 2, category: 'Profesiones' },
  { id: 'm13', word: 'Mesero', difficulty: 'Medio', points: 2, category: 'Profesiones' },
  { id: 'm14', word: 'Esquiar', difficulty: 'Medio', points: 2, category: 'Acciones' },
  { id: 'm15', word: 'Tocar el piano', difficulty: 'Medio', points: 2, category: 'Acciones' },
  { id: 'm16', word: 'Mimo', difficulty: 'Medio', points: 2, category: 'Profesiones' },
  { id: 'm17', word: 'Levantamiento de pesas', difficulty: 'Medio', points: 2, category: 'Deportes' },
  { id: 'm18', word: 'Patinar sobre hielo', difficulty: 'Medio', points: 2, category: 'Deportes' },
  { id: 'm19', word: 'Pintar un cuadro', difficulty: 'Medio', points: 2, category: 'Acciones' },
  { id: 'm20', word: 'Pasear al perro', difficulty: 'Medio', points: 2, category: 'Acciones' },
  
  // Animales
  { id: 'm21', word: 'Canguro', difficulty: 'Medio', points: 2, category: 'Animales' },
  { id: 'm22', word: 'Elefante', difficulty: 'Medio', points: 2, category: 'Animales' },
  { id: 'm23', word: 'Pingüino', difficulty: 'Medio', points: 2, category: 'Animales' },
  { id: 'm24', word: 'Tigre', difficulty: 'Medio', points: 2, category: 'Animales' },
  { id: 'm25', word: 'Gorila', difficulty: 'Medio', points: 2, category: 'Animales' },
  { id: 'm26', word: 'Cangrejo', difficulty: 'Medio', points: 2, category: 'Animales' },
  { id: 'm27', word: 'León', difficulty: 'Medio', points: 2, category: 'Animales' },
  { id: 'm28', word: 'Tiburón', difficulty: 'Medio', points: 2, category: 'Animales' },
  
  // Cultura Pop y Personajes
  { id: 'm29', word: 'Michael Jackson (Moonwalk)', difficulty: 'Medio', points: 2, category: 'Cultura Pop' },
  { id: 'm30', word: 'Harry Potter', difficulty: 'Medio', points: 2, category: 'Cultura Pop' },
  { id: 'm31', word: 'Darth Vader', difficulty: 'Medio', points: 2, category: 'Cultura Pop' },
  { id: 'm32', word: 'Mario Bros', difficulty: 'Medio', points: 2, category: 'Cultura Pop' },
  { id: 'm33', word: 'Iron Man', difficulty: 'Medio', points: 2, category: 'Cultura Pop' },
  { id: 'm34', word: 'Jack Sparrow', difficulty: 'Medio', points: 2, category: 'Cultura Pop' },
  { id: 'm35', word: 'Hulk', difficulty: 'Medio', points: 2, category: 'Cultura Pop' },
  { id: 'm36', word: 'Shakira', difficulty: 'Medio', points: 2, category: 'Cultura Pop' },
  { id: 'm37', word: 'Pikachu', difficulty: 'Medio', points: 2, category: 'Cultura Pop' },
  { id: 'm38', word: 'Minion', difficulty: 'Medio', points: 2, category: 'Cultura Pop' },
  { id: 'm39', word: 'Homero Simpson', difficulty: 'Medio', points: 2, category: 'Cultura Pop' },
  { id: 'm40', word: 'El Chavo del 8', difficulty: 'Medio', points: 2, category: 'Cultura Pop' },

  // ==================== DIFÍCIL (3 puntos) ====================
  // Situaciones y Objetos Complejos
  { id: 'd1', word: 'Cirujano', difficulty: 'Difícil', points: 3, category: 'Profesiones' },
  { id: 'd2', word: 'Director de orquesta', difficulty: 'Difícil', points: 3, category: 'Profesiones' },
  { id: 'd3', word: 'Astronauta', difficulty: 'Difícil', points: 3, category: 'Profesiones' },
  { id: 'd4', word: 'Montaña rusa', difficulty: 'Difícil', points: 3, category: 'Objetos' },
  { id: 'd5', word: 'Submarino', difficulty: 'Difícil', points: 3, category: 'Objetos' },
  { id: 'd6', word: 'Lavadora sacudiéndose', difficulty: 'Difícil', points: 3, category: 'Objetos' },
  { id: 'd7', word: 'Despertador sonando', difficulty: 'Difícil', points: 3, category: 'Objetos' },
  { id: 'd8', word: 'Sonámbulo', difficulty: 'Difícil', points: 3, category: 'Acciones' },
  { id: 'd9', word: 'Caminar en la cuerda floja', difficulty: 'Difícil', points: 3, category: 'Acciones' },
  { id: 'd10', word: 'Perdido en el desierto', difficulty: 'Difícil', points: 3, category: 'Acciones' },
  { id: 'd11', word: 'Hacer malabares', difficulty: 'Difícil', points: 3, category: 'Acciones' },
  { id: 'd12', word: 'Pisar un chicle', difficulty: 'Difícil', points: 3, category: 'Acciones' },
  { id: 'd13', word: 'Estatua de la Libertad', difficulty: 'Difícil', points: 3, category: 'Cultura Pop' },
  { id: 'd14', word: 'Mimo en una caja invisible', difficulty: 'Difícil', points: 3, category: 'Profesiones' },
  { id: 'd15', word: 'Escalar una montaña', difficulty: 'Difícil', points: 3, category: 'Acciones' },
  { id: 'd16', word: 'Pintarse las uñas', difficulty: 'Difícil', points: 3, category: 'Acciones' },
  { id: 'd17', word: 'Pisar carbones calientes', difficulty: 'Difícil', points: 3, category: 'Acciones' },
  { id: 'd18', word: 'Atrapar una mosca', difficulty: 'Difícil', points: 3, category: 'Acciones' },
  { id: 'd19', word: 'Abrir un regalo', difficulty: 'Difícil', points: 3, category: 'Acciones' },
  { id: 'd20', word: 'Comer chile picante', difficulty: 'Difícil', points: 3, category: 'Acciones' },
  { id: 'd21', word: 'Comezón en la espalda', difficulty: 'Difícil', points: 3, category: 'Acciones' },
  
  // Animales Complejos
  { id: 'd22', word: 'Pavo real', difficulty: 'Difícil', points: 3, category: 'Animales' },
  { id: 'd23', word: 'Camaleón', difficulty: 'Difícil', points: 3, category: 'Animales' },
  { id: 'd24', word: 'Gato asustado erizándose', difficulty: 'Difícil', points: 3, category: 'Animales' },
  { id: 'd25', word: 'Perro persiguiéndose la cola', difficulty: 'Difícil', points: 3, category: 'Animales' },
  
  // Cultura Pop y Ficción Complejas
  { id: 'd26', word: 'Titanic (Jack y Rose)', difficulty: 'Difícil', points: 3, category: 'Cultura Pop' },
  { id: 'd27', word: 'La Mona Lisa (Gioconda)', difficulty: 'Difícil', points: 3, category: 'Cultura Pop' },
  { id: 'd28', word: 'Gollum (Señor de los Anillos)', difficulty: 'Difícil', points: 3, category: 'Cultura Pop' },
  { id: 'd29', word: 'Shrek', difficulty: 'Difícil', points: 3, category: 'Cultura Pop' },
  { id: 'd30', word: 'Terminator', difficulty: 'Difícil', points: 3, category: 'Cultura Pop' },
  { id: 'd31', word: 'El Rey León (Simba)', difficulty: 'Difícil', points: 3, category: 'Cultura Pop' },
  { id: 'd32', word: 'E.T. el Extraterrestre', difficulty: 'Difícil', points: 3, category: 'Cultura Pop' },
  { id: 'd33', word: 'Freddy Krueger', difficulty: 'Difícil', points: 3, category: 'Cultura Pop' },
  { id: 'd34', word: 'Dora la Exploradora', difficulty: 'Difícil', points: 3, category: 'Cultura Pop' },
  { id: 'd35', word: 'Wolverine (Lobezno)', difficulty: 'Difícil', points: 3, category: 'Cultura Pop' },
  { id: 'd36', word: 'Frankenstein', difficulty: 'Difícil', points: 3, category: 'Cultura Pop' },
  { id: 'd37', word: 'Hombre Lobo', difficulty: 'Difícil', points: 3, category: 'Cultura Pop' },
  { id: 'd38', word: 'Momia', difficulty: 'Difícil', points: 3, category: 'Cultura Pop' },
  { id: 'd39', word: 'Drácula', difficulty: 'Difícil', points: 3, category: 'Cultura Pop' },
  { id: 'd40', word: 'Dentista', difficulty: 'Difícil', points: 3, category: 'Profesiones' }
];

export function getRandomWords(count: number, difficulty?: 'Fácil' | 'Medio' | 'Difícil'): WordCard[] {
  let list = [...WORD_DATABASE];
  if (difficulty) {
    list = list.filter(w => w.difficulty === difficulty);
  }
  // Shuffle list
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list.slice(0, count);
}

export function generateTurnCards(): WordCard[] {
  const faciles = getRandomWords(1, 'Fácil');
  const medios = getRandomWords(2, 'Medio');
  const dificiles = getRandomWords(1, 'Difícil');
  
  const selected = [...faciles, ...medios, ...dificiles];
  return selected.sort(() => Math.random() - 0.5);
}
