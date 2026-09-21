Warning: truncated output (original token count: 67014)
Total output lines: 13122

# AGENTS.md
# Proyecto La Voz de Jesús (LVJ)
## Manual Oficial de Arquitectura y Desarrollo
### Versión 2.1
**Estado:** Documento Maestro de Desarrollo  
**Última actualización:** Agosto de 2026  
**Proyecto:** La Voz de Jesús – Plataforma Católica Digital  
**Tipo de documento:** Arquitectura Oficial del Proyecto

---

# CAPÍTULO 1
# INTRODUCCIÓN

## 1.1 Propósito del documento

El presente documento constituye la **guía oficial de arquitectura, desarrollo, mantenimiento y evolución** del proyecto **La Voz de Jesús (LVJ)**.

Su propósito es establecer una única fuente de verdad (**Single Source of Truth**) para todo el proyecto, permitiendo que cualquier desarrollador humano o asistente de inteligencia artificial (Codex, ChatGPT u otros agentes) pueda comprender la arquitectura existente antes de realizar cualquier modificación.

Este documento no describe únicamente el código existente; también establece las reglas obligatorias que deberán seguirse durante el desarrollo futuro del sistema.

Toda implementación deberá respetar la arquitectura aquí definida.

Cuando exista una diferencia entre una implementación experimental y este documento, el desarrollador deberá verificar cuál representa el estado oficial del proyecto antes de realizar cambios.

---

# 1.2 Alcance

Este documento cubre la totalidad del ecosistema tecnológico de **La Voz de Jesús**, incluyendo:

- Arquitectura general del sistema.
- Base de datos.
- Backend.
- Frontend.
- Aplicación PWA.
- Panel Administrativo.
- APIs.
- Integraciones externas.
- Streaming de audio.
- Streaming de video.
- Capillas Virtuales.
- Liturgia.
- Biblia.
- Biblioteca.
- Comunidad.
- Publicidad.
- Donaciones.
- Seguridad.
- Rendimiento.
- Convenciones de programación.
- Reglas para Codex.
- Roadmap del proyecto.

Este documento deberá actualizarse cada vez que la arquitectura oficial del sistema cambie de manera significativa.

---

# 1.3 Filosofía del Proyecto

La Voz de Jesús no es simplemente una aplicación móvil.

Es una plataforma integral de evangelización cuyo propósito es acercar a las personas a Jesucristo mediante herramientas digitales modernas, manteniendo siempre la fidelidad doctrinal de la Iglesia Católica.

Cada módulo del sistema debe contribuir a alguno de estos objetivos:

- Evangelización.
- Formación.
- Vida sacramental.
- Adoración.
- Oración.
- Comunidad.
- Solidaridad.
- Comunicación.

Ninguna funcionalidad deberá apartarse de esta identidad.

---

# 1.4 Identidad del Proyecto

Nombre oficial:

**La Voz de Jesús**

Tipo:

Plataforma Católica Digital.

Componentes principales:

- Aplicación PWA.
- Sitio web.
- Panel Administrativo.
- Radio Online.
- Capilla Virtual.
- Biblioteca Católica.
- Comunidad.
- Recursos pastorales.

---

# 1.5 Objetivos

Los objetivos principales del proyecto son:

## Evangelización

Facilitar el encuentro personal con Jesucristo mediante recursos digitales.

## Formación

Proporcionar formación católica sólida y permanente.

## Oración

Ofrecer espacios de oración personal y comunitaria.

## Adoración

Permitir la participación en Capillas Virtuales de Adoración Perpetua.

## Comunicación

Servir como plataforma oficial de comunicación de la emisora.

## Comunidad

Fomentar una comunidad católica activa mediante grupos de oración, testimonios e intenciones.

---

# 1.6 Principios Fundamentales

Todo desarrollo deberá respetar los siguientes principios.

## Cristo al centro

Toda decisión técnica debe favorecer la misión evangelizadora.

---

## Simplicidad

La arquitectura debe ser clara.

Debe evitarse la duplicación de:

- código;
- tablas;
- APIs;
- componentes;
- lógica.

---

## Escalabilidad

Toda funcionalidad deberá diseñarse pensando en el crecimiento futuro del proyecto.

El sistema deberá poder incorporar nuevas funciones sin necesidad de rediseñar completamente la arquitectura existente.

---

## Modularidad

Cada módulo debe ser independiente.

Ejemplos:

- Radio
- Capilla
- Biblia
- Liturgia
- Biblioteca
- Comunidad

Cada uno debe poder evolucionar sin afectar a los demás.

---

## Reutilización

Antes de crear un nuevo componente deberán revisarse los existentes.

Nunca duplicar funcionalidades.

---

## Mantenibilidad

El código deberá ser fácilmente entendible.

Las responsabilidades deberán estar claramente separadas.

---

## Consistencia

La experiencia visual deberá mantenerse uniforme en toda la aplicación.

Los componentes compartidos deberán reutilizarse siempre que sea posible.

---

# 1.7 Visión del Proyecto

La visión de La Voz de Jesús es convertirse en una de las plataformas católicas digitales más completas para el mundo hispanohablante.

El crecimiento previsto incluye:

- Radio Católica Online.
- Capillas Virtuales.
- Lecturas del día.
- Liturgia completa.
- Biblia.
- Biblioteca digital.
- Comunidad.
- Grupos de oración.
- Testimonios.
- Podcasts.
- Cursos.
- Formación permanente.
- Eventos.
- Donaciones.
- Publicidad institucional.
- Recursos pastorales.
- Aplicaciones móviles.
- Plataforma web.

La arquitectura deberá permitir este crecimiento sin rediseños estructurales.

---

# 1.8 Alcance Técnico

El proyecto comprende:

Frontend

- PWA
- Responsive
- Mobile First

Backend

- PHP
- APIs REST
- MySQL

Infraestructura

- Hosting compartido
- Cloudflare
- GitHub
- Vercel (cuando aplique)

Streaming

- Audio
- Video
- HLS
- YouTube
- Iframe

Administración

- Panel Administrativo
- Configuración dinámica
- Gestión de contenidos

---

# 1.9 Documento Vivo

Este documento deberá evolucionar junto con el proyecto.

Cada cambio importante en la arquitectura deberá reflejarse aquí antes o inmediatamente después de implementarse.

No deberán mantenerse reglas obsoletas.

Las secciones desactualizadas deberán corregirse para que AGENTS.md continúe siendo la referencia oficial del sistema.

---

# 1.10 Uso Obligatorio por Codex

Antes de realizar cualquier modificación en el proyecto, Codex deberá:

1. Leer completamente AGENTS.md.
2. Comprender la arquitectura vigente.
3. Revisar la implementación existente.
4. Confirmar que no existe ya la funcionalidad solicitada.
5. Respetar las convenciones definidas en este documento.
6. Limitarse estrictamente al alcance de la tarea solicitada.
7. No realizar mejoras no autorizadas.
8. Informar cualquier inconsistencia encontrada entre el código y este documento.

El incumplimiento de estas reglas puede generar duplicación de código, pérdida de consistencia arquitectónica o modificaciones fuera del alcance solicitado.

---

# 1.11 Estado del Documento

Este documento constituye la referencia oficial de desarrollo del proyecto.

Toda nueva implementación deberá alinearse con la arquitectura aquí descrita.

Las siguientes secciones desarrollarán de forma detallada cada uno de los módulos, convenciones y reglas que conforman el ecosistema tecnológico de **La Voz de Jesús**.

---

**Fin del Capítulo 1**

# CAPÍTULO 2
# ARQUITECTURA GENERAL DEL SISTEMA

## 2.1 Objetivo

La arquitectura del proyecto **La Voz de Jesús (LVJ)** está diseñada bajo un modelo modular, escalable y desacoplado, permitiendo que cada componente evolucione de manera independiente sin afectar el funcionamiento del resto del sistema.

La arquitectura busca cumplir los siguientes principios:

- Escalabilidad.
- Reutilización.
- Modularidad.
- Seguridad.
- Facilidad de mantenimiento.
- Compatibilidad con hosting compartido.
- Alto rendimiento.
- Administración completamente dinámica.

Toda nueva funcionalidad deberá integrarse respetando esta arquitectura.

---

# 2.2 Arquitectura General

El flujo oficial del sistema es el siguiente:

```text
                USUARIO

                    │
                    ▼

          Aplicación PWA / Web

                    │
                    ▼

            Componentes React

                    │
                    ▼

             Servicios (API)

                    │
                    ▼

            Backend PHP (REST)

                    │
                    ▼

               Base de Datos

                    │
                    ▼

               Contenido LVJ
```

La PWA nunca accederá directamente a la base de datos.

Toda comunicación deberá realizarse mediante APIs del backend.

---

# 2.3 Arquitectura por Capas

El sistema está dividido en cinco capas principales.

## Capa 1 – Presentación

Responsable de la experiencia del usuario.

Componentes:

- PWA
- Sitio Web
- Panel Administrativo

Tecnologías:

- React
- Next.js
- TypeScript
- Tailwind CSS

Responsabilidades:

- Mostrar información.
- Capturar acciones del usuario.
- Consumir APIs.
- No contener lógica de negocio.

---

## Capa 2 – Servicios

Responsable de la comunicación entre el frontend y el backend.

Funciones:

- consumir APIs;
- validar respuestas;
- manejar errores;
- almacenar caché cuando sea necesario.

La lógica de negocio no debe implementarse aquí.

---

## Capa 3 – Backend

Tecnología oficial:

PHP

Responsabilidades:

- autenticación;
- autorización;
- validaciones;
- reglas de negocio;
- consultas SQL;
- respuestas JSON.

El backend es la única capa autorizada para acceder a MySQL.

---

## Capa 4 – Base de Datos

Tecnología:

MySQL

Responsabilidades:

- almacenar información;
- mantener integridad referencial;
- servir como fuente oficial de datos.

La base de datos nunca debe ser accedida directamente desde la PWA.

---

## Capa 5 – Recursos Externos

Incluye:

- Streams HLS
- YouTube
- Cloudflare
- FTP
- APIs externas
- Servicios de terceros

Todas las integraciones deberán pasar por el backend cuando sea necesario.

---

# 2.4 Arquitectura Modular

El sistema está dividido en módulos independientes.

Cada módulo deberá poder evolucionar sin afectar los demás.

Actualmente los módulos oficiales son:

```
LVJ

├── Inicio
├── Radio
├── Programación
├── Capilla Virtual
├── Liturgia
├── Biblia
├── Biblioteca
├── Comunidad
├── Podcast
├── Noticias
├── Donaciones
├── Publicidad
├── Configuración
├── Usuarios
└── Panel Administrativo
```

Cada módulo tendrá:

- sus tablas;
- sus APIs;
- sus componentes;
- su lógica.

Nunca mezclar responsabilidades.

---

# 2.5 Arquitectura de Datos

La información siempre deberá seguir este flujo:

```text
MySQL

↓

Backend PHP

↓

API JSON

↓

Frontend

↓

Renderizado
```

Nunca:

```text
React

↓

MySQL
```

---

# 2.6 Arquitectura API

Toda información será obtenida mediante APIs REST.

Características:

- JSON
- UTF-8
- Consultas preparadas
- Sin SQL embebido en el frontend

Ejemplo:

```text
GET

/api/capilla

↓

{
    success,
    data
}
```

---

# 2.7 Arquitectura del Frontend

El frontend debe cumplir las siguientes reglas:

No acceder directamente a MySQL.

No contener consultas SQL.

No escribir URLs HLS directamente.

No escribir IDs de configuración.

No contener lógica de negocio compleja.

Su función consiste únicamente en:

- solicitar información;
- mostrar información;
- enviar acciones del usuario.

---

# 2.8 Arquitectura del Backend

El backend será responsable de:

- autenticación;
- autorización;
- consultas;
- validaciones;
- reglas;
- auditoría;
- respuestas JSON.

Nunca devolverá información innecesaria.

---

# 2.9 Arquitectura de Configuración

Todo comportamiento configurable deberá almacenarse en la base de datos.

Ejemplos:

- emisora activa;
- capilla activa;
- stream activo;
- colores;
- publicidad;
- programación;
- textos dinámicos.

Evitar constantes escritas directamente en el código.

---

# 2.10 Arquitectura de Recursos Multimedia

Los recursos multimedia se clasifican en:

Audio

- Streaming
- Podcast
- Descargas

Video

- HLS
- YouTube
- MP4
- Iframe

Imágenes

- Logos
- Banners
- Fondos
- Galerías

Todos deberán administrarse desde el panel.

---

# 2.11 Arquitectura de Streaming

El sistema soportará múltiples tipos de transmisión.

Actualmente:

- HLS
- YouTube
- MP4
- Iframe

En el futuro podrá incorporar:

- WebRTC
- DASH
- RTMP

El reproductor decidirá automáticamente cómo reproducir cada fuente según su tipo.

Nunca según el nombre del archivo.

---

# 2.12 Arquitectura de Persistencia

Toda información importante deberá almacenarse en MySQL.

No utilizar archivos planos como almacenamiento principal.

No almacenar configuraciones críticas dentro del código.

---

# 2.13 Arquitectura de Integraciones

Las integraciones externas deberán mantenerse desacopladas.

Ejemplos:

Cloudflare

↓

Servicio independiente

FTP

↓

Servicio independiente

Streams

↓

Servicio independiente

Esto facilita cambiar proveedores sin modificar el resto del sistema.

---

# 2.14 Arquitectura Escalable

Todo nuevo módulo deberá respetar la estructura:

```text
Base de Datos

↓

Backend

↓

API

↓

Frontend

↓

Pantalla
```

Nunca:

```text
Pantalla

↓

Base de Datos
```

---

# 2.15 Arquitectura para Codex

Antes de implementar cualquier módulo, Codex deberá responder internamente las siguientes preguntas:

1. ¿Ya existe este módulo?

2. ¿Ya existe esta tabla?

3. ¿Ya existe esta API?

4. ¿Ya existe este componente?

5. ¿Ya existe esta funcionalidad?

Si la respuesta es "Sí", deberá reutilizar la implementación existente.

No crear duplicados.

---

# 2.16 Principios de Evolución

Toda nueva funcionalidad deberá cumplir:

- No romper módulos existentes.
- No duplicar lógica.
- No duplicar componentes.
- No duplicar APIs.
- No duplicar tablas.
- Mantener compatibilidad hacia atrás.
- Mantener el diseño visual existente.

---

# 2.17 Diagrama Oficial de Arquitectura

```text
                   USUARIO
                      │
                      ▼
        ┌─────────────────────────┐
        │     PWA / Sitio Web     │
        └─────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  React / Next.js / TS   │
        └─────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │     API REST (PHP)      │
        └─────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │        MySQL            │
        └─────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   Configuración   Contenidos   Multimedia
        │             │             │
        └─────────────┴─────────────┘
                      │
                      ▼
              Respuesta JSON
                      │
                      ▼
             Renderizado Final
```

---

# 2.18 Regla Fundamental

Toda implementación futura deberá respetar esta arquitectura.

Si una nueva funcionalidad requiere modificar la arquitectura oficial, primero deberá actualizarse **AGENTS.md** y posteriormente realizar la implementación.

AGENTS.md constituye la referencia oficial del proyecto.

---

**Fin del Capítulo 2**

# CAPÍTULO 3

