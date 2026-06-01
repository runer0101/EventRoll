# Base de Datos — PostgreSQL 16

## Esquema

```
usuarios
├── id            UUID PK DEFAULT gen_random_uuid()
├── nombre        VARCHAR(255) NOT NULL
├── email         VARCHAR(255) UNIQUE NOT NULL
├── password_hash VARCHAR(255) NOT NULL
├── rol           VARCHAR(20) CHECK (rol IN ('admin','organizador','asistente','guardia','visualizador'))
├── access_code   VARCHAR(12) UNIQUE
├── access_code_expires_at TIMESTAMP
├── permisos      JSONB
├── created_at    TIMESTAMPTZ DEFAULT NOW()
└── updated_at    TIMESTAMPTZ DEFAULT NOW()

eventos
├── id            UUID PK DEFAULT gen_random_uuid()
├── nombre        VARCHAR(255) NOT NULL
├── fecha         DATE
├── sillas_totales INTEGER DEFAULT 100
├── creado_por    UUID → usuarios(id)
├── created_at    TIMESTAMPTZ DEFAULT NOW()
└── updated_at    TIMESTAMPTZ DEFAULT NOW()

invitados
├── id            UUID PK DEFAULT gen_random_uuid()
├── evento_id     UUID → eventos(id) ON DELETE CASCADE
├── nombre        VARCHAR(255) NOT NULL
├── apellido      VARCHAR(255)
├── categoria     VARCHAR(50) DEFAULT 'General'
├── confirmado    BOOLEAN DEFAULT FALSE
├── asistio       BOOLEAN DEFAULT FALSE
├── fecha_asistencia TIMESTAMPTZ
├── created_at    TIMESTAMPTZ DEFAULT NOW()
└── updated_at    TIMESTAMPTZ DEFAULT NOW()

actividad
├── id            UUID PK DEFAULT gen_random_uuid()
├── usuario_id    UUID → usuarios(id)
├── accion        VARCHAR(255)
├── detalles      JSONB
└── created_at    TIMESTAMPTZ DEFAULT NOW()

recovery_codes
├── id            UUID PK DEFAULT gen_random_uuid()
├── usuario_id    UUID → usuarios(id) ON DELETE CASCADE
├── code          VARCHAR(6)
├── expires_at    TIMESTAMPTZ
├── used          BOOLEAN DEFAULT FALSE
└── created_at    TIMESTAMPTZ DEFAULT NOW()

email_config
├── id            UUID PK DEFAULT gen_random_uuid()
├── host          VARCHAR(255)
├── port          INTEGER
├── secure        BOOLEAN
├── user          VARCHAR(255)
├── pass          VARCHAR(255)

revoked_tokens
├── jti           VARCHAR(255) PK
├── expires_at    TIMESTAMPTZ NOT NULL

schema_migrations
├── version       VARCHAR(50) PK
└── applied_at    TIMESTAMPTZ DEFAULT NOW()

mesas
├── id            UUID PK DEFAULT gen_random_uuid()
├── evento_id     UUID → eventos(id) ON DELETE CASCADE
├── nombre        VARCHAR(50) NOT NULL
├── sillas        INTEGER DEFAULT 8 CHECK (sillas >= 2 AND sillas <= 20)
├── pos_x         FLOAT DEFAULT 0
├── pos_y         FLOAT DEFAULT 0
├── created_at    TIMESTAMPTZ DEFAULT NOW()
└── updated_at    TIMESTAMPTZ DEFAULT NOW()

asignaciones
├── id            UUID PK DEFAULT gen_random_uuid()
├── mesa_id       UUID → mesas(id) ON DELETE CASCADE
├── invitado_id   UUID → invitados(id) ON DELETE CASCADE
├── posicion      INTEGER CHECK (posicion >= 1 AND posicion <= 20)
├── created_at    TIMESTAMPTZ DEFAULT NOW()
├── UNIQUE(mesa_id, posicion)
└── UNIQUE(invitado_id)
```

## Índices

| Nombre | Tabla | Columnas | Propósito |
|--------|-------|----------|-----------|
| `idx_usuarios_email` | usuarios | email | Búsqueda de login |
| `idx_invitados_evento` | invitados | evento_id | Filtrar por evento |
| `idx_invitados_nombre_lower` | invitados | LOWER(nombre) | Búsqueda case-insensitive |
| `idx_invitados_apellido_lower` | invitados | LOWER(apellido) | Búsqueda case-insensitive |
| `idx_invitados_unique_per_event` | invitados | UNIQUE(evento_id, LOWER(nombre), LOWER(apellido)) | Anti-duplicados |
| `idx_actividad_usuario` | actividad | usuario_id | Auditoría por usuario |
| `idx_actividad_fecha` | actividad | created_at | Auditoría por fecha |
| `idx_mesas_evento` | mesas | evento_id | Mesas por evento |
| `idx_asignaciones_mesa` | asignaciones | mesa_id | Asignaciones por mesa |
| `idx_asignaciones_invitado` | asignaciones | invitado_id | Búsqueda inversa |
| `idx_revoked_tokens_expires` | revoked_tokens | expires_at | Limpieza de tokens |

## Migraciones

Las migraciones son idempotentes — si la tabla ya existe, se omiten.

| Versión | Qué agrega |
|---------|-----------|
| v1.0 (base) | `usuarios`, `eventos`, `invitados`, `actividad`, índices y triggers |
| v1.4 | `permisos` JSONB en usuarios, `asistio` y `fecha_asistencia` en invitados |
| v1.5 | `recovery_codes` y `email_config` para recuperación de contraseña |
| v1.6 | Índices de unicidad, limpieza de duplicados, índices compuestos |
| v1.7 | `revoked_tokens` para blacklist persistente de JWT |
| v1.8 | Rol `visualizador` agregado al CHECK constraint, índice en `access_code_expires_at` |
| v1.9 | `mesas` y `asignaciones` para el plano visual de mesas |

## Seed automático

Al arrancar el servidor, si no hay usuarios (`SELECT COUNT(*) = 0`) y `SKIP_SEED` no es `true`:
1. Crea usuario admin con `DEFAULT_ADMIN_EMAIL` y `DEFAULT_ADMIN_PASSWORD`
2. Crea 3 usuarios de ejemplo (organizador, asistente, guardia)
3. Crea 1 evento de ejemplo
4. Crea 8 invitados de ejemplo

Para desarrollo local con BD vacía, usar `SKIP_SEED=true` en `.env` y registrar el admin desde la web.

## Concurrencia

- `ON CONFLICT DO NOTHING` en inserts de invitados — atómico, sin race condition
- `DELETE ... RETURNING *` en eliminación — elimina la carrera entre findById y deleteById
- `ON CONFLICT (invitado_id) DO UPDATE` en asignaciones de mesas — reasignación atómica
- Window functions (`COUNT(*) OVER()`) para paginación con contadores en una sola query
