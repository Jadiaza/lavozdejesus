# AGENTS.md — Proyecto La Voz de Jesús

## 1. Identidad del proyecto

**La Voz de Jesús** es una aplicación web progresiva católica con panel administrativo, emisora en vivo y recursos espirituales.

El proyecto incluye, entre otros, los siguientes módulos:

- Radio en vivo
- Programación
- Capilla Virtual
- Intenciones de oración
- Liturgia del Día
- Evangelio y Lectio Divina
- Santoral
- Biblia y planes
- Rosario
- Podcast
- Biblioteca y archivos
- Donaciones
- Publicidad
- Usuarios y roles
- Configuración general

La aplicación debe conservar una identidad:

- católica;
- contemplativa;
- sobria;
- pastoral;
- clara;
- profesional;
- centrada en Jesucristo;
- con especial cuidado por la experiencia de oración.

---

# 2. Tecnología del proyecto

La tecnología principal del proyecto es:

- PHP
- MySQL / MariaDB
- HTML5
- CSS3
- JavaScript
- PWA
- Panel administrativo propio
- Hosting compartido con cPanel
- phpMyAdmin
- Git y GitHub
- Visual Studio Code

## Restricciones técnicas

1. Mantener compatibilidad con hosting compartido.
2. No requerir procesos permanentes de Node.js en producción.
3. No introducir dependencias pesadas sin necesidad.
4. No modificar la arquitectura completa por una tarea pequeña.
5. No asumir que existen frameworks que no hayan sido confirmados.
6. Antes de crear archivos nuevos, revisar si ya existe una estructura equivalente.
7. Antes de crear tablas nuevas, revisar si ya existe una tabla con la misma responsabilidad.
8. Mantener compatibilidad con la versión de PHP configurada en producción.
9. Evitar código experimental en producción.
10. No exponer credenciales, rutas sensibles, tokens ni errores internos.

---

# 3. Reglas generales obligatorias

Codex debe seguir estas reglas en todas las tareas:

1. Revisar primero la estructura existente.
2. No inventar rutas de archivos.
3. No crear duplicados de módulos, controladores, vistas, tablas o funciones.
4. No eliminar funcionalidades existentes.
5. No borrar registros de base de datos.
6. No ejecutar migraciones destructivas.
7. No renombrar tablas existentes sin autorización.
8. No cambiar estilos globales salvo que sea estrictamente necesario.
9. No modificar módulos diferentes al solicitado.
10. No hacer cambios masivos cuando pueda resolverse con cambios localizados.
11. Usar consultas preparadas.
12. Validar y sanitizar entradas.
13. Escapar correctamente las salidas.
14. Registrar errores técnicos sin mostrarlos completos al usuario final.
15. Respetar roles y permisos existentes.
16. Mantener el diseño visual actual del panel.
17. Conservar la experiencia móvil.
18. Probar PHP, JavaScript y SQL relacionados con el cambio.
19. No hacer `push` a GitHub sin autorización expresa.
20. No publicar cambios en producción sin autorización expresa.

---

# 4. Flujo obligatorio de trabajo

Para cada tarea, Codex debe seguir este orden:

## Paso 1. Inspección

Antes de modificar código:

- localizar los archivos involucrados;
- identificar rutas, parámetros y consultas;
- revisar el patrón usado por módulos similares;
- verificar las tablas involucradas;
- comprobar dependencias;
- identificar riesgos.

## Paso 2. Plan corto

Antes de implementar, presentar un plan breve con:

- archivos que se modificarán;
- tablas afectadas;
- cambios previstos;
- riesgos;
- pruebas necesarias.

## Paso 3. Implementación

Al implementar:

- hacer cambios mínimos y localizados;
- reutilizar funciones existentes;
- conservar nombres y convenciones del proyecto;
- no duplicar lógica;
- documentar solo lo necesario;
- mantener compatibilidad con el hosting.

## Paso 4. Validación