# 3.1 Arquitectura de Base de Datos

## 3.1.1 Objetivo

La Base de Datos constituye el núcleo funcional del proyecto **La Voz de Jesús (LVJ)** y representa la **única fuente oficial de información** utilizada por la Aplicación PWA, el Sitio Web, el Panel Administrativo y los servicios internos del sistema.

Toda la información deberá almacenarse de forma estructurada, normalizada y reutilizable, evitando duplicidad de datos y facilitando la evolución del proyecto.

La arquitectura de datos ha sido diseñada para cumplir los siguientes objetivos:

- Garantizar la integridad de la información.
- Facilitar el crecimiento futuro del proyecto.
- Reducir la duplicidad de datos.
- Centralizar toda la configuración dinámica.
- Optimizar el rendimiento de las consultas.
- Facilitar el mantenimiento del sistema.
- Mantener compatibilidad con entornos de hosting compartido.
- Permitir la incorporación de nuevos módulos sin modificar la arquitectura existente.

La Base de Datos nunca debe convertirse en un conjunto de tablas aisladas; debe entenderse como un ecosistema modular donde cada entidad tiene una responsabilidad claramente definida.

---

# 3.1.2 Filosofía de Diseño

La arquitectura de la Base de Datos se fundamenta en los siguientes principios.

## Modularidad

Cada módulo funcional posee sus propias tablas y responsabilidades.

Ejemplo:

- Radio
- Capilla Virtual
- Liturgia
- Biblia
- Comunidad
- Biblioteca
- Publicidad

Cada módulo podrá evolucionar de forma independiente sin afectar a los demás.

---

## Normalización

Toda información deberá almacenarse una única vez.

Ejemplo:

Correcto

```
Capilla
    id = 3
```

Las demás tablas deberán relacionarse mediante:

```
capilla_id = 3
```

Nunca deberá repetirse información como:

- nombre de la capilla
- ciudad
- país
- URL del stream

en múltiples tablas.

---

## Configuración Dinámica

Toda configuración modificable deberá almacenarse en la Base de Datos.

Ejemplos:

- Capilla activa.
- Emisora activa.
- Stream activo.
- Colores.
- Banners.
- Mensajes.
- Programación.
- Horarios.
- Publicidad.

Nunca escribir configuraciones directamente en el código fuente.

---

## Escalabilidad

La Base de Datos debe permitir el crecimiento del proyecto sin necesidad de rediseñar las tablas existentes.

La incorporación de nuevos módulos deberá realizarse mediante nuevas tablas relacionadas, evitando modificaciones estructurales innecesarias.

---

## Bajo Acoplamiento

Las tablas deben depender lo menos posible unas de otras.

Cada entidad tendrá una responsabilidad claramente definida.

Ejemplo:

```
lvj_capillas
```

No almacena información del stream.

La información de reproducción pertenece exclusivamente a:

```
lvj_capilla_streams
```

---

## Alta Cohesión

Cada tabla deberá contener únicamente la información relacionada con su propósito.

No mezclar responsabilidades.

Ejemplo:

Incorrecto

```
lvj_capillas

Nombre
Ciudad
URL Stream
Horario
Publicidad
```

Correcto

```
lvj_capillas

Nombre
Ciudad
País
Descripción
```

Los Streams deberán almacenarse en su propia tabla.

---

# 3.1.3 Motor Oficial

El proyecto utilizará oficialmente:

## Motor

MySQL 8.x

Compatibilidad mínima

MariaDB 10.6

---

## Juego de caracteres

UTF8MB4

---

## Collation

utf8mb4_unicode_ci

---

## Zona horaria

La Base de Datos deberá almacenar las fechas en UTC cuando sea posible.

La conversión a la zona horaria del usuario será responsabilidad del Backend.

---

## Integridad

Toda la información deberá almacenarse utilizando transacciones cuando la operación afecte múltiples tablas relacionadas.

---

# 3.1.4 Convenciones Generales

## Prefijo Oficial

Todas las tablas utilizarán el prefijo:

```
lvj_
```

Ejemplos

```
lvj_capillas

lvj_capilla_streams

lvj_programacion

lvj_liturgia

lvj_biblia_libros
```

No crear tablas fuera de esta convención.

---

## Nombre de Tablas

Las tablas deberán utilizar nombres en plural.

Ejemplos

```
lvj_capillas

lvj_programas

lvj_testimonios

lvj_grupos
```

---

## Nombre de Columnas

Las columnas deberán escribirse en español.

Ejemplos

```
nombre

descripcion

estado

prioridad

fecha

imagen

audio

video

created_at

updated_at
```

Evitar abreviaturas innecesarias.

---

## Llaves Primarias

Toda tabla deberá poseer una llave primaria denominada:

```
id
```

---

## Llaves Foráneas

Las relaciones utilizarán el siguiente formato:

```
usuario_id

capilla_id

stream_id

programa_id

tema_id

categoria_id
```

Nunca utilizar nombres ambiguos.

---

# 3.1.5 Integridad Referencial

La integridad de la información constituye uno de los pilares del proyecto.

Siempre que sea posible deberán utilizarse claves foráneas.

Las relaciones deberán representar entidades reales.

Ejemplo

```
lvj_capillas

↓

lvj_capilla_streams

↓

lvj_capilla_config
```

Nunca almacenar relaciones utilizando texto libre.

Incorrecto

```
nombre_capilla
```

Correcto

```
capilla_id
```

---

## Validaciones

Toda consulta deberá verificar que las entidades relacionadas existan.

Ejemplo

Un stream activo deberá pertenecer a la capilla seleccionada.

Nunca asumir relaciones implícitas.

---

# 3.1.6 Auditoría

Las tablas administrables deberán incluir mecanismos de auditoría.

Siempre que sea posible incluir:

```
created_at

updated_at

deleted_at
```

Cuando la naturaleza del módulo lo requiera también podrán incluirse:

```
created_by

updated_by

deleted_by
```

---

## Eliminación Lógica

El proyecto prioriza la eliminación lógica.

Ejemplo

```
deleted_at DATETIME NULL
```

Los registros eliminados no deberán aparecer en consultas públicas.

Nunca eliminar físicamente información crítica sin respaldo.

---

## Historial

Los módulos sensibles podrán incorporar tablas específicas de auditoría.

Ejemplo

```
lvj_capilla_logs

lvj_radio_logs

lvj_admin_logs
```

Estas tablas permitirán registrar:

- cambios administrativos;
- errores;
- eventos;
- operaciones críticas;
- acciones automáticas.

---

# 3.1.7 Buenas Prácticas

Toda implementación deberá seguir las siguientes recomendaciones.

## Consultas Preparadas

Siempre utilizar Prepared Statements.

Nunca concatenar SQL.

---

## Índices

Crear índices únicamente cuando aporten mejoras reales al rendimiento.

Ejemplos

```
estado

fecha

prioridad

usuario_id

capilla_id
```

---

## Tipos de Datos

Utilizar siempre el tipo de dato más apropiado.

Evitar LONGTEXT cuando VARCHAR sea suficiente.

---

## Recursos Multimedia

Nunca almacenar imágenes, audios o videos dentro de MySQL.

La Base de Datos únicamente almacenará:

- URL
- Ruta
- Nombre del archivo
- Tipo
- Estado

Los archivos físicos residirán en:

- Servidor.
- Cloudflare.
- FTP.
- CDN.

---

## Configuración

Toda configuración dinámica deberá administrarse desde el Panel Administrativo.

Nunca escribir configuraciones directamente en el código fuente.

---

## Cambios Estructurales

Toda modificación de la Base de Datos deberá seguir el siguiente flujo:

1. Actualizar AGENTS.md.
2. Revisar dependencias.
3. Crear migración o script SQL.
4. Probar en desarrollo.
5. Documentar el cambio.
6. Implementar en producción.

---

# 3.1.8 Reglas para Codex

Antes de crear una nueva tabla o modificar una existente, Codex deberá verificar obligatoriamente:

1. ¿La tabla ya existe?
2. ¿Existe una tabla con la misma finalidad?
3. ¿Puede ampliarse una tabla existente?
4. ¿La modificación rompe relaciones actuales?
5. ¿La estructura propuesta respeta la arquitectura modular del proyecto?
6. ¿El cambio requiere actualizar este AGENTS.md?

Si cualquiera de estas preguntas tiene una respuesta afirmativa, deberá reutilizar la estructura existente o documentar la necesidad del cambio antes de implementarlo.

Está expresamente prohibido:

- Crear tablas duplicadas.
- Duplicar información entre tablas.
- Escribir configuraciones dinámicas directamente en el código.
- Crear relaciones mediante texto libre.
- Eliminar tablas sin autorización.
- Modificar nombres de tablas o columnas sin una migración documentada.
- Alterar la arquitectura de la Base de Datos sin actualizar previamente este documento.

Toda implementación deberá preservar la integridad, coherencia y escalabilidad del modelo de datos oficial del proyecto **La Voz de Jesús**.

# 3.2 Inventario General de la Base de Datos

## 3.2.1 Propósito

El presente inventario constituye el **índice oficial del Diccionario de Base de Datos** del proyecto **La Voz de Jesús (LVJ)**.

Su finalidad es organizar todas las tablas del sistema por módulos funcionales, permitiendo comprender rápidamente la estructura general de la Base de Datos antes de analizar cada tabla de forma individual.

Cada módulo representa un conjunto de tablas relacionadas que cumplen una responsabilidad específica dentro del ecosistema de la aplicación.

La organización modular facilita:

- La evolución independiente de cada componente.
- El mantenimiento del sistema.
- La reutilización de estructuras.
- La documentación técnica.
- La comprensión del modelo de datos por parte de nuevos desarrolladores.
- El trabajo de asistentes de inteligencia artificial como Codex.

Las tablas documentadas en este capítulo representan el estado oficial de la Base de Datos.

---

# 3.2.2 Organización General

La Base de Datos se encuentra organizada por módulos funcionales.

```text
BASE DE DATOS LVJ

│

├── Administración
├── Configuración
├── Capilla Virtual
├── Radio
├── Liturgia
├── Santoral
├── Biblia
├── Biblioteca
├── Formación
├── Comunidad
├── Economía
├── Publicidad
├── Podcast
├── FileServer
└── Legacy
```

Cada módulo posee sus propias tablas, relaciones y reglas de negocio.

Los módulos se comunican entre sí mediante claves foráneas y configuraciones compartidas, evitando la duplicidad de información.

---

# 3.2.3 Clasificación de Módulos

Los módulos del proyecto se clasifican según su responsabilidad funcional.

## Administración

Agrupa las tablas encargadas del funcionamiento interno del sistema.

Responsabilidades:

- Usuarios.
- Roles.
- Permisos.
- Auditoría.
- Seguridad.
- Registro de eventos.
- Administración general.

---

## Configuración

Contiene todas las configuraciones dinámicas de la plataforma.

Ejemplos:

- Configuración general.
- Configuración de la PWA.
- Configuración de la emisora.
- Configuración de la aplicación.
- Configuración visual.
- Parámetros globales.

Este módulo permite modificar el comportamiento del sistema sin realizar cambios en el código fuente.

---

## Capilla Virtual

Agrupa las tablas relacionadas con las transmisiones de adoración eucarística.

Incluye:

- Capillas.
- Streams.
- Configuración activa.
- Historial.
- Eventos técnicos.

Es uno de los módulos centrales del proyecto.

---

## Radio

Gestiona toda la programación y transmisión de la emisora.

Incluye:

- Programas.
- Programación.
- Parrilla.
- Horarios.
- Categorías.
- Streams.
- Recursos multimedia asociados.

---

## Liturgia

Gestiona el contenido litúrgico diario de la Iglesia.

Incluye:

- Lecturas.
- Evangelio.
- Salmo.
- Reflexión.
- Tiempo litúrgico.
- Temas.
- Recursos asociados.

---

## Santoral

Administra toda la información correspondiente al calendario de santos.

Incluye:

- Santos.
- Memorias.
- Fiestas.
- Solemnidades.
- Beatos.
- Mártires.
- Celebraciones propias.

Este módulo se encuentra relacionado con Liturgia, pero mantiene independencia funcional.

---

## Biblia

Contiene toda la estructura necesaria para administrar las diferentes versiones bíblicas.

Incluye:

- Versiones.
- Libros.
- Capítulos.
- Versículos.
- Planes de lectura.
- Favoritos.
- Notas personales.

---

## Biblioteca

Administra los recursos digitales disponibles para consulta o descarga.

Ejemplos:

- Libros.
- Documentos.
- Revistas.
- Recursos pastorales.
- Archivos PDF.
- Material audiovisual.

---

## Formación

Agrupa los recursos destinados al crecimiento espiritual y doctrinal.

Incluye:

- Cursos.
- Lecciones.
- Evaluaciones.
- Progreso.
- Certificados.
- Recursos complementarios.

---

## Comunidad

Gestiona la interacción entre los usuarios de la plataforma.

Incluye:

- Grupos.
- Intenciones.
- Testimonios.
- Comentarios.
- Favoritos.
- Participación comunitaria.

---

## Economía

Agrupa toda la información relacionada con la sostenibilidad económica del proyecto.

Incluye:

- Donaciones.
- Campañas.
- Benefactores.
- Historial de aportes.
- Recursos financieros.

---

## Publicidad

Administra los espacios publicitarios y campañas institucionales.

Incluye:

- Campañas.
- Banners.
- Posiciones.
- Estadísticas.
- Vigencias.

---

## Podcast

Gestiona el contenido de audio distribuido bajo demanda.

Incluye:

- Episodios.
- Series.
- Categorías.
- Archivos multimedia.
- Estadísticas.

---

## FileServer

Administra el almacenamiento de archivos del proyecto.

Incluye:

- Carpetas.
- Archivos.
- Versiones.
- Permisos.
- Historial de cambios.

Este módulo centraliza el acceso a recursos almacenados en servidores FTP o servicios externos.

---

## Legacy

Agrupa las tablas heredadas de versiones anteriores del proyecto.

Estas tablas no deberán utilizarse para nuevos desarrollos, salvo cuando sea estrictamente necesario por razones de compatibilidad o migración.

Toda tabla marcada como Legacy deberá documentar claramente su estado y plan de reemplazo.

---

# 3.2.4 Estado de los Módulos

Cada módulo deberá clasificarse utilizando uno de los siguientes estados:

🟢 Producción

El módulo se encuentra operativo y es utilizado por la aplicación.

🟡 En desarrollo

El módulo está siendo implementado y puede sufrir cambios estructurales.

🔵 Planeado

El módulo forma parte del diseño oficial, pero aún no ha sido desarrollado.

🔴 Legacy

El módulo corresponde a implementaciones anteriores y no debe utilizarse para nuevos desarrollos.

---

# 3.2.5 Estructura del Diccionario

A partir de la siguiente sección, cada módulo será documentado siguiendo un formato uniforme.

Cada tabla deberá incluir como mínimo la siguiente información:

- Nombre de la tabla.
- Propósito.
- Estado.
- Responsabilidad.
- Relaciones.
- Campos principales.
- Índices.
- Consumida por.
- Reglas de negocio.
- Observaciones.
- Restricciones.

Esta estructura garantiza que toda la Base de Datos permanezca correctamente documentada y facilite su mantenimiento a largo plazo.

---

# 3.2.6 Orden Oficial del Diccionario

