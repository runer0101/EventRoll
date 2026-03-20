@echo off
echo ============================================
echo   YSSEL - Configuracion de PostgreSQL
echo ============================================
echo.

echo [PASO 1/4] Verificando PostgreSQL...
echo.

REM Esperar a que el usuario confirme que PostgreSQL esta instalado
echo Por favor, confirma que PostgreSQL esta instalado y corriendo.
echo.
echo Puedes verificarlo abriendo "Servicios" (services.msc) y buscando "postgresql"
echo.
pause

echo.
echo [PASO 2/4] Creando base de datos...
echo.
echo Por favor ingresa la contrasena de PostgreSQL que elegiste durante la instalacion:
echo.

REM Crear la base de datos
psql -U postgres -c "CREATE DATABASE yssel_db;"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: No se pudo crear la base de datos.
    echo Verifica que:
    echo 1. PostgreSQL este corriendo
    echo 2. La contrasena sea correcta
    echo 3. psql este en el PATH de Windows
    echo.
    pause
    exit /b 1
)

echo.
echo Base de datos 'yssel_db' creada exitosamente
echo.

echo [PASO 3/4] Ejecutando migraciones...
echo.

cd backend

echo Ejecutando migracion base...
call npm run migrate

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Fallo la migracion base
    pause
    exit /b 1
)

echo.
echo Ejecutando migracion v1.4 (permisos y asistencia)...
call npm run migrate:v1.4

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Fallo la migracion v1.4
    pause
    exit /b 1
)

echo.
echo [PASO 4/4] Cargando datos de prueba...
echo.

call npm run seed

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Fallo al cargar datos de prueba
    pause
    exit /b 1
)

cd ..

echo.
echo ============================================
echo   CONFIGURACION COMPLETADA
echo ============================================
echo.
echo La base de datos ha sido configurada correctamente.
echo.
echo Usuarios de prueba creados:
echo - admin@prueba / <REPLACE_WITH_SECURE_PASSWORD> (Admin)
echo - organizador@prueba / <REPLACE_WITH_SECURE_PASSWORD> (Organizador)
echo - asistente@prueba / <REPLACE_WITH_SECURE_PASSWORD> (Asistente)
echo - guardia@prueba / <REPLACE_WITH_SECURE_PASSWORD> (Guardia)
echo.
echo SIGUIENTE PASO: Iniciar el backend
echo.
echo Abre una nueva terminal y ejecuta:
echo   cd backend
echo   npm run dev
echo.
pause
