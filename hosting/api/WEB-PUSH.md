# Recordatorios Web Push de oración

## Instalación en el servidor

1. Desde la raíz del repositorio ejecutar `composer install --no-dev --optimize-autoloader`.
2. Ejecutar la migración `app-admin/migrations/2026-09-17-add-prayer-push-reminders.sql`.
3. Generar las claves con `vendor/bin/web-push generate:vapid`.
4. Guardar las claves únicamente en `hosting/api/config.local.php` o en variables de entorno:
   `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` y `PRAYER_PUSH_CRON_TOKEN`.
5. Configurar el cron cada minuto en la zona horaria de Colombia:

   ```cron
   * * * * * /usr/local/bin/php /RUTA/hosting/api/cron-prayer-push.php >/dev/null 2>&1
   ```

El proceso admite hasta diez minutos de tolerancia si una ejecución del cron se retrasa. La columna
`last_sent_date` impide repetir un mismo recordatorio durante el día.

## Comprobación

En la PWA, abrir **Oraciones → Ajustes**, activar un recordatorio y pulsar
**Enviar notificación de prueba**. La prueba está limitada a una por minuto y no permite seleccionar
un dispositivo ajeno porque utiliza un identificador aleatorio almacenado localmente.
