# Estado y plan de MangaGo

Revisión de la aplicación MEVN (backend Express/Mongoose, tienda Vue, panel Vue y MongoDB). Este documento separa lo corregido en esta tarea de lo que sigue pendiente para completar el producto.

## Corregido en esta tarea

- API: validación/normalización de campos, validadores de Mongoose, límites de entrada, protección de rutas administrativas con JWT HS256, limitación de intentos de login, CORS por lista permitida, Helmet y límite de JSON.
- Alquileres: control de identificadores/fechas, reservas de stock con actualización condicional y compensaciones ante errores, devolución y pago idempotentes, cálculo del estado vencido y prevención de borrado de mangas/clientes con historial.
- Catálogo: límites de resultados, expresiones de autor escapadas y errores que no exponen mensajes internos.
- Datos demo: seed idempotente por upsert que ya no borra colecciones; no se ejecuta automáticamente.
- Configuración: secretos de desarrollo locales en `.env` (ignorado por Git), plantilla `.env.example`, Compose con puertos locales, persistencia Mongo, healthchecks y dependencias por salud.
- Contenedores: `npm ci`, scripts de compilación/tipado y documentación de ejecución actualizada.
- Dependencias: `npm audit fix` aplicado en los tres módulos; audit de producción reportó cero vulnerabilidades.
- Interfaz: no se modificó el código visual de la tienda ni del panel.

## Pendiente para completar el producto

### Producto y frontend

- No hay flujo completo de carrito, pedido, checkout ni pagos; decidir explícitamente si el alcance del MVP es catálogo + CRM o tienda transaccional.
- La tienda aún requiere revisión de búsqueda/filtros, navegación a autores, detalle de manga, estados vacíos y enlaces de pie de página.
- Textos de políticas y datos de contacto de ejemplo deben reemplazarse por datos del negocio antes de publicar.
- El panel todavía muestra secciones de pipeline/facturación/configuración sin flujo funcional.
- Las estadísticas de lectura no tienen seguimiento de lecturas; `most-read-week` usa alquileres como aproximación y debe presentarse como tal o añadirse un evento real de lectura.

### Seguridad y calidad

- El login es una protección básica compartida para el panel; falta gestión de usuarios/roles, rotación/revocación de sesiones, recuperación de contraseña y auditoría administrativa.
- Las operaciones de inventario y alquiler tienen compensaciones, pero no una transacción MongoDB. Para garantizar atomicidad distribuida se debe usar replica set/transacciones o modelar reservas con otra estrategia.
- No hay suite de pruebas automatizadas. Añadir pruebas de autorización, concurrencia de stock, validación, estados de alquiler y rutas críticas antes de producción.
- Los Dockerfiles/Compose son para desarrollo con Vite/nodemon y bind mounts; faltan imágenes optimizadas de producción, proxy HTTPS, secretos de despliegue y política de copias/restauración.
- CRUD administrativo sin paginación: debe añadirse cuando el volumen de catálogo, clientes o alquileres crezca.

## Efecto Gooey para una futura iteración visual

La referencia original ahora redirige a Libraries.dev. Su componente líquido está orientado a React; el proyecto usa Vue, así que no conviene incorporarlo directamente. Para probar el efecto en Vue, el mejor primer lugar sería una interacción acotada del menú móvil de la tienda: el botón del menú podría transformarse visualmente en acciones contiguas de navegación/categorías. Mantenerlo fuera de tablas, formularios y acciones frecuentes del CRM conserva la claridad operativa. Respetar `prefers-reduced-motion` y dejar textos/iconos legibles.

## Estado de ejecución

Verificado en esta máquina: `docker compose up --build -d --renew-anon-volumes` completó; Mongo y API están `healthy`, tienda responde en `http://localhost:5173`, panel en `http://localhost:5174`, y los endpoints de salud de API responden HTTP 200 en `http://localhost:5000/health/live` y `/health/ready`. Los puertos están enlazados a localhost. Los datos de Mongo permanecen en el volumen nombrado `mongo-data`. No ejecutar el seed en bases con datos que no deban mezclarse con registros de demostración.