Después de implementar:

- revisar sintaxis PHP;
- revisar errores JavaScript;
- revisar consultas SQL;
- verificar enlaces y rutas;
- probar crear, editar, listar y cambiar estado;
- comprobar comportamiento móvil;
- comprobar mensajes de error;
- verificar que no se afectaron otros módulos.

## Paso 5. Entrega

Al finalizar, informar:

- archivos modificados;
- cambios realizados;
- consultas SQL necesarias;
- pruebas realizadas;
- resultados;
- pendientes;
- riesgos que permanezcan.

---

# 5. Convenciones de base de datos

## Prefijo general

Las tablas del proyecto utilizan el prefijo:

```text
lvj_
```

## Prefijo comunitario

Las tablas relacionadas con comunidad utilizan:

```text
lvj_com_
```

## Reglas de base de datos

1. No crear tablas duplicadas.
2. No eliminar tablas existentes.
3. No cambiar tipos de columnas sin revisar datos existentes.
4. Usar `BIGINT` para identificadores cuando las tablas relacionadas ya lo usan.
5. Mantener coherencia entre claves primarias y foráneas.
6. Usar `created_at`, `updated_at` y `deleted_at` cuando corresponda.
7. Respetar borrado lógico si el módulo usa `deleted_at`.
8. No usar borrado físico salvo autorización.
9. Crear índices para claves foráneas y búsquedas frecuentes.
10. Evitar `ENUM` si el proyecto usa estados administrables mediante `VARCHAR`.
11. Mantener estados claros: `activo`, `inactivo`, `pendiente`, `aprobado`, etc.
12. No guardar URLs sensibles directamente en código.
13. No guardar contraseñas en texto plano.
14. No registrar tokens en logs visibles.
15. Toda modificación estructural debe entregarse como SQL explícito.

---

# 6. Módulo Capilla Virtual

La Capilla Virtual tiene dos dimensiones:

## A. Dimensión espiritual y comunitaria

Incluye:

- peticiones de oración;
- grupos de oración;
- miembros de grupos;
- testimonios;
- notas espirituales;
- favoritos;
- usuarios comunitarios.

## B. Dimensión técnica y audiovisual

Incluye:

- capillas;
- streams;
- configuración;
- verificación;
- respaldo;
- historial técnico;
- reproductor público.

Estas dos dimensiones deben convivir en el mismo módulo, pero con responsabilidades separadas.

---

# 7. Tablas comunitarias existentes

Las siguientes tablas ya existen y no deben eliminarse ni recrearse:

```text
lvj_com_favoritos
lvj_com_grupos_oracion
lvj_com_grupo_miembros
lvj_com_notas_espirituales
lvj_com_peticiones_oracion
lvj_com_testimonios
lvj_com_usuarios
```

## Responsabilidad de cada tabla

### `lvj_com_favoritos`

Guarda contenidos favoritos del usuario.

Campos observados:

- `id`
- `usuario_id`
- `tipo`
- `referencia_id`
- `titulo`
- `created_at`

No cambiar su estructura sin revisar cómo se usa en toda la app.

---

### `lvj_com_grupos_oracion`

Guarda grupos de oración.

Campos observados:

- `id`
- `nombre`
- `descripcion`
- `imagen_url`
- `estado`
- `created_at`
- `updated_at`
- `deleted_at`

Debe conservar borrado lógico.

---

### `lvj_com_grupo_miembros`

Relaciona usuarios con grupos de oración.

Campos observados:

- `id`
- `grupo_id`
- `usuario_id`
- `rol_grupo`
- `estado`
- `created_at`

Debe conservar las relaciones con grupos y usuarios.

---

### `lvj_com_notas_espirituales`

Guarda notas espirituales privadas del usuario.

Campos observados:

- `id`
- `usuario_id`
- `tipo`
- `referencia_id`
- `nota`
- `created_at`
- `updated_at`
- `deleted_at`

