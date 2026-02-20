# ADR-007: Autenticación y autorización

## Contexto

La aplicación es multiusuario y requiere:
- Aislamiento total de datos entre usuarios
- Acceso desde múltiples dispositivos
- Simplicidad en el MVP

## Decisión

Se adopta autenticación basada en tokens (JWT) gestionada por el backend.
- Registro y login por email + contraseña
- Token enviado en cada request
- El user_id se obtiene siempre del token

## Autorización
- Todas las entidades Paint están asociadas a un user_id
- El backend:
    - filtra por usuario automáticamente
    - impide acceso cruzado
- El frontend nunca envía user_id

## Justificación
- JWT es estándar
- Fácil de implementar
- Escalable
- No acopla a proveedor externo