El Diccionario Oficial de Base de Datos se desarrollará siguiendo el siguiente orden:

1. Administración
2. Configuración
3. Capilla Virtual
4. Radio
5. Liturgia
6. Santoral
7. Biblia
8. Biblioteca
9. Formación
10. Comunidad
11. Economía
12. Publicidad
13. Podcast
14. FileServer
15. Legacy

Este orden deberá mantenerse en futuras actualizaciones del documento para conservar la consistencia de la documentación técnica.

---

# 3.2.7 Regla para Codex

Antes de crear una nueva tabla o modificar una existente, Codex deberá identificar el módulo funcional al que pertenece.

No está permitido crear tablas fuera de los módulos oficialmente definidos en este capítulo sin una actualización previa de AGENTS.md.

Si una nueva funcionalidad requiere un módulo completamente nuevo, este deberá documentarse primero en el Inventario General de la Base de Datos antes de iniciar su implementación.

# 3.3 Diccionario Oficial de Datos – Módulo Administración

## 3.3.1 Objetivo

El presente apartado documenta todas las tablas pertenecientes al módulo **Administración** del proyecto **La Voz de Jesús (LVJ)**.

El módulo de Administración constituye el núcleo operativo del sistema y concentra las tablas relacionadas con:

- Administración de usuarios.
- Roles y permisos.
- Auditoría.
- Seguridad.
- Configuración administrativa.
- Registro de eventos.
- Control de acceso.
- Parámetros internos del sistema.

Toda tabla perteneciente a este módulo deberá documentarse siguiendo el formato definido en esta sección.

---

# 3.3.2 Estándar Oficial de Documentación

A partir de este punto, todas las tablas del Diccionario Oficial de Base de Datos deberán documentarse utilizando exactamente la siguiente estructura.

---

## Nombre de la tabla

Corresponde al nombre físico de la tabla en MySQL.

Ejemplo

```
lvj_capillas
```

---

## Estado

Indica el nivel de madurez de la tabla.

Valores permitidos

🟢 Producción

🟡 En desarrollo

🔵 Planeada

🔴 Legacy

---

## Propósito

Describe de manera breve la finalidad de la tabla.

Debe responder a la pregunta:

¿Para qué existe esta tabla?

---

## Responsabilidad

Describe la responsabilidad exclusiva de la tabla.

Debe responder a la pregunta:

¿Qué información administra?

Cada tabla deberá tener una única responsabilidad.

Nunca mezclar responsabilidades diferentes dentro de la misma tabla.

---

## Módulo

Indica el módulo funcional al que pertenece.

Ejemplo

Administración

Capilla Virtual

Liturgia

Biblia

Radio

Comunidad

---

## Dependencias

Indica de qué tablas depende.

Ejemplo

```
lvj_capillas

↓

lvj_capilla_streams
```

---

## Tablas Relacionadas

Lista las tablas con las cuales mantiene relaciones directas.

Ejemplo

```
lvj_capilla_streams

lvj_capilla_config

lvj_capilla_logs
```

---

## Campos Principales

No se pretende documentar absolutamente todos los campos.

Se documentarán únicamente aquellos que representan la lógica principal.

Ejemplo

```
id

nombre

estado

prioridad

created_at

updated_at
```

Cuando una tabla sea especialmente compleja podrá documentarse la totalidad de sus columnas.

---

## Llaves

Documentar:

Llave primaria

Llaves foráneas

Índices relevantes

Ejemplo

```
PK

id

FK

capilla_id

usuario_id

Índices

estado

prioridad
```

---

## Consumida por

Indica qué componentes utilizan la tabla.

Ejemplo

✓ Panel Administrativo

✓ API

✓ Frontend

✓ PWA

✓ Reproductor

✓ Cron

✓ Health Check

---

## Reglas de Negocio

Describe las reglas que deben cumplirse.

Ejemplo

Un Stream únicamente puede pertenecer a una Capilla.

Nunca podrá existir un Stream sin Capilla.

---

## Restricciones

Define aquello que está prohibido.

Ejemplo

No almacenar URLs de reproducción en esta tabla.

No duplicar información existente en otras tablas.

---

## Observaciones

Incluye información técnica adicional.

Ejemplo

Tabla preparada para futuras ampliaciones.

No utilizada por la aplicación pública.

Migración pendiente.

---

## Estado de Implementación

Documenta el uso actual de la tabla.

Ejemplo

Utilizada por:

✓ Panel Administrativo

✓ API Pública

✗ Aplicación móvil

✗ Cron

---

# 3.3.3 Convenciones del Diccionario

Todas las tablas deberán documentarse siguiendo exactamente este formato.

No alterar el orden de las secciones.

No omitir información relevante.

Cuando una sección no aplique deberá indicarse expresamente:

"No aplica."

Esto garantiza uniformidad en toda la documentación técnica del proyecto.

---

# 3.3.4 Reglas para Codex

Antes de crear una nueva tabla o modificar una existente, Codex deberá consultar este Diccionario Oficial.

Si la tabla ya se encuentra documentada:

- deberá respetar su propósito;
- no deberá modificar su responsabilidad;
- no deberá reutilizarla para funciones distintas;
- no deberá cambiar su nombre sin una migración documentada;
- no deberá alterar sus relaciones sin actualizar previamente AGENTS.md.

Cuando se cree una nueva tabla, será obligatorio actualizar este Diccionario antes de considerarla parte de la arquitectura oficial del proyecto.

---

# 3.4 Diccionario Oficial de Datos – Configuración

## 3.4.1 Objetivo

El módulo **Configuración** constituye el centro de control operativo de la plataforma **La Voz de Jesús (LVJ)**.

Su finalidad es centralizar todas las configuraciones dinámicas del sistema, permitiendo que el comportamiento de la aplicación pueda modificarse desde el Panel Administrativo sin necesidad de realizar cambios en el código fuente.

Toda configuración que pueda variar durante la operación normal del sistema deberá almacenarse en este módulo.

El objetivo principal es desacoplar la configuración del código y garantizar que el sistema sea flexible, escalable y fácilmente administrable.

---

# 3.4.2 Alcance

El módulo de Configuración administra todos los parámetros globales de la plataforma.

Entre ellos:

- Configuración General.
- Configuración de la Aplicación.
- Configuración de la PWA.
- Configuración de la Radio.
- Configuración de la Capilla Virtual.
- Configuración de la Liturgia.
- Configuración de la Biblia.
- Configuración de Publicidad.
- Configuración de Donaciones.
- Configuración de Redes Sociales.
- Configuración de Notificaciones.
- Parámetros internos del sistema.

---

# 3.4.3 Principios del Módulo

Toda configuración deberá cumplir los siguientes principios.

## Configuración Dinámica

Toda configuración deberá almacenarse en MySQL.

Nunca escribir valores configurables directamente en:

- PHP.
- React.
- TypeScript.
- JavaScript.
- CSS.

---

## Fuente Oficial

La Base de Datos constituye la única fuente oficial de configuración.

Los archivos del proyecto nunca deberán convertirse en el lugar donde se administren parámetros de funcionamiento.

---

## Administración Centralizada

Toda configuración deberá ser administrable desde el Panel Administrativo.

No deberán existir configuraciones que únicamente puedan modificarse editando archivos del proyecto.

---

## Configuración Modular

Cada módulo podrá tener su propia tabla de configuración.

Ejemplo:

```
Configuración General

↓

Configuración Radio

↓

Configuración Capilla

↓

Configuración Liturgia

↓

Configuración Biblia
```

---

# 3.4.4 Inventario del Módulo

El módulo Configuración podrá estar compuesto por tablas similares a las siguientes (según la implementación oficial del proyecto):

- Configuración General.
- Configuración de la Aplicación.
- Configuración de la PWA.
- Configuración de la Radio.
- Configuración de la Capilla Virtual.
- Configuración de Redes Sociales.
- Configuración de Publicidad.
- Configuración de Donaciones.
- Configuración de Notificaciones.
- Configuración Visual.

Cada una de estas tablas deberá documentarse individualmente utilizando el formato oficial del Diccionario de Datos.

---

# 3.4.5 Tipos de Configuración

Las configuraciones podrán clasificarse en las siguientes categorías.

## Configuración Global

Controla el comportamiento general de la plataforma.

Ejemplos:

- Nombre de la aplicación.
- Logo institucional.
- Colores.
- Idioma.
- Zona horaria.
- Datos institucionales.

---

## Configuración Funcional

Controla el comportamiento de un módulo específico.

Ejemplos:

- Capilla activa.
- Stream activo.
- Emisora activa.
- Programación automática.

---

## Configuración Visual

Controla la apariencia de la aplicación.

Ejemplos:

- Banners.
- Logos.
- Colores.
- Imágenes institucionales.
- Pantallas especiales.

---

## Configuración Operativa

Permite activar o desactivar funcionalidades.

Ejemplos:

- Mostrar donaciones.
- Mostrar publicidad.
- Activar comunidad.
- Activar podcasts.
- Activar biblioteca.

---

# 3.4.6 Reglas Generales

Toda configuración deberá:

- poder modificarse sin recompilar la aplicación;
- ser persistente;
- almacenarse en MySQL;
- administrarse desde el Panel Administrativo;
- documentarse en este AGENTS.md.

No deberán existir configuraciones ocultas dentro del código.

---

# 3.4.7 Relaciones

El módulo Configuración mantiene relación con prácticamente todos los módulos del sistema.

Ejemplo:

```
Configuración

│

├── Aplicación

├── Radio

├── Capilla Virtual

├── Liturgia

├── Biblia

├── Comunidad

├── Publicidad

├── Donaciones

└── Notificaciones
```

Las configuraciones deberán ser consumidas por las APIs correspondientes y nunca directamente por el Frontend.

---

# 3.4.8 Consumida por

El módulo Configuración podrá ser utilizado por:

✓ Panel Administrativo

✓ Backend

✓ APIs REST

✓ PWA

✓ Sitio Web

✓ Servicios programados

✓ Integraciones externas

---

# 3.4.9 Restricciones

Está expresamente prohibido:

- Escribir configuraciones directamente en el código.
- Duplicar parámetros de configuración en diferentes tablas.
- Mantener configuraciones paralelas en archivos JSON o PHP cuando ya existan en MySQL.
- Permitir que el Frontend modifique configuraciones directamente en la Base de Datos.
- Crear nuevas tablas de configuración sin documentarlas previamente en AGENTS.md.

---

# 3.4.10 Reglas para Codex

Antes de crear una nueva tabla de configuración, Codex deberá verificar:

1. ¿Ya existe una tabla que almacene esa configuración?
2. ¿Puede ampliarse una tabla existente?
3. ¿La configuración pertenece realmente a un módulo ya documentado?
4. ¿El cambio mantiene la arquitectura modular del proyecto?

Si existe una estructura equivalente, deberá reutilizarla.

No crear tablas de configuración duplicadas.

Toda nueva tabla deberá incorporarse al Diccionario Oficial de Base de Datos antes de considerarse parte de la arquitectura del sistema.

---

# 3.4.11 Estado del Módulo

El módulo **Configuración** constituye uno de los componentes estratégicos del proyecto.

Todas las configuraciones futuras deberán centralizarse en este módulo, garantizando una administración unificada, consistente y completamente desacoplada del código fuente.

Las tablas que conforman este módulo se documentarán individualmente en los apartados siguientes, siguiendo el estándar oficial definido en el presente capítulo.

# 3.5 Diccionario Oficial de Datos – Módulo Capilla Virtual

## 3.5.1 Objetivo

El módulo **Capilla Virtual** constituye uno de los componentes principales del proyecto **La Voz de Jesús (LVJ)**.

Su finalidad es administrar completamente las transmisiones de adoración eucarística disponibles para la aplicación, permitiendo que la reproducción del video se gestione de forma totalmente dinámica desde la Base de Datos y el Panel Administrativo.

La arquitectura del módulo fue diseñada para soportar múltiples capillas, múltiples transmisiones por capilla, diferentes tecnologías de streaming y futuras estrategias de redundancia sin modificar el código de la aplicación.

Toda la información relacionada con la Capilla Virtual deberá administrarse desde este módulo.

---

# 3.5.2 Objetivos Funcionales

El módulo deberá permitir:

- Registrar múltiples capillas.
- Registrar múltiples streams para cada capilla.
- Seleccionar dinámicamente la capilla activa.
- Seleccionar dinámicamente el stream activo.
- Cambiar la transmisión sin actualizar la aplicación.
- Incorporar nuevas capillas sin modificar el código.
- Administrar prioridades de reproducción.
- Preparar el sistema para mecanismos futuros de redundancia (Fallback).

---

# 3.5.3 Arquitectura General

El flujo oficial del módulo es el siguiente.

```text
Usuario

↓

Pantalla Capilla

↓

API Capilla

↓

lvj_capilla_config

↓

lvj_capillas

↓

lvj_capilla_streams

↓

Reproductor

↓

Video
```

La pantalla pública nunca deberá seleccionar directamente una capilla ni un stream.

Toda la selección deberá realizarse utilizando la configuración almacenada en:

```
lvj_capilla_config
```

---

# 3.5.4 Arquitectura de Tablas

El módulo está compuesto por cuatro tablas principales.

```
lvj_capillas

↓

lvj_capilla_streams

↓

lvj_capilla_config

↓

lvj_capilla_logs
```

Cada una posee una responsabilidad específica.

---

# 3.5.5 Tabla: lvj_capillas

## Propósito

Representa una Capilla de Adoración disponible dentro del sistema.

No representa una transmisión.

Representa el lugar físico o comunidad religiosa.

---

## Responsabilidad

Administrar exclusivamente la información institucional de cada capilla.

Ejemplos

- nombre
- descripción
- país
- ciudad
- comunidad religiosa
- imágenes
- logotipo
- sitio web

Nunca deberá almacenar información relacionada con la reproducción.

---

## Consumida por

✓ Panel Administrativo

✓ API Capilla

✓ Aplicación PWA

✓ Sitio Web

---

## Relaciones

```
lvj_capillas.id

↓

lvj_capilla_streams.capilla_id

↓

lvj_capilla_config.capilla_activa_id
```

---

# 3.5.6 Tabla: lvj_capilla_streams

## Propósito

Administrar todas las fuentes de transmisión asociadas a una capilla.

Una misma capilla podrá poseer uno o varios streams.

---

## Responsabilidad

Almacenar únicamente información relacionada con la reproducción.

Ejemplos

- tipo_stream
- url_stream
- calidad
- prioridad
- estado
- es_principal
- requiere_token
- requiere_referer
- url_origen

---

## Relaciones

```
lvj_capillas

1

↓

N

lvj_capilla_streams
```

---

## Tipos soportados

Actualmente el sistema soporta:

- hls
- youtube
- iframe
- mp4

La incorporación de nuevos tipos deberá documentarse previamente en AGENTS.md.

---

## Prioridad

La columna

```
prioridad
```

define el orden preferido de utilización de los streams pertenecientes a una misma capilla.

Ejemplo

```
Prioridad 1

↓

HLS Oficial

Prioridad 2

↓

YouTube

Prioridad 3

↓

MP4
```

Un número menor representa mayor prioridad.

No existe una columna denominada:

```
orden_fallback
```

La prioridad será utilizada también para futuras estrategias de respaldo.

---

## Stream Principal

La columna

```
es_principal
```