Las notas deben tratarse como contenido privado.

---

### `lvj_com_peticiones_oracion`

Guarda peticiones de oración.

Campos observados:

- `id`
- `usuario_id`
- `fecha`
- `nombre`
- `ciudad`
- `peticion`
- `categoria`
- `anonimo`
- `estado`
- `created_at`
- `updated_at`
- `deleted_at`

Estados esperados:

- `pendiente`
- `aprobada`
- `rechazada`
- `archivada`

No mostrar públicamente una petición sin aprobación.

---

### `lvj_com_testimonios`

Guarda testimonios enviados por usuarios.

Campos observados:

- `id`
- `usuario_id`
- `fecha`
- `nombre`
- `ciudad`
- `testimonio`
- `imagen_url`
- `aprobado`
- `estado`
- `created_at`
- `updated_at`
- `deleted_at`

No publicar testimonios sin aprobación.

---

### `lvj_com_usuarios`

Guarda usuarios comunitarios.

Campos observados:

- `id`
- `rol_id`
- `nombre`
- `email`
- `telefono`
- `password_hash`
- `avatar_url`
- `estado`
- `created_at`
- `updated_at`
- `deleted_at`

Reglas:

- no mostrar `password_hash`;
- no registrar contraseñas en logs;
- usar hash seguro;
- respetar estado y borrado lógico.

---

# 8. Tablas técnicas de Capilla Virtual

Las siguientes tablas manejan la transmisión:

```text
lvj_capillas
lvj_capilla_streams
lvj_capilla_config
lvj_capilla_logs
```

## `lvj_capillas`

Responsabilidad:

Guardar la información general de cada capilla, convento, parroquia, santuario o transmisión eucarística.

Campos esperados:

- `id`
- `nombre`
- `subtitulo`
- `descripcion`
- `pais`
- `ciudad`
- `sitio_web`
- `imagen_url`
- `logo_url`
- `es_principal`
- `es_respaldo`
- `prioridad`
- `estado`
- `created_at`
- `updated_at`
- `deleted_at`

Reglas:

1. Solo una capilla debe quedar marcada como principal.
2. Puede haber varias capillas de respaldo.
3. `prioridad` define el orden de respaldo.
4. No eliminar físicamente una capilla con historial.
5. Mostrar solo registros activos en la vista pública.

---

## `lvj_capilla_streams`

Responsabilidad:

Guardar uno o varios streams relacionados con una capilla.

Campos esperados:

- `id`
- `capilla_id`
- `nombre`
- `tipo_stream`
- `calidad`
- `url_stream`
- `url_origen`
- `requiere_token`
- `requiere_referer`
- `referer_url`
- `es_principal`
- `estado`
- `ultima_verificacion`
- `ultimo_error`
- `created_at`
- `updated_at`
- `deleted_at`

Tipos admitidos:

- `hls`
- `youtube`
- `iframe`
- `vimeo`
- `audio`
- `otro`

Calidades posibles:

- `auto`
- `1080p`
- `720p`
- `480p`
- `360p`
- `audio`
- `otro`

Reglas:

1. No guardar URLs quemadas en PHP o JavaScript.
2. Obtener siempre los streams desde base de datos.
3. Una capilla puede tener varios streams.
4. Un stream puede ser principal o de respaldo.
5. Los enlaces firmados deben poder actualizarse desde el panel.
6. No exponer tokens completos en logs o mensajes.
7. No asumir que un `.m3u8` es permanente.
8. Comprobar estado antes de mostrarlo.
9. Registrar fecha de última verificación.
10. Guardar mensajes técnicos en `ultimo_error`, sin exponerlos al usuario final.

---

## `lvj_capilla_config`

Responsabilidad:

Guardar la configuración general de la Capilla Virtual.

Campos esperados:

