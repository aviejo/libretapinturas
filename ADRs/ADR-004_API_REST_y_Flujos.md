# ADR-004: API REST y flujos de usuario



## Contexto

La aplicación es una SPA en React que se comunica con un backend Node.js.
El backend expone una API que debe:
- Permitir operaciones CRUD sobre pinturas
- Soportar importación y exportación de la libreta
- Integrar generación de mezclas mediante IA
- Garantizar aislamiento de datos entre usuarios
- Mantener simplicidad y claridad en los endpoints

Se descarta GraphQL y otros enfoques más complejos por no aportar ventajas claras en este dominio.

## Decisión

Se adopta una API REST clásica, con endpoints explícitos y recursos bien definidos.
- Comunicación mediante JSON
- Autenticación basada en token
- Backend como único punto de acceso a datos e IA
- El frontend no accede directamente a la base de datos ni a la IA

## Convenciones generales

- Prefijo común: /api
- Todas las rutas requieren autenticación (excepto login/registro)
- El user_id se obtiene del contexto de sesión, nunca del payload
- Respuestas claras y predecibles

## Endpoints principales
### Autenticación (resumen)
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me

El detalle de implementación puede delegarse a un proveedor externo, pero el backend controla el contexto del usuario.

### Pinturas (Paint)
#### Listar pinturas
`GET /api/paints`

- Query params opcionales
    - search → nombre o referencia
    - brand
    - is_mix=true|false
    - in_stock=true|false

#### Obtener una pintura
`GET /api/paints/:id`

#### Crear pintura

`POST /api/paints`

``` JSON
{
  "brand": "Vallejo",
  "reference": "70.830",
  "name": "German Field Grey",
  "is_mix": false,
  "color": "#5b5f4a",
  "notes": "",
  "in_stock": true
}
``` 

#### Modificar pintura
`PUT /api/paints/:id`

#### Eliminar pintura
`DELETE /api/paints/:id`

### Generación de mezclas con IA
#### Proponer mezcla
`POST /api/mixes/generate`

Payload
``` JSON
{
  "target_brand": "Vallejo Model Color",
  "target_reference": "70.830",
  "target_name": "German Field Grey"
}
```

Respuesta del backend (desde IA)
``` JSON
{
  "suggested_paint": {
    "brand": "Custom Mix",
    "reference": "MIX-001",
    "name": "German Field Grey (Mix)",
    "is_mix": true,
    "recipe": {
      "components": [
        { "paint_name": "German Grey", "drops": 6 },
        { "paint_name": "Green Grey", "drops": 3 },
        { "paint_name": "Black", "drops": 1 }
      ],
      "notes": "Ajustar según escala"
    },
    "ai_metadata": {
      "provider": "gemini",
      "model": "gemini-pro"
    }
  }
}
```

Importante, La mezcla NO se guarda automáticamente.
- El frontend debe permitir:
    - revisar
    - editar
    - confirmar
    - guardar

#### Guardar mezcla confirmada

Se usa el endpoint estándar:

`POST /api/paints`

Con is_mix = true y recipe_json.

### Importación de libreta

#### Importar JSON
`POST /api/import`

- Validación de esquema
- Preview opcional
- Inserción transaccional

#### Exportación de libreta

Exportar todo
`GET /api/export`

Devuelve JSON compatible con el contrato definido en ADR-003.

## Flujos de usuario
1️⃣ Alta manual de pintura
1.- Usuario abre formulario
2.- Introduce datos
3.- POST /api/paints
4.- Refresco de listado

2️⃣ Generar mezcla con IA
1.- Usuario abre formulario de mezcla
2.- Introduce pintura objetivo
3.- POST /api/mixes/generate
4.- Visualiza receta
5.- Edita si es necesario
6.- Guarda como pintura (is_mix = true)

3️⃣ Búsqueda y filtrado
1.- Usuario escribe o filtra
2.- GET /api/paints con query params
3.- Renderizado inmediato

4️⃣ Importación / Exportación
- Exportación: descarga directa
- Importación: subida + validación + confirmación

## Justificación
- REST es ampliamente conocido
- Fácil de depurar
- Encaja con CRUD y flujos simples
- Permite evolución futura sin romper contratos

## Consecuencias
- Positivas
    - API clara y mantenible
    - Separación frontend/backend limpia
    - IA desacoplada
    - Fácil documentación

- Negativas
    - Más endpoints que una solución monolítica
    - Necesidad de versionado futuro