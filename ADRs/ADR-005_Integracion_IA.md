# ADR-005: Integración con IA y diseño del prompt

## Contexto

La aplicación debe ofrecer al usuario la posibilidad de generar propuestas de mezclas de pinturas a partir de su propia paleta disponible, indicando:

- Marca objetivo
- Referencia o nombre de la pintura buscada

El sistema debe:

- Usar un modelo de IA generativa externo
- Producir resultados orientativos
- Entregar respuestas estructuradas
- Permitir al usuario revisar y confirmar la mezcla antes de guardarla

La IA no debe ser una fuente de verdad ni modificar datos sin intervención humana.

## Decisión

Se integra un modelo de IA generativa vía API, consumido exclusivamente desde el backend.

La IA se utilizará como sistema de recomendación asistida, con las siguientes características:

- Entrada controlada mediante prompt estructurado
- Salida obligatoriamente en JSON
- Sin persistencia automática
- Totalmente desacoplada del frontend

## Proveedor de IA
### Decisión actual

- **Proveedor primario**: Gemini API (Google) - Cloud
- **Proveedor alternativo**: LLMStudio (Local) - Sin costos, 100% privado
- Acceso: vía HTTP desde backend Node.js

### Motivos

- Disponibilidad de múltiples proveedores
- Soporte para salida estructurada en ambos
- Flexibilidad de costos (API vs Local)
- Posibilidad de sustitución futura
- La arquitectura permite cambiar de proveedor sin afectar al frontend ni al modelo de datos.
- Opción local (LLMStudio) permite uso offline y total privacidad

## Flujo de integración con IA
Usuario
  ↓
Formulario "Generar mezcla"
  ↓
Backend construye prompt
  ↓
Llamada API IA
  ↓
Validación de respuesta
  ↓
Devolver propuesta al frontend
  ↓
Usuario confirma / edita
  ↓
Guardar como pintura (mezcla)

## Diseño del prompt

El prompt se genera dinámicamente a partir de:
- Pintura objetivo
- Marca objetivo
- Paleta disponible del usuario (solo nombre + marca)
```
Prompt conceptual

Busco reproducir el color de la pintura:

Marca: {{target_brand}}
Nombre / referencia: {{target_name}}

Mi paleta disponible es la siguiente:
{{listado_pinturas_usuario}}

Indica una posible mezcla usando exclusivamente estas pinturas.
Expresa la receta en gotas.
Devuelve la respuesta únicamente en JSON siguiendo el esquema indicado.

Esquema de respuesta esperado (contrato)

``` JSON
{
  "target": {
    "brand": "Vallejo Model Color",
    "name": "German Field Grey"
  },
  "mix": {
    "components": [
      {
        "paint_name": "German Grey",
        "drops": 6
      },
      {
        "paint_name": "Green Grey",
        "drops": 3
      },
      {
        "paint_name": "Black",
        "drops": 1
      }
    ],
    "notes": "Oscurecer ligeramente para escala 28mm"
  },
  "confidence": "medium"
}
```

## Validación de la respuesta

El backend debe:

- Verificar que la respuesta es JSON válido
- Comprobar que:
    - Existen componentes
    - Las gotas son valores numéricos positivos
- Normalizar la salida si es necesario
- Rechazar respuestas no conformes

Si la validación falla:
- Se devuelve un error controlado al frontend
- No se guarda ningún dato

## Persistencia de la información de IA

Cuando el usuario guarda la mezcla:
- Se persiste:
    - La receta final (editable)
    - Metadatos básicos de IA (proveedor, modelo)

- No se persiste:
    - Tokens
    - Costes
    - Información sensible

Ejemplo:
``` JSON
{
  "provider": "gemini",
  "model": "gemini-pro",
  "generated_at": "2026-02-03"
}
``` 
## Seguridad

- La clave de la API de IA:
    - Nunca se expone al frontend
    - Se gestiona mediante variables de entorno
- Se aplican límites de uso por usuario (rate limiting)
- Se puede desactivar la funcionalidad IA sin afectar al resto del sistema

## Arquitectura del Servicio de IA

### Decision: Servicio AI Propio (Custom AI Service)

Se implementará un **servicio de abstracción propio** en lugar de usar frameworks como Genkit o Vercel AI SDK.

### Estructura Propuesta

```
services/ai/
├── ai.provider.js              # Interfaz base (abstracta)
├── ai.service.js               # Factory y orquestación
└── providers/
    ├── gemini.provider.js      # Implementación Gemini (Cloud)
    ├── llmstudio.provider.js   # Implementación LLMStudio (Local)
    └── openai.provider.js      # Implementación OpenAI (futura)
