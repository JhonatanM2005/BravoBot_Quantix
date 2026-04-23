import { useState, useCallback } from 'react'

export interface WizardOption {
  icon: string
  label: string
  value: string
}

export interface WizardStepDef {
  key: 'area' | 'level' | 'modality' | 'availability'
  question: string
  options: WizardOption[]
}

export interface WizardAnswers {
  area?: string
  level?: string
  modality?: string
  availability?: string
}

export type WizardStep = 0 | 1 | 2 | 3 | 4

export const WIZARD_STEPS: WizardStepDef[] = [
  {
    key: 'area',
    question: '**Paso 1 de 4** — ¿En qué área te imaginas trabajando en el futuro?',
    options: [
      { icon: '💻', label: 'Tecnología e Ingeniería', value: 'Tecnología e Ingeniería' },
      { icon: '🎨', label: 'Arte y Diseño', value: 'Arte y Diseño' },
      { icon: '💼', label: 'Negocios y Administración', value: 'Negocios y Administración' },
      { icon: '🔬', label: 'Ciencias aplicadas', value: 'Ciencias aplicadas' },
      { icon: '✏️', label: 'No estoy seguro/a', value: 'No estoy seguro/a' },
    ],
  },
  {
    key: 'level',
    question: '**Paso 2 de 4** — ¿Qué nivel de estudio estás buscando?',
    options: [
      { icon: '📚', label: 'Técnico (1–2 años)', value: 'Técnico' },
      { icon: '🏫', label: 'Tecnológico (3 años)', value: 'Tecnológico' },
      { icon: '🎓', label: 'Profesional / Pregrado', value: 'Profesional' },
      { icon: '🏅', label: 'Posgrado', value: 'Posgrado' },
    ],
  },
  {
    key: 'modality',
    question: '**Paso 3 de 4** — ¿Qué modalidad de estudio prefieres?',
    options: [
      { icon: '🏢', label: 'Presencial', value: 'Presencial' },
      { icon: '💻', label: 'Virtual', value: 'Virtual' },
      { icon: '🔄', label: 'Sin preferencia', value: 'Sin preferencia' },
    ],
  },
  {
    key: 'availability',
    question: '**Paso 4 de 4** — ¿Cuál es tu disponibilidad horaria?',
    options: [
      { icon: '☀️', label: 'Jornada diurna (tiempo completo)', value: 'Jornada diurna' },
      { icon: '🌙', label: 'Nocturno / fines de semana', value: 'Nocturno o fines de semana' },
      { icon: '❓', label: 'Flexible / No lo sé aún', value: 'Flexible' },
    ],
  },
]

/** Construye la query enriquecida a enviar al endpoint /chat */
export function buildWizardQuery(answers: WizardAnswers): string {
  return (
    `Soy aspirante a la I.U. Pascual Bravo y necesito orientación personalizada para elegir un programa. ` +
    `Mis preferencias son: área de interés: ${answers.area ?? 'no especificada'}, ` +
    `nivel de estudio buscado: ${answers.level ?? 'no especificado'}, ` +
    `modalidad preferida: ${answers.modality ?? 'sin preferencia'}, ` +
    `disponibilidad horaria: ${answers.availability ?? 'flexible'}. ` +
    `¿Qué programas académicos de la institución me recomiendas y por qué se ajustan a mi perfil?`
  )
}

/** Patrones en español que indican que el usuario quiere orientación para elegir carrera */
export const WIZARD_TRIGGER_PATTERNS: RegExp[] = [
  /no\s+s[eé]\s+qu[eé]\s+estudiar/i,
  /qu[eé]\s+(?:debería\s+)?estudiar/i,
  /ay[uú]dame?\s+(?:a\s+)?elegir/i,
  /ay[uú]dame?\s+(?:a\s+)?escoger/i,
  /recomi[eé]nd[ae]me\s+(?:una?\s+)?carrera/i,
  /qu[eé]\s+carrera\s+(?:me\s+)?recomi/i,
  /no\s+s[eé]\s+qu[eé]\s+carrera/i,
  /cu[aá]l\s+(?:es\s+la\s+)?carrera\s+(?:para\s+m[ií]|me\s+conviene)/i,
  /orientaci[oó]n\s+(?:vocacional|para\s+elegir)/i,
  /elegir\s+(?:mi\s+)?carrera/i,
  /escoger\s+(?:mi\s+)?carrera/i,
  /qu[eé]\s+programa\s+(?:me\s+)?conviene/i,
]

export function useWizard() {
  const [step, setStep] = useState<WizardStep>(0)
  const [answers, setAnswers] = useState<WizardAnswers>({})

  const isActive = step > 0

  const startWizard = useCallback(() => {
    setStep(1)
    setAnswers({})
  }, [])

  /**
   * Guarda la respuesta del paso actual y avanza.
   * Retorna el nuevo step y los nuevos answers sincrónicamente para que
   * el llamador pueda actuar sin esperar el re-render de React.
   */
  const answerStep = useCallback(
    (value: string): { nextStep: WizardStep; nextAnswers: WizardAnswers } => {
      const stepDef = WIZARD_STEPS[step - 1]
      const nextAnswers: WizardAnswers = stepDef
        ? { ...answers, [stepDef.key]: value }
        : { ...answers }
      const nextStep: WizardStep = step >= 4 ? 0 : ((step + 1) as WizardStep)
      setAnswers(nextAnswers)
      setStep(nextStep)
      return { nextStep, nextAnswers }
    },
    [step, answers],
  )

  const resetWizard = useCallback(() => {
    setStep(0)
    setAnswers({})
  }, [])

  return {
    step,
    answers,
    isActive,
    startWizard,
    answerStep,
    resetWizard,
  }
}