identifica el stream principal de una capilla.

Cada capilla podrá tener un único stream principal.

Dos capillas diferentes podrán tener cada una su propio stream principal.

---

## Restricciones

Nunca almacenar streams directamente en:

```
lvj_capillas
```

Toda información de reproducción pertenece exclusivamente a:

```
lvj_capilla_streams
```

---

# 3.5.7 Tabla: lvj_capilla_config

## Propósito

Controlar qué capilla y qué stream deben mostrarse actualmente en la aplicación.

Esta tabla constituye el punto de entrada del módulo.

---

## Responsabilidad

Administrar:

- capilla activa
- stream activo
- modo de reproducción
- calidad
- mensajes
- opciones visuales

---

## Flujo

Siempre deberá consultarse primero esta tabla.

```
lvj_capilla_config

↓

capilla_activa_id

↓

stream_activo_id
```

---

## Regla Fundamental

La aplicación nunca deberá seleccionar directamente un stream.

Siempre deberá utilizar:

```
stream_activo_id
```

---

# 3.5.8 Tabla: lvj_capilla_logs

## Propósito

Registrar los eventos técnicos relacionados con el funcionamiento del módulo.

---

## Ejemplos

- cambios administrativos;
- errores;
- fallos de reproducción;
- cambios automáticos;
- verificaciones;
- eventos futuros de fallback.

---

## Consumida por

Panel Administrativo

Servicios internos

Herramientas de monitoreo

---

# 3.5.9 Relaciones Generales

```
lvj_capillas

│

├───────────────┐

│               │

▼               ▼

lvj_capilla_streams

               │

               ▼

lvj_capilla_config

               │

               ▼

Pantalla Pública

               │

               ▼

Reproductor
```

---

# 3.5.10 Flujo Oficial de Reproducción

Toda reproducción deberá seguir exactamente el siguiente flujo.

```
Usuario

↓

Pantalla Capilla

↓

API

↓

lvj_capilla_config

↓

lvj_capillas

↓

lvj_capilla_streams

↓

Reproductor

↓

Video
```

Nunca modificar este orden.

---

# 3.5.11 Reglas de Reproducción

El reproductor decidirá automáticamente la tecnología utilizada según:

```
tipo_stream
```

Ejemplos

HLS

↓

Video HTML5 + HLS nativo

↓

hls.js

YouTube

↓

iframe

MP4

↓

Video HTML5

Iframe

↓

iframe

Nunca decidir la reproducción utilizando el nombre del stream.

---

# 3.5.12 Streams Oficiales Actuales

Actualmente el sistema administra las siguientes transmisiones.

### Shalom World Prayer Chapel

Tipo

HLS

Administrado desde:

```
lvj_capilla_streams
```

---

### Convento de la Santísima Trinidad

Comunidad

Siervas del Espíritu Santo de la Adoración Perpetua

Ubicación

Nitra, Eslovaquia

Tipo

HLS

Administrado desde:

```
lvj_capilla_streams
```

Las URLs oficiales deberán almacenarse únicamente en la Base de Datos.

Nunca deberán escribirse directamente en el código.

---

# 3.5.13 Estrategia de Fallback (Planeada)

La primera versión del sistema utilizará únicamente el stream definido en:

```
stream_activo_id
```

En versiones futuras se implementará un sistema de recuperación automática.

El algoritmo previsto será:

```
Stream Prioridad 1

↓

Disponible

↓

Sí

↓

Reproducir

↓

No

↓

Prioridad 2

↓

No

↓

Prioridad 3
```

Esta funcionalidad aún no forma parte de la versión actual.

---

# 3.5.14 Reglas para Codex

Antes de modificar el módulo Capilla Virtual, Codex deberá verificar:

1. La estructura actual de las cuatro tablas oficiales.
2. Las relaciones existentes.
3. La configuración activa.
4. El tipo de stream.
5. La prioridad.
6. El estado del stream.

Está prohibido:

- escribir URLs HLS directamente en el código;
- crear nuevas tablas para reproducción sin justificación;
- almacenar información del stream en `lvj_capillas`;
- seleccionar manualmente un stream desde el Frontend;
- modificar el orden oficial del flujo de reproducción.

Toda modificación deberá preservar la arquitectura oficial del módulo descrita en este documento.

# 3.6 Diccionario Oficial de Datos – Módulos de Contenido

## 3.6.1 Objetivo

Los módulos de contenido constituyen el núcleo evangelizador de la plataforma **La Voz de Jesús (LVJ)**.

Su finalidad es administrar todos los recursos pastorales, litúrgicos, bíblicos, formativos y audiovisuales que son presentados a los usuarios mediante la Aplicación PWA, el Sitio Web y la Emisora.

Estos módulos comparten una misma filosofía arquitectónica, por lo que se documentan conjuntamente dentro del presente capítulo.

Su diseño busca garantizar:

- Organización estructurada del contenido.
- Facilidad de administración.
- Reutilización de información.
- Escalabilidad.
- Integración entre módulos.
- Consistencia editorial.

---

# 3.6.2 Módulos que conforman el Sistema de Contenidos

El Sistema de Contenidos está compuesto por los siguientes módulos:

```
Sistema de Contenidos

│

├── Radio
├── Liturgia
├── Santoral
├── Biblia
├── Biblioteca
├── Formación
└── Podcast
```

Cada módulo mantiene independencia funcional, pero comparte una arquitectura común.

---

# 3.6.3 Arquitectura General

Los módulos de contenido seguirán uno de los dos flujos autorizados de ingreso, conservando siempre a MySQL como fuente oficial para la aplicación pública.

## Flujo editorial manual

```text
Panel Administrativo

↓

Backend PHP

↓

Base de Datos

↓

API

↓

Aplicación

↓

Usuario
```

## Flujo automático autorizado

```text
Proveedor externo autorizado o servicio interno

↓

Adaptador y proceso PHP

↓

Validación, normalización y auditoría

↓

Base de Datos

↓

API

↓

Aplicación

↓

Usuario
```

El contenido nunca será administrado directamente desde la aplicación pública.

Las modificaciones podrán originarse en el Panel Administrativo o en procesos internos autorizados. Todo proceso automático deberá ejecutarse exclusivamente desde el Backend, registrar su resultado, respetar los bloqueos editoriales y permitir supervisión desde el Panel Administrativo.

La PWA nunca consumirá directamente credenciales, bases de datos ni proveedores externos protegidos.

---

# 3.6.4 Principios

Los módulos de contenido deberán cumplir los siguientes principios.

## Contenido Centralizado

Toda la información deberá almacenarse en la Base de Datos.

Nunca escribir textos pastorales directamente en el código.

---

## Separación de Responsabilidades

Cada módulo administrará únicamente su propio contenido.

Ejemplos

Radio

↓

Programación

Liturgia

↓

Lecturas

Biblia

↓

Versículos

Biblioteca

↓

Documentos

Podcast

↓

Episodios

Nunca mezclar responsabilidades.

---

## Reutilización

Cuando un contenido pueda utilizarse en varios módulos deberá almacenarse una única vez.

Ejemplo

Una imagen institucional no deberá duplicarse en varias tablas.

---

## Escalabilidad

Cada módulo deberá permitir la incorporación de nuevos contenidos sin modificar la estructura existente.

---

# 3.6.5 Módulo Radio

## Propósito

Administrar toda la programación de la emisora.

Incluye:

- Programas.
- Programación.
- Horarios.
- Categorías.
- Streams.
- Recursos multimedia asociados.

---

## Consumido por

✓ PWA

✓ Sitio Web

✓ Panel Administrativo

✓ API Radio

---

# 3.6.6 Módulo Liturgia

## Propósito

Administrar, sincronizar, enriquecer y publicar el contenido litúrgico diario correspondiente a Colombia.

La **Conferencia Episcopal de Colombia (CEC), mediante el Ordo Colombiano y la integración autorizada**, constituye la fuente oficial de las lecturas y del contexto litúrgico colombiano utilizado por LVJPRAYER.

Incluye:

- Fecha y celebración litúrgica.
- Tiempo, semana, ciclo y color litúrgico.
- Primera lectura.
- Salmo responsorial y estribillo.
- Segunda lectura cuando corresponda.
- Aclamación antes del Evangelio.
- Evangelio.
- Referencias y alternativas litúrgicas cuando la fuente las proporcione.
- Reflexión pastoral propia de LVJPRAYER generada mediante IA.
- Lectio Divina propia de LVJPRAYER generada mediante IA.
- Pregunta para meditar.
- Oración.
- Contemplación.
- Compromiso.
- Frase bíblica destacada.
- Recursos gráficos y multimedia.

El Santoral continuará como módulo independiente y no forma parte del alcance inicial de la sincronización automática de Liturgia.

---

## Consumido por

✓ Liturgia del Día

✓ Home

✓ API Liturgia

✓ Panel Administrativo

✓ Procesos programados de sincronización

✓ Centro de Formación y Supervisión IA

✓ Radio y Podcast cuando exista una integración autorizada

---

# 3.6.7 Módulo Santoral

## Propósito

Administrar toda la información correspondiente a los santos del calendario litúrgico.

Incluye:

- Santos.
- Beatos.
- Mártires.
- Memorias.
- Fiestas.
- Solemnidades.

El Santoral mantiene relación directa con Liturgia, pero constituye un módulo independiente.

---

# 3.6.8 Módulo Biblia

## Propósito

Administrar las distintas versiones bíblicas utilizadas por la plataforma.

Incluye:

- Versiones.
- Libros.
- Capítulos.
- Versículos.
- Planes de lectura.
- Favoritos.
- Notas.

Las versiones bíblicas deberán mantenerse independientes entre sí.

Nunca mezclar versículos de distintas traducciones dentro de una misma tabla.

---

# 3.6.9 Módulo Biblioteca

## Propósito

Administrar todos los recursos documentales de la plataforma.

Incluye:

- Libros.
- Documentos.
- Revistas.
- Manuales.
- Recursos pastorales.
- Material audiovisual.

---

## Consumido por

✓ Biblioteca

✓ Formación

✓ Recursos Pastorales

---

# 3.6.10 Módulo Formación

## Propósito

Administrar todos los contenidos educativos de la plataforma.

Incluye:

- Cursos.
- Lecciones.
- Material complementario.
- Evaluaciones.
- Seguimiento.
- Certificados.

---

## Consumido por

✓ Escuela Virtual

✓ Formación Permanente

✓ Panel Administrativo

---

# 3.6.11 Módulo Podcast

## Propósito

Administrar todo el contenido de audio distribuido bajo demanda.

Incluye:

- Series.
- Episodios.
- Categorías.
- Recursos multimedia.
- Estadísticas.

---

## Consumido por

✓ PWA

✓ Sitio Web

✓ API Podcast

---

# 3.6.12 Relaciones Generales

```
Liturgia

│

├── Santoral

├── Biblia

└── Recursos


Radio

│

├── Programación

├── Podcast

└── Multimedia


Biblioteca

│

├── Formación

└── Recursos Pastorales
```

Cada módulo mantiene independencia funcional, pero puede compartir información mediante claves foráneas y relaciones documentadas.

---

# 3.6.13 Reglas Generales

Todos los módulos de contenido deberán cumplir las siguientes reglas:

- El contenido será administrado desde el Panel Administrativo o mediante procesos internos autorizados, validados y auditados por el Backend.
- La aplicación pública únicamente consumirá información mediante APIs.
- No escribir textos directamente en el código.
- No duplicar contenido entre módulos.
- Utilizar imágenes, audios y videos mediante referencias almacenadas en la Base de Datos.
- Mantener la integridad entre los recursos asociados.

---

# 3.6.14 Reglas para Codex

Antes de crear una nueva tabla de contenido, Codex deberá verificar:

1. ¿El contenido pertenece a uno de los módulos existentes?
2. ¿Puede reutilizar una tabla ya implementada?
3. ¿Existe una relación documentada para ese recurso?
4. ¿La nueva estructura mantiene la arquitectura modular?

No crear módulos de contenido paralelos.

Toda nueva tabla deberá incorporarse previamente al Diccionario Oficial de Base de Datos.

---

# 3.6.15 Estado del Módulo

El Sistema de Contenidos constituye uno de los pilares funcionales de **La Voz de Jesús**.

Cada uno de los módulos descritos anteriormente será documentado individualmente en los apartados siguientes del Diccionario Oficial de Base de Datos, detallando sus tablas, relaciones, reglas de negocio y responsabilidades específicas.

# 3.7 Diccionario Oficial de Datos – Módulo Comunidad

## 3.7.1 Objetivo

El módulo **Comunidad** constituye el espacio de interacción entre los usuarios de la plataforma **La Voz de Jesús (LVJ)**.

Su finalidad es fortalecer la vida comunitaria, promover la oración compartida, fomentar la participación activa y facilitar la comunicación entre los miembros de la comunidad católica digital.

Este módulo administra toda la información generada por los usuarios que no corresponde directamente a contenidos editoriales ni a configuraciones del sistema.

La arquitectura del módulo está diseñada para permitir el crecimiento de la comunidad sin afectar el funcionamiento de los demás componentes de la plataforma.

---

# 3.7.2 Objetivos Funcionales

El módulo Comunidad deberá permitir:

- Registrar usuarios.
- Administrar perfiles.
- Gestionar grupos de oración.
- Administrar peticiones e intenciones.
- Publicar testimonios.
- Gestionar comentarios.
- Administrar favoritos.
- Registrar actividad comunitaria.
- Facilitar futuras funcionalidades sociales.

---

# 3.7.3 Arquitectura General

Todos los componentes del módulo seguirán el siguiente flujo:

```text
Usuario

↓

Aplicación

↓

API Comunidad

↓

Base de Datos

↓

Panel Administrativo

↓

Moderación
```

Toda la información pública deberá pasar previamente por las reglas definidas por el sistema y, cuando corresponda, por procesos de moderación.

---

# 3.7.4 Componentes del Módulo

El módulo Comunidad está compuesto por los siguientes componentes:

```text
Comunidad

│

├── Usuarios

├── Favoritos

├── Testimonios

├── Peticiones

├── Grupos

└── Comentarios
```

Cada componente posee una responsabilidad específica.

---

# 3.7.5 Usuarios

## Propósito

Administrar la información básica de los miembros registrados en la plataforma.

## Responsabilidad

Gestionar:

- Perfil del usuario.
- Datos básicos.
- Preferencias.
- Estado de la cuenta.
- Participación comunitaria.

Los datos de autenticación deberán mantenerse separados de la información pública del perfil cuando la arquitectura del sistema así lo requiera.

---

# 3.7.6 Favoritos

## Propósito

Permitir que cada usuario conserve un acceso rápido a sus contenidos preferidos.

## Ejemplos

- Lecturas bíblicas.
- Devocionales.
- Podcasts.
- Libros.
- Oracion…37014 tokens truncated…**.

Su finalidad es administrar de forma completamente dinámica la programación de la emisora, la transmisión en vivo, los programas institucionales, los recursos multimedia asociados y la experiencia de escucha de los usuarios.

Toda la información relacionada con la emisora deberá administrarse desde la Base de Datos y el Panel Administrativo, evitando configuraciones escritas directamente en el código.

La aplicación PWA consumirá toda la información mediante APIs REST desarrolladas en PHP.

---

# 8.2 Filosofía del Módulo

