# ADR-001: Arquitectura general para la Libreta de Pinturas de Modelismo


## Contexto

Se requiere desarrollar una aplicación web multiusuario para la gestión de una libreta personal de pinturas de modelismo y escenografía. La aplicación debe permitir:

- Gestión CRUD de pinturas
- Soporte de pinturas comerciales y mezclas personalizadas
- Importación y exportación de datos
- Búsqueda y filtrado avanzado
- Integración con un modelo de IA para sugerencia de mezclas
- Acceso desde escritorio y dispositivos móviles

El sistema debe ser escalable, mantenible y permitir evolución futura (compartición de mezclas, ampliación de dominio, nuevos proveedores de IA).

## Decisión

Se adopta una arquitectura web cliente-servidor, con separación clara de responsabilidades:

### Arquitectura en capas
[ Cliente Web (React) ]
           |
           v
[ API Backend (Node.js) ]
           |
           v
[ Base de Datos SqlLITE ]
           |
           v
[ API IA externa ]

### Componentes

#### Frontend
- SPA desarrollada en React
- Comunicación con backend mediante API REST
- Gestión de estado de sesión mediante tokens
- UI responsive para desktop y móvil

### Backend
- API REST desarrollada en Node.js
- Responsable de:
    - Autenticación y autorización
    - Lógica de negocio
    - Validación de datos
    - Integración con modelos de IA
    - Importación y exportación

### Persistencia
- SqlLite como base de datos principal
- Modelo relacional para facilitar:
    - búsquedas
    - filtros
    - integridad de datos
    - futuras relaciones

### IA
- Consumo de API de modelo generativo (Gemini u otro proveedor)
- Acceso exclusivamente desde backend
- Respuestas estructuradas en JSON
- La IA no modifica datos directamente, solo propone

## Consecuencias

* Positivas
    - Separación clara de responsabilidades
    - Facilita pruebas y mantenimiento
    - Permite sustituir proveedor de IA sin afectar al frontend
    - Escalabilidad horizontal del backend
    - Exportación/importación coherente con el modelo de datos

* Negativas
    - Mayor complejidad inicial que una app solo frontend
    - Necesidad de desplegar backend y base de datos

## Notas

Esta arquitectura permite:
- Añadir compartición pública de mezclas
- Incorporar control de versiones de recetas
- Introducir nuevas marcas o catálogos oficiales
- Integrar análisis de color más avanzado en el futuro