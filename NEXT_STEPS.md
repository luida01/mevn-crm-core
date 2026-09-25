# Próximos pasos de MangaGo

## Estado actual

- La portada tiene una identidad visual nueva, una navegación compartida y el CTA con el efecto líquido SVG/CSS.
- La FAQ ya está en español, incluye búsqueda y preguntas desplegables, y enlaza con las políticas.
- Carrusel, colecciones, bloque de alquileres y footer comparten la nueva paleta.
- `npm run build` terminó correctamente y los servicios de Docker quedaron levantados.

## Plan recomendado para la próxima sesión

### 1. Unificar las páginas de información

- Aplicar el encabezado compartido y el estilo de la tienda a Políticas de alquiler, Devoluciones y Términos.
- Traducir su contenido al español y revisar los enlaces de navegación.
- Sustituir o retirar datos de contacto de ejemplo y revisar las promesas de pagos, entregas, depósitos y cargos antes de publicarlas.

### 2. Terminar los detalles de la experiencia de la tienda

- Revisar la portada y la FAQ en móvil, tablet y escritorio.
- Comprobar navegación por teclado, foco visible, contraste y movimiento reducido.
- Afinar el efecto gooey en el CTA principal y decidir si algún otro control realmente se beneficia de él.
- Revisar estados de carga, catálogo vacío y portadas sin imagen.

### 3. Revisar el recorrido del catálogo

- Confirmar que cada manga tiene una acción clara y que las opciones de alquiler y compra coinciden con lo que el backend permite.
- Revisar los enlaces entre novedades, tendencias, colecciones y ayuda para que ninguno lleve a una sección inexistente.

### 4. Cierre de calidad y ejecución

- Volver a compilar el frontend con `npm run build` desde `frontend`.
- Confirmar que los servicios siguen activos con `docker compose ps` y abrir la tienda y el panel.
- Corregir cualquier diferencia visual o error visible antes de dar por terminado el rediseño.

## Orden sugerido

Primero validar el contenido de políticas y contacto; luego unificar esas páginas; después hacer la revisión responsive y de accesibilidad; por último cerrar el recorrido del catálogo y verificar la ejecución.
