# ADR-003 – Modelo de dominio y esquema de datos

## Contexto

La aplicación gestiona una libreta de pinturas de modelismo, donde cada usuario mantiene su propio catálogo. El dominio debe cubrir:
- Pinturas comerciales
- Pinturas que son mezclas
- Diferenciación clara entre pintura base y mezcla
- Asociación de pinturas a un usuario
- Búsqueda, filtrado e importación/exportación
- Persistencia de recetas generadas por IA

Se busca un modelo:
- Simple
- Explícito
- Fácil de consultar
- Fácil de exportar/importar
- Compatible con SQLite y migrable a otros motores SQL

## Decisión

Se adopta un modelo de dominio centrado en una única entidad principal: Paint, donde las mezclas son una pintura más, diferenciadas por un campo booleano.
Las recetas de mezcla y la información de IA se almacenan como datos estructurados (JSON) asociados a la pintura.

### Entidades principales

#### User

Representa un usuario autenticado de la aplicación.

Campo	Tipo	Descripción
id	UUID	Identificador único
email	string	Email del usuario
created_at	datetime	Fecha de alta

Nota: la autenticación podria delegarse a un proveedor externo, pero el id será la referencia interna.

####  Paint

Entidad principal del dominio.

Campo	Tipo	Descripción
id	UUID	Identificador único
user_id	UUID	Propietario de la pintura
brand	string	Marca (Vallejo, Citadel…)
reference	string	Referencia comercial
name	string	Nombre de la pintura
is_mix	boolean	Indica si es mezcla
color	string	Representación del color (hex o similar)
notes	text	Notas libres
in_stock	boolean	Disponible o no
created_at	datetime	Fecha de creación
updated_at	datetime	Última modificación

#### MixRecipe (embebido)

No se crea como tabla independiente.
Se almacena solo si is_mix = true, dentro del campo recipe.

Ejemplo conceptual:
``` JSON
{
  "components": [
    { "paint_id": "uuid-1", "drops": 6 },
    { "paint_id": "uuid-2", "drops": 3 },
    { "paint_id": "uuid-3", "drops": 1 }
  ],
  "notes": "Aclarar ligeramente para escala 28mm"
}
```

### IA Metadata (embebido)

Información relacionada con la generación de la mezcla.
```JSON
{
  "provider": "gemini",
  "model": "gemini-pro",
  "prompt": "...",
  "raw_response": { ... }
}
```
## Esquema relacional (SQLite)


users:
------
id (PK)
email
created_at

paints
------
id (PK)
user_id (FK -> users.id)
brand
reference
name
is_mix
color
notes
in_stock
recipe_json
ai_metadata_json
created_at
updated_at

recipe_json → TEXT (JSON serializado)
ai_metadata_json → TEXT (JSON serializado)

## Justificación del diseño
### Mezclas como pinturas
- Simplifica el dominio
- Evita duplicar lógica
- Permite:
    - listar mezclas junto a pinturas
    - filtrar fácilmente
    - exportar todo de forma homogénea
### JSON embebido para recetas
- La estructura de una receta puede evolucionar
- Evita joins innecesarios
- Encaja con import/export
- SQLite maneja bien campos TEXT

### Relación con usuario
- Aísla catálogos por usuario
- Permite multiusuario real
- Facilita futuras funcionalidades sociales

### Alternativas consideradas
Tabla separada mixes
Rechazada por:
- Mayor complejidad
- Duplicación de conceptos
- Poco beneficio funcional

Tabla de relación many-to-many para recetas
Rechazada por:
- Sobredimensionamiento
- Poca ganancia en consultas
- Complejidad innecesaria para el MVP

## Consecuencias
* Positivas
    - Modelo simple y expresivo
    - Fácil implementación del CRUD
    - Importación/exportación directa
    - Flexibilidad en evolución de recetas
    - Compatible con IA generativa

* Negativas
    - No se puede hacer SQL complejo sobre componentes de mezcla
    - Las recetas no son directamente normalizadas
    - Aceptable para el alcance definido.

## Contrato de exportación (base):
``` JSON
{
  "version": "1.0",
  "user": "uuid",
  "paints": [
    {
      "brand": "Vallejo",
      "reference": "70.830",
      "name": "German Field Grey",
      "is_mix": true,
      "recipe": { ... },
      "notes": "...",
      "in_stock": true
    }
  ]
}
```