# ADR-006: Importación / Exportación y portabilidad

## Contexto

La aplicación debe permitir al usuario:
- Importar su libreta de pinturas desde otras herramientas
- Exportar su libreta para:
    - backups
    - migración
    - compartir mezclas
- Mantener compatibilidad futura entre versiones

La portabilidad es especialmente importante al tratarse de un proyecto personal/comunitario y no de un sistema corporativo cerrado.

## Decisión

Se adopta JSON como formato canónico de intercambio y CSV como formato secundario de importación.

* JSON será el formato:
    - más completo
    - versionado
    - recomendado

* CSV será:
    - opcional
    - solo para pinturas simples (no mezclas complejas)

## Exportación

### Exportación completa

`GET /api/export`

Devuelve un archivo JSON con:
- versión del esquema
- metadatos básicos
- listado completo de pinturas

Ejemplo:
```JSON
{
  "schema_version": "1.0",
  "exported_at": "2026-02-03",
  "paints": [
    {
      "brand": "Vallejo",
      "reference": "70.830",
      "name": "German Field Grey",
      "is_mix": true,
      "recipe": { ... },
      "notes": "",
      "in_stock": true
    }
  ]
}
```

## Importación

### Importación JSON

`POST /api/import/json`

- Validación de esquema
- Normalización de datos
- Inserción transaccional
- Resolución de conflictos (por nombre/referencia)

### Importación CSV

`POST /api/import/csv`

Campos esperados:
- brand
- reference
- name
- color
- notes
- in_stock

Las mezclas no se importan vía CSV.

## Versionado de esquema

- Campo obligatorio: schema_version
- Permite:
    - compatibilidad futura
    - migraciones controladas
- Versionado semántico simple (1.0, 1.1, etc.)

## Justificación

- JSON permite representar recetas complejas
- CSV es familiar y rápido
- La validación evita corrupción de datos
- El usuario mantiene control total sobre su información