El módulo Radio fue diseñado bajo los siguientes principios:

- Configuración completamente dinámica.
- Programación automatizada.
- Administración centralizada.
- Independencia del frontend.
- Compatibilidad con múltiples tipos de streaming.
- Escalabilidad.
- Integración con Podcast y Biblioteca.
- Preparado para futuras emisoras adicionales.

---

# 8.3 Objetivos Funcionales

El módulo permitirá administrar:

- Emisora principal.
- Streams de audio.
- Programación diaria.
- Programas.
- Categorías.
- Locutores.
- Recursos multimedia.
- Podcast.
- Horarios especiales.
- Parrilla automática.
- Programación litúrgica.
- Eventos especiales.
- Transmisiones extraordinarias.

---

# 8.4 Arquitectura del Módulo

```text
Panel Administrativo

        │

        ▼

Configuración Radio

        │

        ▼

Programación

        │

        ▼

Programas

        │

        ▼

Streams

        │

        ▼

API Radio

        │

        ▼

PWA / Web

        │

        ▼

Reproductor de Audio
```

Toda modificación realizada desde el Panel Administrativo deberá reflejarse inmediatamente en la aplicación sin necesidad de actualizar el código.

---

# 8.5 Componentes del Módulo

El módulo Radio se divide en los siguientes componentes.

## Configuración

Responsable de definir:

- Emisora activa.
- Stream principal.
- Stream alternativo.
- Calidad.
- Volumen inicial.
- Reproducción automática.
- Estado de la emisora.

---

## Programación

Administra la parrilla diaria.

Permite configurar:

- Día.
- Hora inicio.
- Hora fin.
- Programa.
- Categoría.
- Descripción.

---

## Programas

Contiene toda la información institucional de cada programa.

Ejemplo

- Nombre.
- Imagen.
- Descripción.
- Horario.
- Locutor.
- Categoría.
- Recursos asociados.

---

## Streaming

Administra las fuentes de audio.

Puede incluir:

- Icecast.
- Shoutcast.
- HLS.
- MP3.
- AAC.

---

## Podcast

Gestiona el contenido bajo demanda.

Relaciona programas con episodios grabados.

---

# 8.6 Arquitectura de Base de Datos

El módulo Radio utiliza las tablas oficiales documentadas en el Diccionario de Base de Datos.

Las tablas podrán ampliarse en el futuro, pero deberán conservar su responsabilidad original.

Ejemplo de organización:

```text
Radio

│

├── Configuración

├── Programación

├── Programas

├── Streams

├── Categorías

├── Podcast

└── Logs
```

---

# 8.7 Flujo de Información

El funcionamiento oficial del módulo será el siguiente.

```text
Panel Administrativo

↓

Configuración Radio

↓

Programación

↓

API Radio

↓

Frontend

↓

Reproductor
```

La PWA nunca decidirá qué programa está al aire.

La programación deberá obtenerse desde la Base de Datos.

---

# 8.8 Reproductor de Audio

El reproductor deberá funcionar de forma desacoplada del módulo Radio.

Su responsabilidad consiste únicamente en reproducir la fuente entregada por la API.

No deberá contener reglas de programación.

---

## Funciones

- Play.
- Pause.
- Stop.
- Reconexión automática.
- Cambio dinámico de stream.
- Información del programa actual.

---

# 8.9 Programación Automática

La programación oficial será consultada utilizando la fecha y hora del servidor.

Flujo:

```text
Hora actual

↓

Programación

↓

Programa activo

↓

Información

↓

Frontend
```

Nunca escribir horarios directamente en el código.

---

# 8.10 Integración con Podcast

Cuando un programa posea episodios disponibles, la aplicación podrá mostrar:

- Episodios recientes.
- Escuchar nuevamente.
- Recursos relacionados.

Esta integración será administrada desde la Base de Datos.

---

# 8.11 Integración con Liturgia

La programación podrá incluir programas especiales relacionados con:

- Lectio Divina.
- Rosario.
- Coronilla.
- Liturgia de las Horas.
- Evangelio del día.
- Santoral.
- Adoración.

No existirá lógica especial en el frontend.

Todo será administrado desde la programación.

---

# 8.12 Integración con Notificaciones

En futuras versiones el módulo Radio podrá enviar notificaciones cuando:

- Inicie un programa especial.
- Comience una transmisión extraordinaria.
- Se active una cadena de oración.
- Se transmita una celebración litúrgica.

Estas funciones deberán desarrollarse mediante módulos independientes.

---

# 8.13 Seguridad

No exponer directamente:

- URLs privadas.
- Tokens.
- Credenciales.
- Configuración interna.

Toda comunicación deberá realizarse mediante APIs.

---

# 8.14 Buenas Prácticas

- No escribir horarios directamente en el código.
- No escribir URLs de streaming directamente en el frontend.
- Reutilizar el reproductor existente.
- Mantener desacoplada la programación.
- Centralizar la configuración.

---

# 8.15 Reglas para Codex

Antes de modificar el módulo Radio deberá verificar:

1. Si ya existe una API equivalente.
2. Si ya existe una tabla que cubra la necesidad.
3. Si la programación puede reutilizarse.
4. Si el reproductor ya soporta el tipo de stream.
5. Si la modificación afecta otros módulos.

No crear nuevos reproductores sin autorización.

No duplicar programación.

No escribir URLs de streaming directamente en el código.

---

# 8.16 Estado del Módulo

Estado actual:

🟢 En desarrollo activo.

Funciones implementadas parcialmente:

- Programación.
- Reproductor.
- Streaming.

Pendientes:

- Integración completa con Base de Datos.
- Podcast.
- Estadísticas.
- Notificaciones.
- Múltiples emisoras.
- Monitoreo automático.

---

# 8.17 Roadmap

El crecimiento previsto del módulo incluye:

- Soporte para múltiples emisoras.
- Streaming redundante.
- Estadísticas de audiencia.
- Programación inteligente.
- Podcast avanzado.
- Descargas.
- Recomendaciones.
- Favoritos.
- Integración con vehículos Android Auto y Apple CarPlay.
- Compatibilidad con dispositivos inteligentes.

---

# 8.18 Regla Fundamental

El módulo Radio deberá permanecer completamente desacoplado de la interfaz gráfica.

Toda la programación, configuración, streams y recursos deberán administrarse desde la Base de Datos y consumirse mediante APIs.

Ninguna información crítica del funcionamiento de la emisora deberá permanecer escrita directamente en el código fuente.

# CAPÍTULO 9
# MÓDULO LITURGIA

## 9.1 Objetivo

El módulo **Liturgia** constituye uno de los componentes doctrinales y pastorales centrales de **La Voz de Jesús (LVJPRAYER)**.

Su propósito es presentar diariamente la Liturgia de la Iglesia Católica correspondiente a Colombia, utilizando como fuente oficial la información autorizada de la **Conferencia Episcopal de Colombia (CEC)** y complementándola con contenidos propios de oración y formación generados mediante inteligencia artificial bajo supervisión doctrinal.

El módulo deberá ofrecer una experiencia integrada de:

- fecha y celebración litúrgica;
- tiempo, semana, ciclo y color litúrgico;
- primera lectura;
- salmo responsorial y estribillo;
- segunda lectura cuando corresponda;
- aclamación antes del Evangelio;
- Evangelio;
- reflexión pastoral diaria de LVJPRAYER;
- Lectio Divina de LVJPRAYER;
- oración, contemplación y compromiso;
- frase bíblica para guardar;
- audio y recursos multimedia cuando estén disponibles.

La operación ordinaria deberá ser automática. El administrador intervendrá únicamente para supervisar, corregir, bloquear, reprocesar o resolver excepciones.

---

## 9.2 Principios doctrinales y editoriales

Toda implementación deberá respetar los siguientes principios:

1. La Palabra proclamada y el calendario litúrgico no serán determinados por la IA.
2. La CEC será la fuente oficial para la Liturgia utilizada en Colombia, conforme a la autorización otorgada al proyecto.
3. Los textos recibidos de la CEC deberán conservarse fielmente y con la atribución correspondiente.
4. La IA será una herramienta subordinada a la Sagrada Escritura, la Liturgia y la doctrina de la Iglesia.
5. La Reflexión y la Lectio Divina generadas serán contenidos propios de LVJPRAYER y nunca se presentarán como documentos oficiales de la CEC.
6. La centralidad de todo contenido deberá permanecer en Jesucristo.
7. No se inventarán citas, datos históricos, interpretaciones magisteriales ni elementos biográficos.
8. El contenido oficial y el contenido generado deberán mantener origen, versión y auditoría diferenciados.
9. Una falla de IA nunca impedirá consultar las lecturas oficiales.
10. Una falla del proveedor nunca eliminará ni sobrescribirá la última Liturgia válida almacenada.

---

## 9.3 Alcance oficial de la integración CEC

La integración inicial utilizará los siguientes servicios identificados del Ordo Colombiano:

```text
GET /liturgia/obtener-contenido-completo

GET /ediciones/obtener-contenido-principal

GET /ediciones/listar-informacion-tiempo-liturgico
```

Podrá evaluarse como fuente complementaria, sin convertirla en dependencia del núcleo inicial:

```text
GET /contenido-oraciones-reflexiones
```

Los siguientes servicios quedan fuera del alcance inicial de Liturgia porque serán atendidos por otros componentes del ecosistema:

```text
GET /santos

GET /fiestas-principales

GET /oraciones/categorias
```

El Santoral continuará siendo un módulo independiente alimentado mediante su propio concepto de servicio.

Los nombres, rutas y formato real de los servicios deberán encapsularse en el proveedor. Ningún componente público deberá depender directamente de la estructura externa.

---

## 9.4 Arquitectura oficial

```text
Conferencia Episcopal de Colombia

↓

CecOrdoProvider — Backend PHP

↓

Descarga y validación de la respuesta

↓

Normalización al contrato interno LVJPRAYER

↓

MySQL — tabla canónica de Liturgia

↓

Generación IA de Reflexión y Lectio Divina

↓

Revisión doctrinal automática

↓

API PHP interna

↓

PWA / Web / Radio / Podcast

↓

Usuario
```

La PWA nunca consultará directamente a la CEC, MySQL ni OpenAI.

---

## 9.5 Fuente oficial y atribución

La fuente litúrgica oficial será:

```text
Conferencia Episcopal de Colombia
Ordo Colombiano
Código interno de proveedor: cec_ordo_colombiano
País: CO
```

El proyecto deberá conservar una referencia interna al permiso recibido, sin publicar información privada o confidencial.

Toda vista pública que reproduzca el contenido deberá mostrar la atribución exigida por la autorización concedida.

La autorización no permite exponer credenciales, estructura interna protegida ni datos técnicos sensibles.

---

## 9.6 Proveedor de Liturgia

La integración deberá implementarse mediante un contrato desacoplado, adaptado a la estructura real del repositorio.

Ejemplo conceptual:

```php
interface LiturgiaProviderInterface
{
    public function obtenerContenidoCompleto(): array;

    public function obtenerContenidoPrincipal(): array;

    public function obtenerInformacionTiempoLiturgico(): array;
}
```

El adaptador oficial inicial será:

```text
CecOrdoProvider
```

Responsabilidades:

- construir las solicitudes;
- adjuntar encabezados privados desde variables de entorno;
- aplicar timeout;
- verificar TLS;
- limitar redirecciones;
- validar el código HTTP;
- validar el tamaño máximo permitido;
- descomprimir la respuesta cuando corresponda;
- detectar JSON, JSON serializado o HTML estructurado;
- devolver una estructura controlada al normalizador;
- traducir errores externos a excepciones internas seguras;
- no registrar credenciales;
- no devolver la respuesta cruda al Frontend.

Las variables de entorno conceptuales serán:

```text
CEC_ORDO_API_BASE_URL
CEC_ORDO_API_NAME
CEC_ORDO_API_KEY
CEC_ORDO_API_TOKEN
CEC_ORDO_TIMEOUT_SECONDS
```

Los nombres definitivos deberán ajustarse al sistema de configuración existente sin duplicar mecanismos.

---

## 9.7 Tabla canónica y persistencia

La tabla canónica oficial será:

```text
lvj_lit_lectura_dia
```

Esta tabla almacenará el contenido litúrgico diario normalizado utilizado por las APIs públicas.

Las responsabilidades serán:

```text
lvj_lit_lectura_dia
    → Liturgia oficial y contenido diario principal

lvj_lit_lectio_divina
    → Lectio Divina generada o editada

lvj_lit_palabra_dia
    → Resumen derivado para Home y notificaciones

lvj_lit_dia
    → Compatibilidad temporal; no utilizar en nuevos desarrollos
```

No deberán escribirse simultáneamente las mismas lecturas en `lvj_lit_lectura_dia` y `lvj_lit_dia`.

Antes de agregar columnas o crear tablas, Codex deberá inspeccionar el Diccionario actual, migraciones, APIs y código consumidor.

La implementación deberá reutilizar campos y estructuras existentes para representar, cuando estén disponibles:

- código y nombre de la fuente;
- hash del contenido fuente;
- fecha de sincronización;
- estado de sincronización;
- bloqueo editorial;
- versión o identificador de edición;
- estado de publicación;
- atribución.

Si no existen estructuras equivalentes, la propuesta de migración deberá documentarse y aprobarse antes de ejecutarse.

---

## 9.8 Relación con Lectio Divina y Palabra del Día

Las relaciones lógicas oficiales serán:

```text
lvj_lit_lectura_dia.id
    → lvj_lit_lectio_divina.liturgia_id

lvj_lit_lectura_dia.id
    → lvj_lit_palabra_dia.liturgia_id
```

Antes de crear claves foráneas físicas deberá verificarse:

- compatibilidad de tipos;
- índices actuales;
- registros huérfanos;
- nulabilidad;
- impacto sobre APIs existentes;
- estrategia de reversión.

`lvj_lit_palabra_dia` no deberá recibir una segunda importación. Su contenido deberá derivarse del registro canónico publicado.

---

## 9.9 Sincronización automática

La sincronización se ejecutará mediante procesos PHP compatibles con hosting compartido y cPanel.

No dependerá de:

- workers permanentes;
- servicios Node.js residentes;
- Docker obligatorio;
- colas que requieran demonios propios.

Flujo:

```text
Cron

↓

Bloqueo de ejecución

↓

Consulta al proveedor

↓

Validación de respuesta

↓

Cálculo de hash

↓

¿Existe cambio válido?

├── No → Registrar y finalizar

└── Sí → Normalizar, guardar y generar contenidos
```

La primera configuración recomendada será:

```text
Sincronización completa: una vez al día

Verificación adicional: cada 6 o 12 horas

Generación IA: únicamente cuando falte contenido o cambie la Liturgia fuente
```

La frecuencia deberá ser configurable desde la arquitectura existente, sin almacenar secretos en MySQL.

---

## 9.10 Idempotencia y protección de datos

Toda sincronización deberá ser idempotente.

El proceso deberá:

1. evitar registros duplicados por fecha y celebración;
2. comparar el hash del contenido;
3. actualizar solo cuando exista un cambio válido;
4. utilizar transacciones;
5. conservar la última versión publicada;
6. no sobrescribir un registro con `editor_locked` o su equivalente;
7. no borrar contenido por ausencia temporal del proveedor;
8. registrar el número de elementos procesados, creados, actualizados, omitidos y fallidos;
9. impedir dos ejecuciones simultáneas;
10. permitir reintento seguro.

