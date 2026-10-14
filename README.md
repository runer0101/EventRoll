# EventRoll SaaS

## Configuración de entorno

Copia el archivo de ejemplo y remplaza los valores con los de tu entorno:

```bash
cp .env.example .env
```

El archivo `.env.example` contiene los siguientes placeholders (no son secretos reales):

- `DATABASE_URL`: cadena de conexión a PostgreSQL (ej. `postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public`).
- `AUTH_SECRET`: cadena aleatoria larga que usa Next‑Auth para firmar los tokens JWT.

Asegúrate de que la base de datos PostgreSQL esté corriendo antes de ejecutar `npx prisma migrate dev`.
