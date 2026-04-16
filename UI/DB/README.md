# Database — PostgreSQL Container

This directory contains the Dockerfile and supporting configuration for the PostgreSQL 16 database instance used by the Django backend. The database runs as an isolated Docker container, built from a hardened Alpine-based image.

---

## How It Works

### Image

The image extends the official `postgres:16-alpine` image. Alpine is chosen to minimise the attack surface and keep the image footprint small.

```
FROM postgres:16-alpine
```

### Custom Configuration

A tuned `postgresql.conf` is copied into the image at `/etc/postgresql/postgresql.conf` to optimise PostgreSQL for a containerised environment (e.g. shared buffers, connection limits, logging).

```
COPY ./config/my-postgres.conf /etc/postgresql/postgresql.conf
```

The file is owned by the `postgres` system user (UID 999) for correct runtime permissions.

### Initialisation Scripts

Any `.sql` or `.sh` files placed in `./init-scripts/` are automatically executed by PostgreSQL in alphabetical order the first time the container starts. Use this to create schemas, seed reference data, or configure roles.

```
COPY ./init-scripts/ /docker-entrypoint-initdb.d/
```

### Startup

PostgreSQL is started with the custom config file explicitly passed:

```
CMD ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf"]
```

---

## Directory Structure

```
UI/DB/
+-- dockerfile                  # Custom PostgreSQL image definition
+-- config/
|   +-- my-postgres.conf        # Tuned PostgreSQL configuration
+-- init-scripts/
    +-- 01_schema.sql           # (optional) Initial schema setup
    +-- 02_seed.sql             # (optional) Reference data
```

---

## Environment Variables

The container credentials and connection parameters are passed at runtime via environment variables. These must be defined before starting the container, either in a `.env` file or directly in `docker-compose.yml`.

| Variable | Description | Default |
|---|---|---|
| `POSTGRES_DB` | Name of the database to create | `django_db` |
| `POSTGRES_USER` | Database superuser username | `django_user` |
| `POSTGRES_PASSWORD` | Database superuser password | — (required) |
| `DB_LOCALE` | Build-time locale for the database cluster | `en_US.UTF-8` |

The Django backend reads these same values through its own environment via `django-environ`:

| Django Setting | Env Variable | Default |
|---|---|---|
| `ENGINE` | `DB_ENGINE` | `django.db.backends.postgresql` |
| `NAME` | `DB_NAME` | — |
| `USER` | `DB_USER` | — |
| `PASSWORD` | `DB_PASSWORD` | — |
| `HOST` | `DB_HOST` | `127.0.0.1` |
| `PORT` | `DB_PORT` | `5432` |

---

## Running the Container

### Build the image locally

```bash
docker build -t wellsense-db ./UI/DB
```

### Run standalone

```bash
docker run -d \
  --name wellsense-db \
  -e POSTGRES_DB=django_db \
  -e POSTGRES_USER=django_user \
  -e POSTGRES_PASSWORD=<your_password> \
  -p 5432:5432 \
  -v wellsense_pgdata:/var/lib/postgresql/data \
  wellsense-db
```

The named volume `wellsense_pgdata` persists database files across container restarts and removals.

### Run as part of the full stack

Add the database service to `docker-compose.yml` at the project root alongside the backend and frontend services:

```yaml
services:
  db:
    build:
      context: ./UI/DB
      dockerfile: dockerfile
    container_name: wellsense-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - wellsense_pgdata:/var/lib/postgresql/data

  backend:
    build:
      context: ./UI/backend
    environment:
      DB_ENGINE: django.db.backends.postgresql
      DB_NAME: ${DB_NAME}
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_HOST: db          # service name resolves inside Docker network
      DB_PORT: 5432
    depends_on:
      - db

volumes:
  wellsense_pgdata:
```

Then start everything with:

```bash
docker-compose up --build
```

---

## Connecting to the Database

### From host machine

```bash
psql -h 127.0.0.1 -p 5432 -U django_user -d django_db
```

### From inside the container

```bash
docker exec -it wellsense-db psql -U django_user -d django_db
```

---

## Running Django Migrations

After the database container is running, apply Django migrations to create the application tables:

```bash
cd UI/backend
python manage.py migrate
```

Or, inside the backend container:

```bash
docker exec -it wellsense-backend python manage.py migrate
```

---

## Data Persistence

All PostgreSQL data is stored in the named Docker volume `wellsense_pgdata`, mounted at `/var/lib/postgresql/data` inside the container. This means:

- Data survives container restarts and image rebuilds.
- To fully reset the database, remove the volume explicitly:

```bash
docker volume rm wellsense_pgdata
```

---

## Notes

- The `POSTGRES_PASSWORD` variable is always required. The container will not start without it. Store it in a `.env` file at the project root and never commit that file to version control.
- The `my-postgres.conf` configuration overrides `shared_buffers`, `max_connections`, and logging settings to suit a containerised workload. Adjust these values based on the allocated container memory.
- Init scripts in `init-scripts/` only run once, on first container creation. Subsequent starts skip them.