- `id`
- `capilla_activa_id`
- `stream_activo_id`
- `modo_reproduccion`
- `calidad_default`
- `mostrar_nombre`
- `mostrar_pais`
- `mostrar_intenciones`
- `mostrar_boton_radio`
- `mensaje_carga`
- `mensaje_error`
- `estado`
- `updated_at`

Reglas:

1. Debe existir un único registro activo de configuración general.
2. La capilla activa debe existir y estar activa.
3. El stream activo debe pertenecer a la capilla seleccionada.
4. `modo_reproduccion` puede ser:
   - `auto`
   - `manual`
5. La calidad predeterminada debe existir entre los streams activos.
6. Los mensajes deben poder editarse desde el administrador.
7. Si no hay stream activo, debe usarse una capilla de respaldo.
8. Si todo falla, mostrar un mensaje espiritual y no un error técnico.

---

## `lvj_capilla_logs`

Responsabilidad:

Guardar historial técnico y administrativo.

Campos esperados:

- `id`
- `capilla_id`
- `stream_id`
- `accion`
- `detalle`
- `usuario`
- `created_at`

Acciones posibles:

- creación;
- edición;
- activación;
- desactivación;
- cambio de capilla;
- cambio de stream;
- verificación correcta;
- error de stream;
- cambio automático a respaldo;
- actualización de URL.

Reglas:

1. No guardar contraseñas.
2. No guardar tokens completos.
3. No guardar información sensible.
4. Registrar usuario responsable cuando exista.
5. No eliminar historial sin autorización.

---

# 9. Reglas del reproductor HLS

1. Usar la URL activa desde base de datos.
2. Usar soporte HLS nativo cuando esté disponible.
3. Usar HLS.js solo cuando sea necesario.
4. No inicializar más de una instancia del reproductor.
5. Destruir correctamente la instancia anterior al cambiar de stream.
6. No reproducir simultáneamente radio y capilla.
7. Usar `playsinline`.
8. No forzar autoplay con sonido si el navegador lo bloquea.
9. Mostrar botón claro para activar audio.
10. Permitir calidad automática cuando exista un master playlist.
11. Si hay streams separados por calidad, permitir selector manual.
12. Si falla una calidad, probar una inferior.
13. Si falla el stream principal, probar respaldo.
14. Evitar bucles infinitos de reconexión.
15. Mostrar estado de carga de manera pastoral.
16. No mostrar mensajes técnicos como:
   - `404`;
   - `CORS`;
   - `manifestLoadError`;
   - `networkError`.
17. Registrar esos errores solo en logs internos.

---

# 10. Streams temporales y firmados

Algunas transmisiones HLS incluyen parámetros como:

```text
nimblesessionid
clientId
timestamp
token
```

Reglas:

1. Tratar estas URLs como temporales.
2. Permitir actualizarlas desde el panel.
3. Guardar la URL origen oficial.
4. Guardar si requiere token.
5. No asumir que puede reutilizarse indefinidamente.
6. Mostrar fecha de última actualización.
7. Permitir verificación manual.
8. Preparar el sistema para automatización futura.
9. No implementar scraping automático sin autorización.
10. Respetar condiciones de uso del proveedor.
11. Preferir embed oficial si la integración directa no está autorizada o es inestable.

---

# 11. Capillas iniciales conocidas

## Shalom World Prayer Chapel

Características:

- plataforma externa;
- adoración eucarística en vivo;
- stream HLS;
- varias calidades;
- enlace firmado o temporal;
- requiere actualización periódica;
- debe tener respaldo.

Página de origen:

```text
https://watch.shalomworld.org/
```

No guardar una URL temporal como si fuera definitiva.

---

## Convento de la Santísima Trinidad

Ubicación:

```text
Nitra, Eslovaquia
```

Stream HLS conocido:

```text
https://stream.csweb.sk/sspsap/sspsap.stream/chunklist_w1923307040.m3u8
```

Debe almacenarse en base de datos, no en código.

---

# 12. Panel administrativo de Capilla Virtual

