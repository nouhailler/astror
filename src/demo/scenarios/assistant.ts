// Visite guidée de l'assistant IA. Démontre la saisie (sans envoyer : aucun réseau).
import type { Scenario } from '../types'

const assistant: Scenario = {
  name: 'assistant',
  label: 'Assistant IA',
  description: 'Suggestions par thème et saisie libre d’une question.',
  steps: [
    { type: 'navigate', to: 'ai',
      narrate: 'L’assistant Astror : expert en astronomie, il connaît votre position et votre matériel.' },
    { type: 'highlight', target: 'ai-suggestions', label: 'Suggestions',
      narrate: 'Des questions prêtes à l’emploi, classées en onze thèmes.' },
    { type: 'highlight', target: 'ai-input', label: 'Votre question',
      narrate: 'Ou posez librement votre propre question.' },
    { type: 'type', target: 'ai-input', text: 'Que puis-je observer ce soir avec des jumelles ?',
      narrate: 'On la saisit…' },
    { type: 'narrate', title: 'Assistant IA',
      text: 'Entrée pour envoyer (une clé API OpenRouter ou Anthropic est requise). ✕ ou Échap pour quitter.' },
  ],
}

export default assistant
