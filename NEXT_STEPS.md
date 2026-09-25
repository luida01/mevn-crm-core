# Próximos pasos de MangaGo

## Completado el 25 de septiembre de 2026

- Unifiqué las páginas de políticas de alquiler, devoluciones y términos con la navegación y el estilo de la tienda.
- Reescribí la FAQ y el contenido informativo para describir lo que la app hace hoy, retirando datos de contacto y promesas comerciales sin confirmar.
- Añadí fichas de manga desde novedades, colecciones y tendencias, con precio, stock y datos del título.
- Añadí una experiencia de alquiler/compra de demostración. No pide datos bancarios, no llama a un proveedor, no crea pedidos y no cobra.
- Mejoré los estados para portadas ausentes y los mensajes que explican el alcance real del catálogo.
- Docker está levantado: tienda en `http://localhost:5173`, panel en `http://localhost:5174` y API en `http://localhost:5000`.

## Siguientes pasos

### Panel completado en esta sesión

- Clientes: errores de guardado visibles sin cerrar el formulario, edición y desactivación, filtros e historial.
- Alquileres: clientes activos, stock disponible, fecha y hora local, coste por día, devolución y pagos explícitos.
- Pipeline: tablero de alquileres en curso, vencidos, devueltos por cobrar y cerrados.
- Cobros: comprobantes internos persistidos e imprimibles, con datos originales y estado de pago actualizado. No son facturas fiscales.
- Configuración: nombre, contacto, dirección y días sugeridos; estos valores se usan al emitir comprobantes y crear alquileres.
- Catálogo: búsqueda paginada de todos los volúmenes, incluidos los que tienen stock 0. Las colecciones consultan el inventario actual sin caché.
- Inventario: reposición por incremento atómico y prevención de cierre del formulario cuando falla el guardado.
- Comprobadas 57 operaciones y condiciones de la API en una base temporal: duplicados, último ejemplar, devolución repetida, pagos idempotentes, comprobantes, configuración y reposición simultánea.

### Pendiente para próximas sesiones

1. Revisar la tienda en escritorio, tablet y móvil; afinar contraste, foco por teclado y movimiento reducido.
2. Decidir con el negocio condiciones reales de alquiler, devoluciones, entregas, medios de pago, identidad legal y privacidad.
3. Cuando esas condiciones estén definidas, convertir la demostración en un flujo real de pedido y seleccionar un proveedor de pagos; mantener el modo de prueba sin datos financieros.
4. Revisar seguridad de la API antes de publicar: autenticación/autorización, CORS limitado, validación de entradas y control de operaciones de inventario.
5. Definir si se requieren ventas reales, pagos parciales, facturación fiscal, múltiples empleados o un pipeline comercial independiente del seguimiento de alquileres.

## Comprobación local

- Compilar la tienda desde `frontend` con `npm run build`.
- Confirmar los servicios con `docker compose ps`.
- Comprobar los flujos administrativos: `cd backend` y `npm run check:workflows` (requiere MongoDB; usa y elimina una base temporal propia).
- Tienda: `http://localhost:5173`; panel: `http://localhost:5174`.