Una respuesta vacía, parcial, ilegible o con fecha incoherente no deberá considerarse una actualización válida.

---

## 9.11 Normalización y contrato interno

La respuesta externa deberá convertirse a un contrato interno estable antes de escribir en MySQL.

El contrato conceptual deberá incluir:

```json
{
  "fecha": "YYYY-MM-DD",
  "pais": "CO",
  "fuente": "cec_ordo_colombiano",
  "edicion": null,
  "celebracion": {
    "nombre": "",
    "rango": "",
    "principal": true
  },
  "contexto": {
    "tiempo_liturgico": "",
    "semana": null,
    "ciclo_dominical": null,
    "ciclo_ferial": null,
    "color": ""
  },
  "lecturas": [],
  "hash_fuente": "",
  "sincronizado_en": ""
}
```

La estructura definitiva deberá derivarse del cuerpo real de las respuestas y no de suposiciones.

El normalizador deberá conservar:

- referencia original;
- referencia normalizada;
- título litúrgico;
- texto proclamado;
- orden;
- tipo de lectura;
- estribillo del salmo;
- alternativas o formas breves cuando existan;
- contenido fuente necesario para auditoría.

---

## 9.12 Celebraciones y lecturas múltiples

La primera fase utilizará la celebración principal correspondiente a cada fecha.

Si la respuesta real de la CEC contiene varias celebraciones, varias opciones o una secuencia variable de lecturas, el sistema deberá conservar esa información en el contrato normalizado o en el registro de origen sin descartarla silenciosamente.

La creación de nuevas tablas para múltiples celebraciones o lecturas variables requerirá:

1. confirmar la estructura real de la respuesta;
2. revisar las tablas existentes;
3. demostrar que la tabla canónica no puede representarla;
4. actualizar el Diccionario;
5. preparar migración idempotente y reversión;
6. mantener compatibilidad con la primera fase.

No deberá modelarse anticipadamente una estructura paralela sin evidencia del proveedor.

---

## 9.13 Contenido diario oficial

Cada registro podrá contener:

- fecha;
- celebración;
- rango litúrgico;
- tiempo litúrgico;
- semana litúrgica;
- ciclo dominical;
- ciclo ferial;
- color;
- primera lectura;
- salmo responsorial;
- estribillo;
- segunda lectura;
- aclamación;
- Evangelio;
- referencias originales;
- textos litúrgicos completos;
- alternativas cuando existan;
- estado y atribución.

Los textos litúrgicos oficiales deberán almacenarse tal como los suministra la fuente autorizada, conservando únicamente las transformaciones técnicas necesarias para normalización, sanitización y presentación.

---

## 9.14 Integración con la Biblia

El módulo Liturgia y el módulo Biblia cumplen responsabilidades diferentes.

```text
Liturgia
    → Texto oficial proclamado y selección litúrgica del día

Biblia
    → Lectura, comparación, notas y estudio en las versiones autorizadas de LVJPRAYER
```

Las referencias recibidas deberán normalizarse para permitir:

- abrir el pasaje en el lector bíblico;
- comparar versiones;
- consultar notas;
- iniciar un Estudio Bíblico IA;
- enlazar con recursos formativos.

No deberá sustituirse automáticamente el texto litúrgico de la CEC por la Biblia Platense/Straubinger, Torres Amat, Scío u otra versión interna.

La duplicación técnica del texto litúrgico está justificada por su responsabilidad editorial distinta.

---

## 9.15 Reflexión diaria con IA

LVJPRAYER generará una Reflexión pastoral propia utilizando las lecturas oficiales y el contexto litúrgico del día.

La IA no podrá modificar las lecturas ni decidir la celebración.

La estructura recomendada será:

```text
Título espiritual

Tema central

Unidad entre las lecturas

Explicación pastoral del Evangelio

Aplicación a la vida

Llamado a la conversión

Oración final

Frase para guardar
```

La Reflexión deberá:

- utilizar todas las lecturas relevantes;
- conservar lenguaje católico, pastoral y comprensible;
- respetar el tiempo y rango litúrgico;
- distinguir entre texto bíblico e interpretación;
- evitar moralismo, sentimentalismo vacío y afirmaciones no sustentadas;
- no atribuir a Dios promesas que las lecturas no contienen;
- no presentar una interpretación privada como doctrina oficial;
- mantener una extensión configurada por el perfil desplegado.

---

## 9.16 Lectio Divina automática

Cada día podrá disponer de una Lectio Divina propia de LVJPRAYER.

La estructura oficial será:

```text
✠ Invocación al Espíritu Santo

Lectio — ¿Qué dice el texto?

Meditatio — ¿Qué me dice Dios?

Oratio — ¿Qué le respondo al Señor?

Contemplatio — ¿Cómo permanezco ante Él?

Actio — ¿Qué compromiso concreto asumo?

Pregunta para meditar

Palabra para guardar

Oración o envío final
```

La Lectio Divina deberá:

- partir de la Liturgia oficial del día;
- mantener el sentido literal antes de la aplicación espiritual;
- no inventar elementos ausentes del texto;
- orientar al encuentro personal con Cristo;
- proponer una acción concreta, prudente y realizable;
- incluir pausas contemplativas cuando corresponda;
- permitir una futura versión guiada por audio.

La tabla `lvj_lit_lectio_divina` deberá ampliarse solo después de verificar sus campos reales y su compatibilidad con esta estructura.

---

## 9.17 Centro de Formación y Supervisión IA

La Liturgia reutilizará el Centro de Formación y Supervisión IA existente.

No se crearán tablas paralelas de prompts, reglas, fuentes, ejemplos, evaluaciones o auditoría.

Los perfiles recomendados serán:

```text
liturgia_reflexion_diaria

liturgia_lectio_divina

liturgia_revision_doctrinal
```

Los nombres definitivos deberán ajustarse a la convención real de `lvj_ai_profiles`.

Cada generación deberá registrar, mediante las estructuras existentes:

- perfil;
- versión de instrucciones desplegada;
- proveedor y modelo;
- hash del contexto;
- fecha de ejecución;
- respuesta;
- validación;
- revisión;
- estado de publicación;
- errores.

El proceso de Liturgia no publicará nuevas versiones de instrucciones. Solo podrá utilizar versiones previamente desplegadas y aprobadas desde el Centro.

---

## 9.18 Revisión doctrinal automática

La generación y la revisión deberán utilizar perfiles o instrucciones separadas.

La revisión verificará como mínimo:

- fidelidad a las lecturas;
- centralidad de Jesucristo;
- coherencia con la doctrina católica;
- concordancia con el tiempo litúrgico;
- respeto a la celebración;
- ausencia de citas inventadas;
- ausencia de datos históricos no suministrados;
- distinción entre contenido oficial y contenido generado;
- lenguaje pastoral prudente;
- ausencia de promesas automáticas de sanación, liberación o prosperidad;
- ausencia de interpretaciones contrarias al Magisterio.

El resultado deberá ser estructurado y auditable.

Ejemplo conceptual:

```json
{
  "aprobado": true,
  "fidelidad_biblica": 98,
  "coherencia_doctrinal": 97,
  "coherencia_liturgica": 99,
  "advertencias": []
}
```

Los umbrales de publicación serán configurables dentro del sistema de IA existente.

---

## 9.19 Publicación automática

Las lecturas oficiales podrán publicarse automáticamente después de superar validaciones técnicas y editoriales de origen.

La Reflexión y la Lectio Divina podrán publicarse automáticamente cuando:

```text
Liturgia oficial válida
+
Generación completa
+
Estructura correcta
+
Revisión doctrinal aprobada
+
Publicación automática habilitada
=
Contenido publicado
```

Si la generación o la revisión fallan:

- las lecturas oficiales permanecerán disponibles;
- el contenido generado quedará pendiente o en error;
- no se publicará texto incompleto;
- se registrará la incidencia;
- podrá ejecutarse un reintento automático limitado o una acción administrativa.

Las correcciones manuales deberán activar un bloqueo editorial para impedir que el cron las sobrescriba.

---

## 9.20 Estados editoriales y operativos

La implementación reutilizará los estados existentes cuando sean compatibles.

Conceptualmente deberá representar:

```text
pendiente_sincronizacion

sincronizado

validado

pendiente_generacion

generando

generado

pendiente_revision

aprobado

publicado

requiere_revision

bloqueado_editorialmente

error
```

No deberán agregarse estados nuevos sin revisar catálogos y reglas actuales.

El estado de la Liturgia oficial deberá mantenerse separado del estado de la Reflexión y de la Lectio Divina para que una falla de IA no invalide el contenido oficial.

---

## 9.21 Panel Administrativo

El Panel será una consola de supervisión y edición excepcional.

Deberá mostrar:

- proveedor activo;
- última sincronización;
- edición o período disponible;
- cantidad de registros procesados;
- fechas disponibles;
- errores pendientes;
- estado de generación IA;
- estado de revisión doctrinal;
- versión del perfil desplegado;
- registros bloqueados;
- estado de publicación automática.

Acciones permitidas:

- sincronizar ahora;
- reprocesar una fecha;
- ver el contenido fuente sanitizado;
- comparar cambios;
- corregir;
- bloquear o desbloquear;
- regenerar Reflexión;
- regenerar Lectio Divina;
- aprobar o rechazar;
- publicar o retirar publicación;
- consultar auditoría.

El Panel no mostrará ni administrará las credenciales externas.

---

## 9.22 API interna de LVJPRAYER

La aplicación pública consumirá únicamente endpoints internos.

Rutas conceptuales:

```text
GET /api/liturgia/hoy

GET /api/liturgia/fecha?fecha=YYYY-MM-DD

GET /api/liturgia/calendario

GET /api/liturgia/reflexion?fecha=YYYY-MM-DD

GET /api/liturgia/lectio?fecha=YYYY-MM-DD
```

Las rutas reales deberán adaptarse al patrón existente y no duplicar endpoints funcionales.

Las respuestas deberán:

- utilizar el formato oficial del Backend;
- excluir credenciales y metadatos internos innecesarios;
- identificar claramente el origen oficial y el contenido propio;
- devolver estados de carga y ausencia comprensibles;
- respetar publicación, fecha y borrado lógico;
- incluir atribución cuando corresponda.

---

## 9.23 Experiencia pública

La pantalla recomendada será:

```text
Liturgia del Día

├── Lecturas
├── Reflexión
├── Lectio Divina
└── Escuchar
```

### Lecturas

- celebración;
- tiempo y color;
- primera lectura;
- salmo;
- segunda lectura;
- aclamación;
- Evangelio;
- referencias;
- enlace al módulo Biblia.

### Reflexión

- título;
- mensaje central;
- unidad de las lecturas;
- aplicación;
- oración;
- frase destacada.

### Lectio Divina

- invocación;
- Lectio;
- Meditatio;
- Oratio;
- Contemplatio;
- Actio;
- compromiso;
- palabra para guardar.

### Escuchar

- audio de cada lectura cuando exista;
- reproducción continua;
- Reflexión narrada;
- Lectio Divina guiada;
- pausas contemplativas en futuras versiones.

La primera implementación no deberá bloquearse por la ausencia de audio.

---

## 9.24 Recursos multimedia y audio

Las imágenes, audios y videos se almacenarán fuera de MySQL. La Base de Datos conservará únicamente URL, tipo, estado y metadatos.

La generación o incorporación de audio será una fase posterior y deberá:

- respetar el texto litúrgico oficial;
- identificar voz, idioma y versión;
- no exponer claves de síntesis;
- reutilizar la infraestructura multimedia existente;
- coordinarse con el reproductor global para evitar audio simultáneo;
- permitir regeneración sin alterar el texto fuente.

---

## 9.25 Integración con otros módulos

El módulo Liturgia podrá integrarse con:

- Biblia: apertura y comparación del pasaje;
- Estudio Bíblico IA: profundización opcional;
- Radio: programación del Evangelio, Reflexión o Lectio;
- Podcast: publicación de contenido narrado;
- Capilla Virtual: acceso a adoración y oración;
- Oraciones: recursos vinculados al tiempo litúrgico;
- Notificaciones: frase o invitación diaria;
- Home: resumen derivado desde `lvj_lit_palabra_dia`.

El Santoral conservará su servicio y administración independientes.

Ninguna integración deberá duplicar el contenido fuente.

---

## 9.26 Seguridad

Está prohibido:

- exponer claves o tokens de la CEC en React, TypeScript, logs, respuestas o GitHub;
- consultar la CEC directamente desde el navegador;
- guardar secretos en MySQL;
- incluir secretos en capturas, documentación pública o mensajes de error;
- permitir URLs externas arbitrarias;
- registrar encabezados privados completos;
- devolver cuerpos crudos del proveedor al usuario;
- permitir que una fecha solicitada controle una URL externa sin validación;
- desactivar TLS;
- aceptar respuestas ilimitadas;
- ejecutar sincronizaciones públicas sin autenticación y autorización.

Las credenciales deberán ser exclusivas para LVJPRAYER cuando la CEC las suministre y deberán rotarse conforme a la política acordada.

---

## 9.27 Manejo de errores y continuidad

### Proveedor no disponible

```text
Conservar contenido local válido

Registrar error

Reintentar de forma limitada

No mostrar pantalla vacía
```

### Respuesta incompleta

```text
Rechazar actualización

Conservar versión anterior

Marcar para revisión
```

### IA no disponible

```text
Publicar o conservar lecturas oficiales

Mantener Reflexión y Lectio pendientes

No generar contenido ficticio de respaldo
```

### Error doctrinal

```text
No publicar contenido generado

Guardar evaluación

Enviar a revisión administrativa
```

### Corrección editorial

```text
Guardar versión corregida

Registrar usuario y motivo

Activar bloqueo editorial
```

---

## 9.28 Auditoría y trazabilidad

Cada sincronización deberá registrar:

- proveedor;
- endpoint lógico;
- inicio y fin;
- código HTTP;
- hash de respuesta;
- hash normalizado;
- cantidad procesada;
- cantidad creada;
- cantidad actualizada;
- cantidad omitida;
- errores;
- versión de normalizador;
- resultado.

Cada generación IA deberá registrar mediante las tablas `lvj_ai_*` existentes:

- perfil;
- versión de instrucción;
- contexto o hash de contexto;
- modelo;
- respuesta;
- evaluación;
- revisión;
- publicación.

Nunca se almacenarán credenciales en auditoría.

---

## 9.29 Estado actual

Estado del módulo:

🟡 Arquitectura aprobada y automatización pendiente de implementación.

Confirmado:

- permiso de uso de la información de la CEC;
- endpoints principales identificados;
- Backend PHP como único consumidor externo;
- MySQL como fuente pública oficial;
- `lvj_lit_lectura_dia` como tabla canónica;
- Reflexión y Lectio Divina como contenidos propios de LVJPRAYER;
- reutilización del Centro de Formación y Supervisión IA;
- Santoral fuera del alcance inicial de esta integración.

Pendiente:

- inspeccionar y documentar el cuerpo real de las respuestas;
- mapear los campos al modelo existente;
- auditar tablas, tipos, índices y claves foráneas;
- implementar `CecOrdoProvider`;
- implementar normalizador y validador;
- implementar sincronización y logs;
- configurar perfiles de IA;
- implementar generación y revisión;
- adaptar Panel, API y pantalla pública;
- ejecutar pruebas de continuidad y seguridad;
- habilitar producción de forma controlada.

