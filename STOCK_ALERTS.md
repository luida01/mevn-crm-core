# Avisos por correo cuando vuelve el stock

En la ficha de un volumen agotado aparece **Avísame cuando haya stock**. El usuario introduce su correo y acepta recibir la confirmación y un único aviso para ese volumen. El primer correo confirma el registro y contiene un enlace para activarlo. No se envían avisos de disponibilidad hasta confirmar el correo; abrir el enlace por sí solo no modifica nada, hay que pulsar **Activar aviso**. Cada correo incluye un enlace para cancelar.

Los correos y el formulario están en español e inglés. El aviso incluye título y volumen, enlaza al catálogo filtrado y explica que no reserva existencias. Se comprueba la disponibilidad antes de enviar. Una suscripción notificada deja de recibir correos de stock.

## Probar en Docker

```powershell
docker compose up -d
```

Docker usa [Mailpit](https://mailpit.axllent.org/docs/install/docker/) como buzón SMTP de pruebas. Abre **http://localhost:8025** para ver los correos capturados. Usa una dirección ficticia como `lector@example.test`; ningún mensaje de esta configuración sale a Internet. Solo el buzón web está publicado en la interfaz local del PC.

1. En el panel de administración, deja un volumen sin existencias.
2. Abre ese volumen en la tienda, introduce un correo y acepta el aviso.
3. Abre el correo en Mailpit, sigue el enlace y pulsa **Activar aviso**.
4. Repón el stock desde el panel. Aparecerá un segundo correo con el aviso.
5. Las devoluciones de alquiler y las reservas de checkout liberadas también comprueban avisos pendientes.

No se modifican automáticamente las existencias del catálogo de demostración para esta función.

## Enviar a buzones reales y desplegar en Vercel

Configura estas variables solo en el backend. No coloques credenciales en variables `VITE_` ni en Git.

| Variable | Configuración |
| --- | --- |
| `SMTP_HOST` | Servidor de tu proveedor SMTP |
| `SMTP_PORT` | Habitualmente 587 (STARTTLS) o 465 (TLS) |
| `SMTP_SECURE` | `true` para TLS desde el inicio, normalmente en 465 |
| `SMTP_REQUIRE_TLS` | `true` en producción; el valor `false` de Docker es para Mailpit local |
| `SMTP_USER`, `SMTP_PASSWORD` | Credenciales del proveedor |
| `MAIL_FROM` | Remitente verificado por el proveedor |
| `SHOP_URL` | URL HTTPS pública de la tienda, usada en los enlaces |
| `CRON_SECRET` | Secreto aleatorio largo para el procesador de pendientes |

Configura el dominio/remitente y los registros de autenticación de correo que indique tu proveedor. La implementación usa [Nodemailer con SMTP](https://nodemailer.com/smtp). No hay un proveedor real ni credenciales incluidos en el repositorio.

Los cambios de stock y las altas procesan hasta cinco avisos inmediatamente. En Node/Docker hay un trabajador cada 30 segundos. **En Vercel debes programar una llamada cada minuto** a `GET https://<api>/api/stock-alerts/process`, con `Authorization: Bearer <CRON_SECRET>`, usando un plan de cron que admita esa frecuencia o un programador externo. Esto entrega los lotes restantes y reintenta fallos incluso sin visitas a la tienda. No pongas el secreto en la URL. Cada ejecución procesa hasta cinco mensajes; ajusta capacidad y frecuencia si crece la lista. Los envíos se esperan dentro de la solicitud para evitar que una función serverless se congele antes de completar el trabajo.

## Persistencia y límites

- `StockAlert` guarda la cola en MongoDB. Un bloqueo temporal por registro evita que trabajadores concurrentes envíen el mismo aviso. Un error SMTP conserva el aviso y aplica una espera progresiva de 1 a 60 minutos.
- SMTP no garantiza exactamente una entrega: si el proveedor acepta un correo y el proceso se interrumpe antes de guardar el resultado, un reintento podría repetirlo. El identificador del mensaje es estable para facilitar la deduplicación del proveedor.
- Una combinación correo/volumen tiene una sola suscripción. Repetir el formulario no vuelve a enviar confirmaciones. Tras notificación/cancelación puede solicitarse otra cuando el volumen vuelva a agotarse y haya pasado un día desde el registro anterior.
- Hay límite de solicitudes por IP y un control persistente de altas recientes por destinatario. Los enlaces usan firmas HMAC con propósito separado para activar/cancelar; el token viaja en el fragmento del enlace y no se devuelve al registrar el correo. No se exponen direcciones en respuestas ni registros de entrega.
- Los registros sin confirmar vencen a los 7 días, los activos a los 90 días y los notificados/cancelados se conservan hasta 7 días. MongoDB los elimina mediante TTL. Los enlaces caducados se rechazan aun antes de la limpieza TTL. Al borrar un manga se eliminan sus suscripciones.
- La recepción por SMTP confirma que el proveedor aceptó el mensaje; no garantiza llegada a la bandeja principal. Revisa rebotes y entregabilidad desde el proveedor.

## Verificación automatizada

`cd backend; npm run check:stock-alerts` inicia una API, una base MongoDB temporal y un servidor SMTP local aislado. Comprueba correo inicial, duplicados, activación, cancelación, reposición, devolución, reintentos y ejecución concurrente. No usa la base de la tienda ni envía mensajes reales. La comprobación forma parte de CI junto con las pruebas del formulario y de la activación en navegador.