```

### Implementación Base

```javascript
// services/ai/ai.provider.js
class AIProvider {
  async generateMix(prompt, userPalette) {
    throw new Error('Must implement generateMix');
  }
  
  async validateResponse(response) {
    // Validación común de JSON
  }
}

module.exports = AIProvider;
```

```javascript
// services/ai/providers/gemini.provider.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const AIProvider = require('../ai.provider');

class GeminiProvider extends AIProvider {
  constructor() {
    super();
    this.genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  }
  
  async generateMix(prompt, userPalette) {
    const fullPrompt = this.buildPrompt(prompt, userPalette);
    const result = await this.model.generateContent(fullPrompt);
    const response = await result.response;
    return this.parseResponse(response.text());
  }
}

module.exports = GeminiProvider;
```

```javascript
// services/ai/ai.service.js
const GeminiProvider = require('./providers/gemini.provider');
const LLMStudioProvider = require('./providers/llmstudio.provider');
const OpenAIProvider = require('./providers/openai.provider');

class AIService {
  static create(providerName = process.env.AI_PROVIDER) {
    const providers = {
      gemini: GeminiProvider,
      llmstudio: LLMStudioProvider,
      openai: OpenAIProvider,
    };
    
    const Provider = providers[providerName];
    if (!Provider) {
      throw new Error(`Unknown AI provider: ${providerName}`);
    }
    
    return new Provider();
  }
}

module.exports = AIService;
```

### Por qué NO usar Genkit

**Alternativa evaluada: Google Genkit**
- **URL**: https://genkit.dev/
- **Tipo**: Framework completo para apps con IA

**Razones para rechazarlo en el MVP:**

1. **Overkill**: Genkit está diseñado para flujos complejos (RAG, agentes, evaluación, trazabilidad). Nuestro caso es simple: "prompt → JSON".

2. **Complejidad innecesaria**: Requiere aprender conceptos como "flows", "retrievers", "evaluators". Añade curva de aprendizaje sin beneficio claro.

3. **Dependencias pesadas**: ~20-30MB de dependencias adicionales.

4. **Firebase-centric**: Aunque funciona standalone, está optimizado para ecosistema Firebase.

5. **Sobredimensionamiento**: Para una única operación (generar mezcla), Genkit aporta demasiada infraestructura.

**Conclusión**: Implementación propia es más simple, mantenible y adecuada para el alcance actual.

### Cuándo considerar Genkit en el futuro

Genkit sería apropiado si la aplicación evoluciona hacia:
- Sistema RAG (búsqueda en catálogos externos de pinturas)
- Agentes multi-paso (análisis de color + generación + validación)
- Evaluación automática de calidad de mezclas
- Trackeo completo de prompts y respuestas
- Múltiples flujos de IA interconectados

## Justificación
- La IA aporta valor sin ser crítica
- El usuario mantiene siempre el control
- La salida estructurada evita ambigüedades
- El sistema es auditable y reproducible

## Consecuencias
- Positivas
    - Experiencia de usuario mejorada
    - Reutilización de la paleta existente
    - No se compromete la integridad de datos
    - Fácil sustitución del proveedor
    - Opción local (LLMStudio) elimina costos y dependencias externas
    - Posibilidad de funcionamiento 100% offline con proveedor local

- Negativas
    - Resultados no garantizados
    - Dependencia de un servicio externo (si se usa proveedor cloud)
    - Necesidad de control de costes (solo para proveedores cloud)
    - Proveedor local requiere hardware adecuado (RAM, GPU)

## Notas finales
La IA se concibe como un asistente creativo, no como un sistema determinista.
La arquitectura garantiza que los errores o limitaciones del modelo no comprometen la estabilidad ni la coherencia de la libreta.