---

## 9.30 Fases de implementación

### Fase 1 — Descubrimiento y contrato

- capturar respuestas sanitizadas;
- identificar estructura real;
- crear contrato interno;
- definir mapeo sin modificar producción.

### Fase 2 — Sincronización oficial

- proveedor PHP;
- normalizador;
- validaciones;
- escritura idempotente en tabla canónica;
- logs;
- cron;
- Panel de supervisión básico.

### Fase 3 — Reflexión y Lectio Divina

- perfiles del Centro IA;
- generación estructurada;
- revisión doctrinal;
- persistencia;
- publicación automática configurable.

### Fase 4 — Experiencia pública

- pestañas Lecturas, Reflexión y Lectio;
- consulta por fecha;
- Home derivado;
- enlaces con Biblia;
- atribución.

### Fase 5 — Multimedia

- audio por lectura;
- Reflexión narrada;
- Lectio guiada;
- integración con Radio y Podcast.

---

## 9.31 Reglas para Codex

Antes de implementar cualquier cambio en Liturgia, Codex deberá:

1. leer completamente AGENTS.md;
2. inspeccionar la implementación real;
3. revisar el Diccionario actual de Base de Datos;
4. localizar APIs, servicios, cron, componentes y CRUD existentes;
5. inspeccionar los cuerpos sanitizados de la CEC;
6. confirmar la tabla canónica y las dependencias actuales;
7. verificar tipos, índices y claves foráneas;
8. identificar incompatibilidades con `lvj_lit_dia`;
9. reutilizar el Centro de Formación y Supervisión IA;
10. presentar un plan localizado;
11. implementar solo la fase autorizada;
12. mantener compatibilidad hacia atrás;
13. no ejecutar migraciones en producción;
14. ejecutar pruebas disponibles;
15. entregar un informe verificable.

Codex no deberá:

- crear un repositorio o aplicación paralela sin autorización;
- consumir la CEC desde el Frontend;
- copiar secretos al código;
- escribir en varias tablas diarias;
- sustituir el Leccionario por una Biblia interna;
- integrar Santoral dentro de esta tarea;
- crear prompts fuera del Centro IA;
- publicar versiones de instrucciones automáticamente;
- publicar contenido que no supere la revisión configurada;
- eliminar o renombrar tablas;
- alterar producción;
- ampliar el alcance hacia santos, fiestas u oraciones generales;
- inventar campos basándose únicamente en los nombres de endpoints.

---

## 9.32 Formato de entrega para implementaciones

Toda implementación deberá informar:

1. Diagnóstico de la implementación existente.
2. Funcionalidad reutilizada.
3. Inconsistencias encontradas.
4. Cambios requeridos.
5. Archivos afectados.
6. Implementación.
7. Seguridad aplicada.
8. Pruebas ejecutadas.
9. Resultado.
10. Limitaciones reales.

También deberá especificar:

- endpoints externos e internos utilizados;
- tablas consultadas y modificadas;
- migraciones propuestas, no ejecutadas en producción;
- perfiles y versiones IA usados;
- programación cron;
- estrategia de reversión;
- datos que permanecen pendientes de confirmación.

---

## 9.33 Regla Fundamental

La **Conferencia Episcopal de Colombia** será la fuente oficial de la Liturgia diaria utilizada por LVJPRAYER para Colombia.

El Backend PHP será la única capa autorizada para consultar esa fuente, validar, normalizar y persistir el contenido.

MySQL será la fuente consumida por la aplicación pública.

La Reflexión y la Lectio Divina serán contenidos propios de LVJPRAYER, generados mediante perfiles aprobados del Centro de Formación y Supervisión IA y sometidos a revisión doctrinal antes de su publicación automática.

El Panel Administrativo supervisará y corregirá excepciones; no realizará mantenimiento manual diario.

La PWA nunca contendrá lecturas fijas, secretos, llamadas directas a la CEC ni llamadas directas al proveedor de IA.

---

# CAPÍTULO 10
# MÓDULO BIBLIA

## 10.1 Objetivo

El módulo **Biblia** constituye uno de los pilares doctrinales del proyecto **La Voz de Jesús (LVJ)** y tiene como propósito facilitar el acceso organizado, confiable y permanente a la Sagrada Escritura, permitiendo al usuario leer, estudiar, meditar y profundizar en la Palabra de Dios desde una experiencia completamente integrada con el resto de la plataforma.

Este módulo no debe entenderse únicamente como un lector de textos bíblicos, sino como una plataforma integral de estudio y crecimiento espiritual.

Su diseño permitirá integrar en una única experiencia:

- Lectura completa de la Biblia.
- Diferentes traducciones autorizadas.
- Búsquedas rápidas.
- Planes de lectura.
- Favoritos.
- Notas personales.
- Historial de lectura.
- Integración con Liturgia.
- Integración con Lectio Divina.
- Integración con Santoral.
- Integración con Formación.

Toda la información deberá administrarse desde la Base de Datos y el Panel Administrativo.

---

# 10.2 Filosofía del Módulo

El módulo Biblia se desarrolla bajo los siguientes principios:

- Fidelidad al texto bíblico.
- Respeto por los derechos de autor de cada traducción.
- Arquitectura independiente de las traducciones.
- Configuración dinámica.
- Escalabilidad.
- Integración con el resto del sistema.
- Alto rendimiento en consultas.
- Compatibilidad con múltiples versiones bíblicas.

El sistema deberá permitir agregar nuevas traducciones sin modificar la arquitectura.

---

# 10.3 Objetivos Funcionales

El módulo permitirá administrar:

- Versiones bíblicas.
- Libros.
- Capítulos.
- Versículos.
- Introducciones.
- Notas.
- Planes de lectura.
- Favoritos.
- Marcadores.
- Historial.
- Recursos multimedia.
- Comparación entre versiones.
- Búsquedas.

---

# 10.4 Arquitectura del Módulo

```text
Panel Administrativo

        │

        ▼

Versiones Bíblicas

        │

        ▼

Libros

        │

        ▼

Capítulos

        │

        ▼

Versículos

        │

        ▼

API Biblia

        │

        ▼

Aplicación PWA

        │

        ▼

Usuario
```

Toda consulta deberá realizarse mediante APIs.

---

# 10.5 Arquitectura de Base de Datos

Las tablas oficiales del módulo Biblia se documentan en el **Capítulo 3 – Diccionario Oficial de Base de Datos**.

Entre ellas podrán encontrarse:

- lvj_biblia_versiones
- lvj_biblia_libros
- lvj_biblia_capitulos
- lvj_biblia_versiculos
- lvj_biblia_planes
- lvj_biblia_favoritos
- lvj_biblia_notas
- tablas auxiliares relacionadas

Cada tabla tendrá una única responsabilidad.

No deberán duplicarse textos innecesariamente.

---

# 10.6 Versiones Bíblicas

El sistema deberá permitir administrar múltiples traducciones.

Ejemplos:

- Biblia de Jerusalén.
- Biblia Latinoamericana.
- Nácar-Colunga.
- Biblia de Navarra.
- Biblia Straubinger.
- Reina-Valera (cuando la licencia lo permita).
- Otras traducciones autorizadas.

Cada versión será completamente independiente.

---

# 10.7 Organización de la Biblia

Toda versión deberá respetar la estructura oficial.

```text
Versión

↓

Libro

↓

Capítulo

↓

Versículo
```

Nunca almacenar capítulos completos como texto plano cuando los versículos puedan administrarse individualmente.

---

# 10.7.1 Fuentes de la Biblia Platense / Straubinger

Los archivos de la versión **SpaPlatense** se organizarán bajo:

```text
storage/biblia/spaplatense/
```

La responsabilidad de cada fuente será la siguiente:

- Los archivos SWORD ubicados en `fuente/sword/` constituyen la fuente original y deberán conservarse sin modificaciones.
- Los archivos JSON ubicados en `fuente/json/` constituyen la fuente preparada para los futuros procesos de importación.
- `SpaPlatense.json` se utilizará como fuente de lectura limpia.
- `SpaPlatense-osis.json` se utilizará como fuente de Biblia de estudio con notas y marcado OSIS.
- `procesado/` almacenará únicamente resultados intermedios derivados de las fuentes originales.
- `offline/` almacenará los paquetes offline durante su preparación.
- `public/offline/biblia/spaplatense/` se utilizará exclusivamente para publicar los paquetes offline finales.

La presencia de estos archivos no implica que su contenido haya sido importado a MySQL. La importación, las modificaciones de tablas, los endpoints y la generación de paquetes offline deberán realizarse como tareas posteriores y expresamente autorizadas.

---

# 10.8 Planes de Lectura

El sistema permitirá administrar múltiples planes.

Ejemplos:

- Plan anual.
- Plan cronológico.
- Plan temático.
- Plan por Evangelios.
- Plan de Adviento.
- Plan de Cuaresma.
- Plan personalizado.

Cada plan deberá administrarse desde la Base de Datos.

---

# 10.9 Favoritos y Notas

Cada usuario podrá:

- Marcar versículos favoritos.
- Crear notas personales.
- Registrar avances de lectura.
- Continuar donde terminó.

Estos datos pertenecen al usuario y nunca deberán mezclarse con el texto bíblico oficial.

---

# 10.10 Integración con Liturgia

El módulo Biblia será la fuente principal para las citas bíblicas utilizadas por la Liturgia.

La Liturgia almacenará únicamente las referencias.

Ejemplo:

```
Mateo 5, 1-12
```

El texto correspondiente podrá obtenerse desde la versión bíblica seleccionada por el usuario, siempre que los derechos de uso lo permitan.

---

# 10.11 Integración con Lectio Divina

Cada Lectio Divina podrá enlazar directamente con:

- Libro.
- Capítulo.
- Versículos.
- Comentarios.
- Recursos relacionados.

El módulo Biblia no almacenará el contenido propio de la Lectio Divina.

---

# 10.12 Integración con Santoral

Las celebraciones del Santoral podrán asociar:

- Lecturas recomendadas.
- Citas bíblicas.
- Personajes bíblicos relacionados.

Estas asociaciones deberán mantenerse mediante relaciones y no duplicando contenido.

---

# 10.13 Búsquedas

El sistema permitirá búsquedas por:

- Libro.
- Capítulo.
- Versículo.
- Palabra.
- Frase.
- Tema.
- Personaje.
- Traducción.

Las búsquedas deberán optimizarse mediante índices.

---

# 10.14 Recursos Multimedia

Cada libro o plan de lectura podrá asociar:

- Imagen.
- Audio.
- Video.
- Comentarios.
- Recursos de apoyo.

Los archivos físicos no deberán almacenarse en MySQL.

---

# 10.15 Panel Administrativo

Desde el Panel Administrativo deberá ser posible:

- Administrar versiones.
- Administrar libros.
- Administrar planes.
- Administrar recursos.
- Configurar la versión predeterminada.
- Activar o desactivar versiones.

No deberá permitirse modificar directamente los textos protegidos por derechos de autor cuando la licencia lo prohíba.

---

# 10.16 Derechos de Autor

El proyecto deberá respetar estrictamente los derechos de autor de cada traducción bíblica.

No todas las versiones permiten almacenar o distribuir el texto completo.

Cuando una licencia no lo permita, el sistema deberá:

- almacenar únicamente referencias;
- integrar servicios autorizados;
- o utilizar traducciones con permiso correspondiente.

Toda nueva versión bíblica deberá documentar claramente su estado legal antes de incorporarse al sistema.

---

# 10.17 Seguridad

No exponer:

- rutas internas;
- archivos fuente;
- recursos protegidos;
- claves de integración.

Toda la información deberá obtenerse mediante APIs.

---

# 10.18 Buenas Prácticas

- Separar completamente el texto bíblico de la información del usuario.
- No duplicar versículos.
- No almacenar el mismo texto en varias tablas.
- Utilizar índices para búsquedas.
- Centralizar la configuración de versiones.
- Mantener independencia entre Biblia y Liturgia.

---

# 10.19 Reglas para Codex

Antes de modificar el módulo Biblia deberá verificar:

1. Si la versión ya existe.
2. Si el libro ya está registrado.
3. Si la funcionalidad pertenece realmente al módulo Biblia.
4. Si el cambio afecta Liturgia, Lectio Divina o Santoral.
5. Si la modificación requiere actualizar AGENTS.md.

No está permitido:

- Duplicar textos bíblicos.
- Escribir versículos directamente en el código.
- Crear nuevas estructuras cuando las existentes puedan reutilizarse.
- Incorporar traducciones sin revisar previamente sus derechos de uso.

---

# 10.20 Estado Actual

Estado del módulo:

🟡 En desarrollo.

Implementado o previsto:

- Arquitectura general.
- Modelo de Base de Datos.
- Integración con Liturgia.
- Soporte para múltiples versiones.

Pendiente:

- Comparador de traducciones.
- Planes personalizados.
- Favoritos.
- Notas personales.
- Historial de lectura.
- Búsquedas avanzadas.
- Audio bíblico.

---

# 10.21 Roadmap

El crecimiento previsto incluye:

- Comparación simultánea de versiones.
- Diccionario bíblico.
- Concordancias.
- Mapas bíblicos.
- Cronología bíblica.
- Comentarios patrísticos.
- Comentarios de Doctores de la Iglesia.
- Audio sincronizado.
- Planes inteligentes de lectura.
- Integración con IA para apoyo al estudio (sin sustituir la interpretación del Magisterio).

## 10.21.1 Mapas bíblicos — Primera etapa

La sección `Biblia > Explorar > Mapas` se implementará inicialmente como una galería de mapas estáticos
administrables. Las imágenes residirán en una fuente externa o CDN y MySQL almacenará únicamente sus
metadatos en `lvj_bib_mapas`: título, descripción, periodo, URL, fuente, enlace de la fuente, licencia,
orden y estado de publicación.

El Backend PHP publicará exclusivamente los registros activos no eliminados. El Panel Administrativo
permitirá crear, editar, ordenar, publicar, ocultar y eliminar lógicamente cada mapa mediante su URL
pública. El panel no almacenará ni cargará archivos de mapas. Toda imagen deberá conservar fuente y licencia.

La primera etapa incluye cuadrícula, vista ampliada y créditos. Los puntos geográficos, rutas, relaciones
con personajes o lugares y demás funciones cartográficas interactivas quedan reservadas para una fase
posterior y no deberán bloquear la publicación inicial.

## 10.21.2 Personajes bíblicos — Primera etapa

La sección `Biblia > Explorar > Personajes bíblicos` se implementará como una galería administrable con
búsqueda por nombre y filtros por testamento y categoría. MySQL almacenará los datos editoriales en
`lvj_bib_personajes`: nombre, nombre alternativo, testamento, categoría, resumen biográfico, pasajes
principales, enseñanza, URL de imagen, fuente, enlace de la fuente, licencia, orden y publicación.

Las imágenes se consumirán exclusivamente mediante URL pública; el panel no cargará archivos. El Backend
PHP publicará únicamente registros activos no eliminados. La ficha pública ampliada mostrará la información
editorial y los créditos de la imagen. Las relaciones normalizadas con lugares, mapas, cronologías y
versículos quedan reservadas para una fase posterior.

---

# 10.22 Regla Fundamental

