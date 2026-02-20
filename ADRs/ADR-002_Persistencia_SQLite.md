# ADR-002: Persistencia con SQLite

## Contexto

La aplicación “Libreta de Pinturas de Modelismo” es una aplicación web multiusuario cuyo dominio principal consiste en:

Gestión de pinturas comerciales

Gestión de mezclas personalizadas

Operaciones CRUD frecuentes

Consultas de lectura intensivas (listados, filtros, búsquedas)

Escrituras poco frecuentes y de bajo volumen

Necesidad de importación y exportación de datos

El proyecto busca minimizar la complejidad operativa y los costes de infraestructura, manteniendo al mismo tiempo un modelo de datos estructurado y consultable mediante SQL estándar.

## Decisión

Se adopta SQLite como sistema de persistencia para el backend de la aplicación.

SQLite se utilizará como base de datos embebida, accedida exclusivamente a través del backend Node.js. No existirá acceso directo desde el cliente.

La base de datos residirá en un archivo persistente gestionado por el servidor.

## Justificación
* Simplicidad operativa
    - No requiere servidor de base de datos independiente
    - Reduce el número de componentes a desplegar
    - Elimina tareas de administración (usuarios, puertos, backups complejos)

* Adecuación al dominio
    - El dominio no requiere alta concurrencia de escritura
    - Las operaciones principales son lecturas y búsquedas
    - El volumen de datos es limitado (catálogo personal de pinturas)

* Uso de SQL real
- Permite:
    - filtros complejos
    - búsquedas por múltiples campos
    - joins
- Facilita el razonamiento sobre el modelo de datos

* Portabilidad
- La base de datos es un único archivo
- Facilita backups y migraciones
- Compatible con importación/exportación del dominio

## Implementación
* Acceso a datos
    - El acceso a SQLite se realizará mediante un ORM
    - Se utilizará una capa de abstracción que desacople la lógica de negocio del motor de persistencia
* Concurrencia
    - Lecturas concurrentes permitidas
    - Escrituras serializadas por el motor SQLite
    - El backend actuará como punto único de acceso, evitando conflictos
* Seguridad
    - El archivo SQLite no será accesible públicamente
    - Todo acceso se realizará mediante la API backend autenticada

## Alternativas consideradas
### PostgreSQL / MySQL
* Rechazadas en el MVP por:
    - Mayor complejidad operativa
    - Necesidad de servidor dedicado
    - Sobredimensionamiento para el dominio actual

### Firebase / Firestore
* Rechazado por:
    - Modelo no relacional
    - Limitaciones en consultas complejas
    - Dependencia fuerte del proveedor

## Consecuencias
* Positivas
    - Despliegue rápido y sencillo
    - Coste de infraestructura mínimo
    - Menor superficie de fallo
    - Modelo de datos claro y explícito

* Negativas
    - Escalado horizontal limitado
    - No adecuado para alta concurrencia de escritura
    - Requiere planificación si el número de usuarios crece significativamente

## Plan de evolución

La arquitectura contemplará una posible migración futura a un sistema de base de datos cliente-servidor (por ejemplo PostgreSQL).

Para facilitar esta evolución:
- Se usará un ORM compatible con múltiples motores
- No se introducirán dependencias específicas de SQLite en la lógica de negocio
- El contrato de la API permanecerá estable

## Notas finales

La elección de SQLite no se considera una limitación técnica sino una decisión consciente orientada a la simplicidad, alineada con el alcance funcional y el perfil de uso esperado de la aplicación.