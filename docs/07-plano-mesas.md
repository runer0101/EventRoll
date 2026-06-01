# Plano de Mesas

Feature para organizar visualmente a los invitados en mesas redondas con sillas asignables mediante drag & drop.

## Vista general

```
┌──────────────────────────────────────┬──────────────────────────┐
│  [+ Mesa]                            │  Invitados sin asignar    │
│                                      │  ────────────────────     │
│          ╭──────────╮                │  👤 Carlos García   VIP   │
│         ╱  Mesa 1   ╲               │  👤 Ana Martínez    Fam   │
│        ╱   ○  ○  ○   ╲              │  👤 Luis Rodríguez  Amg   │
│       │   ○       ○   │             │                           │
│       │   ○   🍽️   ○   │             │                           │
│       │   ○       ○   │             │                           │
│        ╲  ○  ○  ○   ╱              │                           │
│         ╲          ╱                │                           │
│          ╰──────────╯               │                           │
│                                      │                           │
│       ╭──────╮    ╭──────╮           │                           │
│      ╱ Mesa 2 ╲  ╱ Mesa 3 ╲         │                           │
│     ╱ ○ ○ ○ ○ ╲╱ ○ ○ ○ ○ ╲        │                           │
│      ╰──────╯  ╰──────╯           │                           │
└──────────────────────────────────────┴──────────────────────────┘
```

## Interacción

| Acción | Desktop | Mobile |
|--------|---------|--------|
| Crear mesa | Botón "+ Mesa" | Touch |
| Mover mesa | Drag en el canvas | Touch + arrastrar |
| Asignar invitado | Arrastrar de la derecha a una silla | Tap silla → elegir |
| Desasignar | Arrastrar de la silla al canvas | — |
| Zoom | Scroll del mouse | Pinch |
| Pan | Click + arrastrar en el fondo | Touch + arrastrar |

## Leyenda visual

- 🟢 Silla verde — invitado confirmado
- ⚪ Silla gris — invitado pendiente
- ⭕ Silla vacía — disponible (hover cambia a gris oscuro)
- 🍽️ Centro — nombre de mesa + ocupación (ej: "M1 · 6/8")
- Borde punteado verde — mesa completa
- Borde punteado amarillo — mesa parcialmente ocupada

## Arquitectura

### Base de datos
```
mesas:       id, evento_id, nombre, sillas, pos_x, pos_y
asignaciones: id, mesa_id, invitado_id, posicion
```

- `UNIQUE(mesa_id, posicion)` — una silla = un invitado
- `UNIQUE(invitado_id)` — un invitado = una sola mesa
- `ON DELETE CASCADE` en ambas FK

### Backend
- `GET /api/v1/mesas?evento_id=` — mesas con asignaciones anidadas (JSON aggregate)
- `POST /api/v1/mesas` — crear mesa
- `PUT /api/v1/mesas/:id` — mover/editar mesa
- `DELETE /api/v1/mesas/:id` — eliminar mesa
- `GET /api/v1/mesas/sin-mesa?evento_id=` — invitados sin asignar
- `POST /api/v1/mesas/:mesaId/asignar` — asignar invitado a silla
- `DELETE /api/v1/mesas/desasignar/:invitadoId` — quitar invitado de mesa

### Frontend
- **PlanoView** — Vista contenedora: MesaCanvas + SidebarInvitados
- **MesaCanvas** — SVG interactivo con grid, zoom y pan
- **MesaRedonda** — SVG de mesa individual con sillas calculadas trigonométricamente
- **SidebarInvitados** — Panel de invitados arrastrables
- **usePlanoStore** — Pinia store con estado y operaciones

### Componentes SVG
- Renderizado con SVG puro (no canvas) para accesibilidad y eventos DOM
- Posiciones de sillas calculadas con `sin/cos` alrededor de la mesa
- Drag & drop con HTML5 Drag API
- Mesa movible con eventos de mouse

## Permisos

| Acción | Permiso requerido |
|--------|------------------|
| Ver plano | `verInvitados` |
| Crear mesa | `agregarInvitados` |
| Editar mesa | `editarInvitados` |
| Eliminar mesa | `eliminarInvitados` |
| Asignar/desasignar | `editarInvitados` |