El módulo Biblia constituye la fuente oficial de consulta bíblica de la plataforma.

Toda la arquitectura deberá diseñarse para permitir la incorporación de nuevas traducciones, respetando siempre la legislación sobre derechos de autor y manteniendo la independencia entre el texto bíblico, la Liturgia, la Lectio Divina y los recursos de formación.

El código fuente nunca deberá contener textos bíblicos fijos; toda la información deberá obtenerse desde la Base de Datos o desde las fuentes autorizadas según la licencia correspondiente.

---

# CONTROL DE VERSIONES Y EVOLUCIÓN DEL DOCUMENTO

## Estado del Documento

**Documento:** AGENTS.md

**Versión:** 2.1

**Estado:** 🟢 Vigente

**Última actualización:** Agosto de 2026

Este documento constituye la **especificación técnica oficial** del proyecto **La Voz de Jesús (LVJ)**.

La versión 2.1 conserva la arquitectura base del sistema e incorpora como decisión oficial la automatización de la Liturgia diaria desde la Conferencia Episcopal de Colombia, la consolidación de `lvj_lit_lectura_dia` como tabla canónica y la generación supervisada de Reflexión y Lectio Divina mediante IA.

## Cambios principales de la versión 2.1

- Se reconoce a la CEC y al Ordo Colombiano como fuente oficial de Liturgia para Colombia.
- Se autoriza el ingreso de contenido mediante procesos internos PHP validados y auditados.
- Se define `lvj_lit_lectura_dia` como tabla canónica.
- Se clasifica `lvj_lit_dia` como estructura de compatibilidad sin nuevas escrituras.
- Se definen las relaciones lógicas de Lectio Divina y Palabra del Día con la tabla canónica.
- Se incorpora la sincronización automática, idempotencia, caché persistente y conservación de la última versión válida.
- Se incorporan perfiles IA separados para Reflexión, Lectio Divina y revisión doctrinal.
- Se redefine el Panel de Liturgia como consola de supervisión y excepción, no como carga manual diaria.
- Se mantiene el Santoral como servicio independiente fuera del alcance inicial.
- Se actualizan las reglas del Backend, Panel Administrativo, Modelo Relacional y Sistema de Contenidos.

---

# Capítulos Desarrollados

La presente versión documenta los siguientes capítulos:

- **Capítulo 1.** Introducción.
- **Capítulo 2.** Arquitectura General del Sistema.
- **Capítulo 3.** Arquitectura y Diccionario Oficial de Base de Datos.
- **Capítulo 4.** Reservado para Arquitectura Backend.
- **Capítulo 5.** Reservado para Arquitectura Frontend (PWA).
- **Capítulo 6.** Reservado para Panel Administrativo.
- **Capítulo 7.** Módulo Capilla Virtual.
- **Capítulo 8.** Módulo Radio.
- **Capítulo 9.** Módulo Liturgia.
- **Capítulo 10.** Módulo Biblia.

Estos capítulos constituyen la base arquitectónica sobre la cual deberá desarrollarse toda la plataforma.

---

# Evolución del Documento

AGENTS.md es un **documento vivo** y evolucionará conforme crezca el proyecto.

Las futuras versiones incorporarán la documentación detallada de nuevos módulos y funcionalidades, entre ellos:

- Biblioteca Digital.
- Formación.
- Comunidad.
- Podcast.
- Publicidad.
- Donaciones.
- Economía.
- FileServer.
- Lavozfy
- Sistema de Notificaciones.
- Integraciones Externas.
- Seguridad.
- Convenciones de Desarrollo.
- APIs y Servicios.
- Roadmap Técnico.
- Cualquier otro módulo que forme parte de la evolución oficial del proyecto.

La incorporación de estos módulos se realizará mediante nuevas versiones del documento (v2.1, v2.2, v3.0, etc.), manteniendo siempre la compatibilidad con la arquitectura definida en esta versión.

---

# Política de Actualización

Toda modificación relevante en la arquitectura del sistema deberá reflejarse en este documento.

## 10.16 Estudio Bíblico con IA

El módulo Biblia incorpora estudios asistidos por IA sin sustituir el lector ni el comparador. La Biblia
Platense / Straubinger es el texto principal; Torres Amat y Scío se utilizan como apoyo comparativo.

El backend PHP es el único autorizado para reunir textos, notas y metadatos, llamar al proveedor y guardar
resultados. La IA nunca consultará traducciones externas ni recibirá datos personales. Los estudios se
almacenan como JSON puro en `lvj_bib_estudios_ia`; cada petición se audita en
`lvj_bib_estudios_ia_solicitudes`. La clave de reutilización es SHA-256 del contexto normalizado y la versión
del método. Un resultado en caché no consume el límite mensual del usuario. Los estudios aprobados,
revisados y públicos podrán consultarse por invitados sin autenticación y sin consumo de cupo; solamente
la generación de un contexto nuevo mediante el proveedor de IA requerirá una cuenta autenticada.

La generación requiere una cuenta autenticada mediante Supabase Auth. La identidad externa se relacionará
con el usuario interno de `lvj_com_usuarios`; los roles y permisos seguirán administrándose en MySQL. La
lectura bíblica, las notas y la comparación básica permanecerán disponibles para invitados.

El módulo administrativo existente `Usuarios y Comunidad > Usuarios app` es la interfaz oficial para
consultar y mantener estas cuentas. Solo un `super_admin` puede sincronizar identidades desde Supabase,
activar o suspender el acceso y autorizar el uso de IA. La sincronización utiliza
`SUPABASE_SERVICE_ROLE_KEY` exclusivamente desde PHP; esta clave nunca se expondrá al frontend.

`lvj_com_usuarios` almacenará el correo confirmado, `auth_provider`, `auth_subject`, `email_verificado`,
`ia_autorizado` y `ultimo_acceso_at`. Cada operación de IA deberá validar nuevamente el token de Supabase,
el estado del usuario y su autorización para IA antes de aplicar la cuota por `usuario_id`. El acceso por
correo se limitará a los proveedores configurados oficialmente. Un invitado podrá consultar la comparación
de versiones, pero deberá registrar y confirmar su correo antes de solicitar un estudio nuevo.

`lvj_com_usuarios` almacenará el correo confirmado, `auth_provider`, `auth_subject`, `email_verificado`,
`ia_autorizado` y `ultimo_acceso_at`. Cada operación de IA deberá validar nuevamente el token de Supabase,
el estado del usuario y su autorización para IA antes de aplicar la cuota por `usuario_id`. El acceso por
correo se limitará a los proveedores configurados oficialmente. Un invitado podrá consultar la comparación
de versiones, pero deberá registrar y confirmar su correo antes de solicitar un estudio nuevo.

Todo estudio nuevo inicia en estado `revision`. El solicitante puede verlo con advertencia editorial; solo
los estudios aprobados podrán marcarse `publicado`, `revisado = 1` y `es_publico = 1`. La interfaz pública
utilizará pestañas Texto, Comparación, Estructura, Teología y Oración, conservando la identidad negra, dorada
y blanca. La selección permitirá estudiar el capítulo completo o un rango continuo de versículos del
mismo capítulo mediante una cuadrícula. No se aplicará un límite fijo de versículos; el Backend validará
que todos los versículos solicitados existan en la versión principal.

El sostenimiento del módulo permanecerá separado del acceso bíblico: la comparación y los estudios ya
publicados serán gratuitos. La interfaz podrá invitar a un aporte voluntario mediante la ruta oficial
`/donar`, sin convertir la donación en requisito para leer contenido existente ni crear un flujo económico
paralelo al módulo Economía.

Los proveedores implementarán `BibleStudyAiProviderInterface` y se seleccionarán mediante
`BIBLE_AI_PROVIDER`. Las claves, modelo, timeout, tokens máximos y cupo mensual se definirán exclusivamente
mediante variables de entorno. OpenAI y Gemini son adaptadores independientes.

Antes de modificar cualquiera de los siguientes elementos:

- Arquitectura General.
- Base de Datos.
- APIs.
- Backend.
- Frontend.
- Panel Administrativo.
- Módulos funcionales.
- Integraciones.
- Seguridad.

deberá verificarse si el cambio requiere una actualización de AGENTS.md.

La documentación deberá mantenerse sincronizada con la implementación para garantizar que AGENTS.md continúe siendo la fuente oficial de referencia del proyecto.

---

# Fuente Oficial

AGENTS.md constituye la documentación técnica oficial del proyecto **La Voz de Jesús (LVJ)**.

Ante cualquier diferencia entre la implementación del sistema y este documento, deberá verificarse cuál representa la arquitectura oficialmente aprobada y actualizar la documentación o el código según corresponda.

---

**Fin del documento — AGENTS.md v2.1**

## 10.16.1 Formato maestro y niveles del Estudio Bíblico IA

El formato JSON avanzado validado con el estudio mejorado del Salmo 8 constituye la base compartida de
todos los estudios. Sus claves se conservan para compatibilidad editorial y cada nivel define la profundidad
y las secciones prioritarias, sin crear tablas, APIs ni formatos paralelos:

- `pastoral`: comprensión sencilla, mensaje cristológico prudente, aplicación, meditación y Lectio Divina;
- `teologico`: comparación, delimitación, estructura, proposiciones, semántica, contexto y teología;
- `doctrinal`: interpretación católica según Escritura, Catecismo, Magisterio y fuentes verificadas;
- `formador`: desarrollo completo del formato maestro para catequesis, clases y encuentros.

La clave de reutilización incorporará pasaje normalizado, nivel, idioma, versión del método, versión del
esquema, versiones de los textos y versión de las notas. Un estudio de un nivel nunca podrá satisfacer una
consulta de otro nivel. Los registros anteriores se consideran `formador`, pues corresponden al formato
completo existente.

La reutilización admite cobertura de rangos: si existe un estudio vigente del mismo libro, capítulo, nivel y
versiones cuyo intervalo contiene todos los versículos solicitados, se devolverá ese registro sin insertar ni
generar otro. Se prioriza una coincidencia exacta y después el intervalo vigente más pequeño que cubra la
selección. Por ello, un estudio de capítulo completo puede atender todas las selecciones parciales de ese
capítulo; una selección parcial nunca podrá atender una solicitud que exceda su intervalo.

La navegación y selección de pasajes dentro del ecosistema Biblia utilizará cuadrículas táctiles para libros,
capítulos y versículos. Los libros se organizan por Antiguo y Nuevo Testamento; los capítulos y versículos se
presentan como botones numéricos. Este patrón compartido se aplicará al lector, comparador y estudio bíblico.
Los selectores de versión, filtros y otras opciones que no representan una referencia bíblica podrán conservar
controles distintos.

En Estudio Bíblico IA, la elección del nivel abre una vista dedicada y reemplaza temporalmente las tarjetas de
nivel. Esta vista incluye búsqueda de libros, testamentos, categorías visuales, cuadrícula de capítulos y,
después de escoger capítulo, cuadrícula de versículos. El usuario podrá regresar explícitamente para cambiar
el nivel sin iniciar una consulta ni perder involuntariamente el contexto ya seleccionado.

La estabilización inicial admite dos familias de contenido almacenado: el formato maestro anterior
`salmo8-1.0` y el esquema doctrinal `2.x`. El frontend elegirá el renderizador por la versión declarada dentro
del contenido, preservando la lectura de estudios anteriores. El panel administrativo validará la estructura,
el nivel y las traducciones permitidas antes de guardar una edición manual, sincronizará `nivel` y
`esquema_version` con el contenido validado y devolverá siempre el estudio al estado `revision`. En esta fase
no se incorpora biblioteca semántica ni se modifican las tablas existentes.

El flujo obligatorio será Base de Datos → textos Platense/Straubinger, Torres Amat y Scío habilitado → notas
vinculadas al pasaje → equivalencias aprobadas → estudio almacenado → IA solo si falta una versión vigente →
persistencia → presentación. Scío se habilitará progresivamente por libro: la versión podrá permanecer activa
mientras `lvj_bib_libros.estado` determine cuáles libros superaron la revisión editorial. Los libros, capítulos
o versículos todavía no habilitados no se completarán con fuentes externas; la API y el Estudio Bíblico
mostrarán un mensaje explícito de texto en revisión.

## 10.17 Centro de Formación y Supervisión IA

El Panel Administrativo incorpora un módulo técnico independiente denominado **Centro de Formación y
Supervisión IA**. Este módulo no pertenece a Estudios Bíblicos IA y no utilizará las tablas
`lvj_bib_estudios_ia` ni `lvj_bib_estudios_ia_solicitudes` como almacenamiento de entrenamiento.

El Centro administrará exclusivamente las tablas `lvj_ai_*` existentes:

- `lvj_ai_profiles`;
- `lvj_ai_prompt_versions`;
- `lvj_ai_rules`;
- `lvj_ai_profile_rules`;
- `lvj_ai_knowledge_sources`;
- `lvj_ai_source_files`;
- `lvj_ai_examples`;
- `lvj_ai_test_cases`;
- `lvj_ai_test_runs`;
- `lvj_ai_test_results`;
- `lvj_ai_response_logs`;
- `lvj_ai_response_reviews`;
- `lvj_ai_deployments`;
- `lvj_ai_settings`;
- `lvj_ai_audit_logs`.

El módulo permitirá organizar perfiles, instrucciones versionadas, reglas, fuentes verificables, ejemplos,
pruebas, evaluaciones, revisiones, despliegues, configuración y auditoría. Las ejecuciones, respuestas,
resultados, archivos vinculados, despliegues y auditoría se tratarán como registros técnicos de consulta
cuando no exista una acción especializada segura.

El acceso requerirá sesión administrativa y rol `super_admin`. Ocultar el enlace lateral no sustituirá la
validación directa del Backend. El módulo no almacenará claves API, no modificará variables de entorno, no
publicará automáticamente versiones de instrucciones y no cambiará la integración con OpenAI.

La navegación oficial será:

```text
Panel Administrativo
    └── Inteligencia Artificial
        └── Centro de Formación y Supervisión IA
            ├── Perfiles
            ├── Versiones de instrucciones
            ├── Reglas
            ├── Fuentes
            ├── Ejemplos
            ├── Pruebas
            ├── Supervisión
            ├── Despliegues
            ├── Configuración
            └── Auditoría
```


---

## Control visual global de LVJPRAYER (septiembre de 2026)

La apariencia institucional de la aplicación se administra exclusivamente desde `lvj_cfg_apariencia`.
No se crearán tablas paralelas para temas visuales.

Reglas obligatorias:

- Solo un tema puede estar activo por `emisora_id`.
- La activación se realiza desde `app-admin → Configuración → Apariencia`.
- La PWA consume el tema activo mediante `/api/config`.
- Los temas globales controlan fondo, superficies, tarjetas, botones, iconos, navegación,
  formularios, progreso, estados, bordes, overlays y tipografías.
- Las preferencias personales de lectura continúan separadas en `prefsLectura`;
  no deben ser sustituidas por el tema global.
- Los nuevos campos visuales se agregan mediante migraciones idempotentes y nunca se
  ejecutan automáticamente en producción.
- Los endpoints deben tolerar temporalmente el esquema anterior mientras la migración
  aún no se haya aplicado.
- Los componentes compartidos deben consumir variables CSS del tema y evitar colores
  hardcodeados cuando el elemento pertenezca a la apariencia institucional.