El módulo administrativo debe organizarse en pestañas o secciones:

```text
Capillas
Streams
Configuración
Verificación
Historial
Peticiones de oración
Grupos de oración
Testimonios
```

## Capillas

Debe permitir:

- listar;
- buscar;
- crear;
- editar;
- activar;
- desactivar;
- marcar como principal;
- marcar como respaldo;
- definir prioridad;
- cargar imagen;
- registrar país;
- registrar ciudad;
- registrar sitio web;
- editar descripción.

## Streams

Debe permitir:

- filtrar por capilla;
- crear stream;
- editar stream;
- cambiar estado;
- elegir tipo;
- indicar calidad;
- pegar URL;
- registrar URL origen;
- marcar si requiere token;
- marcar si requiere referer;
- indicar referer;
- marcar stream principal;
- verificar stream;
- mostrar última verificación;
- mostrar error resumido.

## Configuración

Debe permitir:

- seleccionar capilla activa;
- seleccionar stream activo;
- seleccionar modo de reproducción;
- seleccionar calidad;
- activar o desactivar visualización de:
  - nombre;
  - país;
  - intenciones;
  - botón de radio;
- editar mensaje de carga;
- editar mensaje de error;
- activar o desactivar la Capilla Virtual.

## Verificación

Debe permitir:

- verificar un stream manualmente;
- mostrar:
  - respuesta;
  - fecha;
  - tipo;
  - estado;
  - error resumido;
- registrar el resultado en logs.

## Historial

Debe mostrar:

- fecha;
- usuario;
- capilla;
- stream;
- acción;
- detalle resumido.

---

# 13. Mensajes espirituales

Mientras carga:

```text
Señor Jesús, dispón mi corazón para encontrarte, adorarte y permanecer en tu presencia.
```

Si falla la transmisión:

```text
La transmisión se encuentra temporalmente fuera de servicio. Permanece en oración; Jesús sigue presente en todos los sagrarios del mundo.
```

Estos mensajes deben obtenerse desde configuración y no quedar quemados si ya existen campos para editarlos.

---

# 14. Reglas visuales del administrador

1. Mantener el estilo existente del panel.
2. No rehacer el menú lateral.
3. No cambiar la navegación global.
4. Organizar formularios largos por tarjetas.
5. Usar encabezados claros.
6. Mantener botones consistentes.
7. Mostrar estados mediante etiquetas.
8. Evitar saturación visual.
9. Mantener buen contraste.
10. Conservar diseño responsive.
11. No aplicar librerías nuevas de UI sin necesidad.
12. Reutilizar componentes existentes.

---

# 15. Seguridad

1. Validar permisos antes de cada acción administrativa.
2. Usar consultas preparadas.
3. Validar identificadores numéricos.
4. Sanitizar textos.
5. Escapar salida HTML.
6. Validar URLs.
7. Limitar tipos de stream permitidos.
8. No permitir JavaScript arbitrario en campos iframe.
9. Validar dominios cuando se usen iframes.
10. No mostrar datos sensibles.
11. Implementar protección CSRF si ya existe el patrón en el proyecto.
12. Mantener sesiones administrativas seguras.
13. No aceptar archivos sin validar extensión, MIME y tamaño.
14. No almacenar credenciales de terceros en campos visibles.

---

# 16. CRUD y formularios

Para cada CRUD:

1. Reutilizar el patrón existente.
2. Mantener filtros y búsqueda.
3. Confirmar acciones destructivas.
4. Preferir desactivar antes que eliminar.
5. Validar campos obligatorios.
6. Mostrar mensajes claros.
7. Conservar valores al ocurrir un error.
8. Evitar duplicados.
9. Registrar cambios importantes.
10. No mezclar lógica de vista y acceso a datos más de lo que ya haga la arquitectura actual.

---

# 17. Pruebas mínimas obligatorias

Para cualquier ajuste del módulo Capilla Virtual, comprobar:

## Capillas

- listado;
- búsqueda;
- creación;
- edición;
- activación;
- desactivación;
- selección principal;
- prioridad.

## Streams

- listado por capilla;
- creación;
- edición;
- URL válida;
- cambio de estado;
- selección principal;
- verificación;
- error controlado.

## Configuración

- selección de capilla activa;
- selección de stream activo;
- persistencia de opciones;
- mensajes;
- calidad;
- modo de reproducción.

## Vista pública

- carga de datos desde BD;
- HLS nativo;
- HLS.js;
- cambio de stream;
- fallback;
- error pastoral;
- responsive;
- no reproducción simultánea con radio.

## Seguridad

- usuario sin permisos;
- campos vacíos;
- ID inválido;
- URL inválida;
- contenido HTML;
- solicitud sin CSRF si aplica.

---

# 18. Instrucciones para análisis sin modificación

Cuando la tarea diga “analiza”, “revisa” o “diagnostica”:

1. No modificar archivos.
2. No crear tablas.
3. No ejecutar migraciones.
4. No hacer commit.
5. Entregar:
   - mapa de archivos;
   - flujo;
   - tablas;
   - consultas;
   - riesgos;
   - propuesta mínima;
   - orden recomendado.

---

# 19. Instrucciones para implementación

Cuando se autorice implementar:

1. Leer este archivo completo.
2. Revisar archivos relacionados.
3. Informar plan.
4. Modificar solo lo necesario.
5. No crear duplicados.
6. Ejecutar validaciones.
7. Mostrar diferencias importantes.
8. Entregar resumen final.

---

# 20. Formato de entrega obligatorio

Al terminar una tarea, responder con esta estructura:

## Resultado

Descripción breve del resultado.

## Archivos modificados

```text
ruta/archivo1.php
ruta/archivo2.js
ruta/archivo3.css
```

## Base de datos

Indicar:

- tablas consultadas;
- SQL ejecutado;
- migraciones pendientes;
- si no hubo cambios, decirlo expresamente.

## Pruebas realizadas

- prueba 1;
- prueba 2;
- prueba 3.

## Pendientes

- pendientes técnicos;
- decisiones del usuario;
- riesgos.

## Observaciones

Advertencias relevantes y recomendaciones.

---

# 21. Restricciones definitivas

Codex no debe:

- borrar datos;
- recrear tablas existentes;
- inventar rutas;
- hacer `push`;
- desplegar;
- cambiar credenciales;
- exponer secretos;
- modificar otros módulos;
- rehacer toda la interfaz;
- instalar dependencias innecesarias;
- crear APIs duplicadas;
- dejar URLs de streams quemadas;
- eliminar logs;
- aplicar migraciones destructivas;
- cambiar nombres de tablas sin autorización.

---

# 22. Prioridad actual del proyecto

La prioridad actual es completar el módulo Capilla Virtual en este orden:

1. revisar implementación existente;
2. conectar `lvj_capillas`;
3. conectar `lvj_capilla_streams`;
4. conectar `lvj_capilla_config`;
5. implementar verificación;
6. implementar logs;
7. conectar vista pública;
8. implementar HLS;
9. implementar respaldo;
10. integrar peticiones, grupos y testimonios dentro del mismo módulo administrativo.

No avanzar al siguiente punto sin comprobar el anterior.

---

# 23. Instrucción de inicio para Codex

Antes de cualquier trabajo en Capilla Virtual:

```text
Lee AGENTS.md completo.

Inspecciona el módulo Capilla Virtual actual.

No modifiques código todavía, salvo que la instrucción lo autorice expresamente.

Localiza:
- archivos;
- rutas;
- controladores;
- vistas;
- consultas;
- tablas;
- JavaScript;
- estilos;
- vista pública;
- URLs quemadas;
- patrón CRUD de otros módulos.

Entrega primero un diagnóstico y una propuesta de modificación mínima.
```