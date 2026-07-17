# AGENTS.md
# Proyecto La Voz de Jesús (LVJ)
## Manual Oficial de Arquitectura y Desarrollo
### Versión 2.0
**Estado:** Documento Maestro de Desarrollo  
**Última actualización:** Julio de 2026  
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

Todos los módulos de contenido siguen el mismo flujo operativo.

```
Panel Administrativo

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

Toda modificación deberá realizarse desde el Panel Administrativo.

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

Administrar el contenido litúrgico diario de la Iglesia.

Incluye:

- Primera lectura.
- Salmo.
- Segunda lectura.
- Evangelio.
- Reflexión.
- Oración.
- Compromiso.
- Recursos gráficos.

---

## Consumido por

✓ Liturgia del Día

✓ Home

✓ API Liturgia

✓ Panel Administrativo

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

- El contenido será administrado exclusivamente desde el Panel Administrativo.
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
- Oraciones.
- Capillas.
- Programas.

Los favoritos deberán almacenarse mediante referencias (IDs), nunca duplicando el contenido original.

---

# 3.7.7 Testimonios

## Propósito

Administrar los testimonios compartidos por los usuarios.

## Responsabilidad

Registrar:

- Conversión.
- Sanación.
- Liberación.
- Milagros.
- Experiencias de fe.
- Agradecimientos.

Los testimonios podrán estar sujetos a procesos de revisión y aprobación antes de hacerse públicos.

---

# 3.7.8 Peticiones

## Propósito

Administrar las intenciones y peticiones de oración realizadas por los usuarios.

## Tipos

- Salud.
- Familia.
- Trabajo.
- Conversión.
- Acción de gracias.
- Necesidades especiales.

Las peticiones podrán configurarse como:

- Públicas.
- Privadas.
- Moderadas.

En versiones futuras podrán integrarse con la Capilla Virtual y los Grupos de Oración.

---

# 3.7.9 Grupos

## Propósito

Administrar comunidades o grupos de oración dentro de la plataforma.

## Responsabilidad

Gestionar:

- Integrantes.
- Moderadores.
- Publicaciones.
- Actividades.
- Calendarios.
- Recursos compartidos.

El diseño permitirá la creación futura de grupos parroquiales, diocesanos y temáticos.

---

# 3.7.10 Comentarios

## Propósito

Administrar la participación de los usuarios sobre los diferentes contenidos del sistema.

## Alcance

Los comentarios podrán asociarse a:

- Liturgia.
- Biblioteca.
- Podcasts.
- Noticias.
- Testimonios.
- Formación.

Toda publicación deberá respetar las políticas de convivencia de la plataforma.

---

# 3.7.11 Relaciones Generales

```text
Usuarios

│

├── Favoritos

├── Testimonios

├── Peticiones

├── Grupos

└── Comentarios
```

Todos los registros comunitarios deberán mantener relación con un usuario registrado mediante claves foráneas.

---

# 3.7.12 Reglas Generales

El módulo Comunidad deberá cumplir las siguientes reglas:

- Toda participación estará asociada a un usuario.
- No duplicar información entre módulos.
- Utilizar claves foráneas para establecer relaciones.
- Permitir la moderación cuando corresponda.
- Mantener historial de auditoría en las acciones críticas.
- Respetar la privacidad de la información de los usuarios.

---

# 3.7.13 Seguridad y Moderación

La arquitectura del módulo deberá permitir implementar:

- Moderación de comentarios.
- Moderación de testimonios.
- Moderación de peticiones públicas.
- Gestión de reportes.
- Bloqueo de contenido inapropiado.
- Historial de acciones administrativas.

Estas funcionalidades podrán desarrollarse progresivamente sin modificar la estructura general del módulo.

---

# 3.7.14 Reglas para Codex

Antes de crear nuevas tablas relacionadas con Comunidad, Codex deberá verificar:

1. ¿La funcionalidad pertenece realmente al módulo Comunidad?
2. ¿Existe ya una tabla equivalente?
3. ¿Puede ampliarse una estructura existente?
4. ¿La información pertenece a otro módulo del sistema?

No crear estructuras duplicadas.

No almacenar información de autenticación mezclada con contenido comunitario.

No utilizar este módulo para funciones económicas, administrativas o editoriales.

---

# 3.7.15 Estado del Módulo

El módulo **Comunidad** constituye uno de los componentes estratégicos para la evolución de **La Voz de Jesús**.

Su arquitectura ha sido diseñada para permitir el crecimiento progresivo de la interacción entre los usuarios, manteniendo independencia respecto a los módulos de Contenido, Configuración, Capilla Virtual y Radio.

Las tablas correspondientes a este módulo se documentarán individualmente en los apartados siguientes del Diccionario Oficial de Base de Datos, siguiendo el estándar definido en el presente capítulo.

# 3.8 Diccionario Oficial de Datos – Módulo Infraestructura

## 3.8.1 Objetivo

El módulo **Infraestructura** agrupa las tablas encargadas de proporcionar los servicios técnicos necesarios para el funcionamiento de la plataforma **La Voz de Jesús (LVJ)**.

A diferencia de los módulos de Contenido o Comunidad, estas tablas no representan información pastoral ni interacción directa con los usuarios, sino que administran recursos internos, almacenamiento, archivos, monitoreo, registros técnicos y servicios de apoyo.

Este módulo constituye la base técnica sobre la cual opera toda la aplicación.

Su diseño busca garantizar:

- Estabilidad.
- Escalabilidad.
- Administración centralizada.
- Trazabilidad.
- Seguridad.
- Optimización del almacenamiento.
- Mantenimiento del sistema.

---

# 3.8.2 Componentes del Módulo

El módulo Infraestructura está compuesto por los siguientes componentes:

```text
Infraestructura

│

├── Publicidad

├── FileServer

├── Multimedia

├── Logs

└── Legacy
```

Cada uno de estos componentes cumple una responsabilidad técnica específica y deberá mantenerse desacoplado de los módulos funcionales de la aplicación.

---

# 3.8.3 Arquitectura General

Todos los componentes de Infraestructura siguen el siguiente flujo operativo.

```text
Panel Administrativo

↓

API

↓

Base de Datos

↓

Servicios

↓

Aplicación
```

Los usuarios finales nunca interactúan directamente con estas tablas.

Toda modificación deberá realizarse mediante el Panel Administrativo o procesos internos autorizados.

---

# 3.8.4 Módulo Publicidad

## Propósito

Administrar todos los espacios publicitarios e institucionales de la plataforma.

## Responsabilidad

Gestionar:

- Campañas.
- Banners.
- Posiciones.
- Fechas de vigencia.
- Prioridades.
- Estadísticas.
- Impresiones.
- Clics.

La publicidad deberá administrarse completamente desde la Base de Datos.

Nunca escribir banners directamente en el código.

---

## Consumido por

✓ Home

✓ PWA

✓ Sitio Web

✓ Panel Administrativo

✓ API Publicidad

---

# 3.8.5 Módulo FileServer

## Propósito

Administrar el almacenamiento físico y lógico de archivos utilizados por la plataforma.

## Responsabilidad

Gestionar:

- Carpetas.
- Archivos.
- Versiones.
- Permisos.
- Metadatos.
- Historial de cambios.

El FileServer permitirá administrar recursos almacenados en:

- Servidor local.
- FTP.
- Cloudflare R2.
- CDN.
- Otros servicios compatibles.

La Base de Datos almacenará únicamente la información descriptiva de los archivos.

Nunca el contenido binario.

---

## Consumido por

✓ Panel Administrativo

✓ Biblioteca

✓ Multimedia

✓ Recursos Pastorales

✓ API FileServer

---

# 3.8.6 Módulo Multimedia

## Propósito

Administrar todos los recursos audiovisuales utilizados por la plataforma.

## Responsabilidad

Gestionar:

- Imágenes.
- Videos.
- Audios.
- Logos.
- Íconos.
- Banners.
- Recursos gráficos.

Los archivos físicos permanecerán almacenados en servidores externos o sistemas de almacenamiento, mientras que la Base de Datos conservará únicamente los metadatos necesarios para su administración.

---

## Relaciones

Los recursos multimedia podrán ser utilizados por cualquier módulo del sistema mediante referencias.

Ejemplos:

- Radio.
- Capilla Virtual.
- Liturgia.
- Biblioteca.
- Formación.
- Publicidad.

Nunca duplicar un mismo recurso multimedia en diferentes tablas.

---

# 3.8.7 Módulo Logs

## Propósito

Registrar todos los eventos técnicos y administrativos generados por la plataforma.

## Responsabilidad

Almacenar:

- Errores.
- Eventos.
- Acciones administrativas.
- Cambios de configuración.
- Auditorías.
- Procesos automáticos.
- Fallos de reproducción.
- Eventos de seguridad.

Los Logs permiten reconstruir el comportamiento del sistema y facilitar tareas de mantenimiento y diagnóstico.

---

## Tipos de Logs

El sistema podrá administrar diferentes categorías de registros.

Ejemplos:

- Logs Administrativos.
- Logs del Sistema.
- Logs de Seguridad.
- Logs de Streaming.
- Logs de APIs.
- Logs de Cron.
- Logs de FileServer.

Cada categoría podrá implementarse mediante tablas independientes o mediante una arquitectura unificada de auditoría.

---

# 3.8.8 Módulo Legacy

## Propósito

Agrupar las tablas heredadas de versiones anteriores del proyecto.

Estas tablas permanecerán disponibles únicamente por razones de compatibilidad, consulta histórica o procesos de migración.

No deberán utilizarse para nuevos desarrollos.

---

## Reglas

Las tablas Legacy:

- no deberán ampliarse;
- no deberán reutilizarse para nuevas funcionalidades;
- deberán documentar claramente su estado;
- deberán indicar el módulo que las reemplaza.

Cuando una tabla Legacy deje de ser necesaria deberá planificarse su eliminación mediante una migración documentada.

---

# 3.8.9 Relaciones Generales

```text
Infraestructura

│

├── Publicidad

├── FileServer

├── Multimedia

├── Logs

└── Legacy
```

Estos componentes podrán ser utilizados por cualquier módulo del sistema mediante APIs y relaciones documentadas.

---

# 3.8.10 Reglas Generales

Todos los módulos de Infraestructura deberán cumplir las siguientes reglas:

- No almacenar información pastoral.
- No duplicar recursos multimedia.
- Mantener auditoría de las acciones críticas.
- Administrar todos los recursos mediante el Panel Administrativo.
- Centralizar el almacenamiento de archivos.
- Evitar configuraciones escritas directamente en el código.

---

# 3.8.11 Reglas para Codex

Antes de crear nuevas tablas relacionadas con Infraestructura, Codex deberá verificar:

1. ¿La funcionalidad pertenece realmente al módulo Infraestructura?
2. ¿Existe una tabla equivalente?
3. ¿Puede ampliarse una estructura existente?
4. ¿El recurso ya está siendo administrado por otro componente?

Está prohibido:

- Crear tablas duplicadas para archivos.
- Almacenar imágenes, videos o audios directamente en MySQL.
- Reutilizar tablas Legacy para nuevas funcionalidades.
- Duplicar registros de auditoría en diferentes tablas sin justificación.

Toda modificación deberá respetar la arquitectura oficial del módulo.

---

# 3.8.12 Estado del Módulo

El módulo **Infraestructura** constituye el soporte técnico de la plataforma **La Voz de Jesús**.

Su correcta implementación garantiza que los recursos multimedia, archivos, registros de auditoría y componentes técnicos permanezcan organizados, reutilizables y desacoplados de la lógica funcional de la aplicación.

Las tablas pertenecientes a este módulo se documentarán individualmente en los apartados siguientes del Diccionario Oficial de Base de Datos, siguiendo el estándar establecido en este capítulo.

# 3.9 Modelo Relacional General

## 3.9.1 Objetivo

El **Modelo Relacional General** representa el mapa lógico de las relaciones existentes entre los módulos y las tablas principales de la base de datos del proyecto **La Voz de Jesús (LVJ)**.

Su propósito es facilitar la comprensión de:

- las dependencias entre entidades;
- las relaciones padre-hijo;
- las claves foráneas;
- el flujo de información entre módulos;
- las tablas que actúan como fuente oficial de datos;
- las estructuras heredadas que no deben utilizarse;
- los puntos que todavía requieren consolidación.

Este modelo es una representación lógica y documental. No sustituye la verificación física de restricciones, índices y claves foráneas en MySQL.

Antes de asumir que una relación está protegida por la base de datos, deberá comprobarse en `information_schema` que existe una restricción `FOREIGN KEY` real. Un índice cuyo nombre comience por `fk_` no demuestra por sí solo la existencia de integridad referencial.

---

## 3.9.2 Principios del modelo relacional

Las relaciones del proyecto deberán respetar los siguientes principios:

1. Cada tabla deberá tener una responsabilidad claramente definida.
2. Las relaciones deberán realizarse mediante identificadores y no mediante textos descriptivos.
3. Las claves primarias y foráneas deberán utilizar tipos compatibles.
4. Una tabla hija no deberá referenciar un registro inexistente.
5. Las relaciones obligatorias deberán validarse tanto en la base de datos como en el backend.
6. Las relaciones polimórficas deberán estar expresamente documentadas y validadas.
7. Los registros con `deleted_at` no deberán considerarse activos en consultas públicas.
8. Las tablas legacy no deberán relacionarse con nuevas estructuras salvo durante una migración controlada.
9. No deberán crearse relaciones duplicadas para representar la misma responsabilidad.
10. Toda modificación relacional deberá actualizar este capítulo.

---

## 3.9.3 Leyenda de los diagramas

Los diagramas ASCII utilizarán las siguientes convenciones:

```text
1 ───── N
```

Relación de uno a muchos.

```text
1 ───── 1
```

Relación de uno a uno.

```text
N ───── N
```

Relación de muchos a muchos, normalmente resuelta mediante una tabla intermedia.

```text
─────>
```

La tabla situada a la izquierda es referenciada por la tabla situada a la derecha.

```text
[CONFIGURACIÓN]
```

Tabla que define el comportamiento operativo de un módulo.

```text
[LEGACY]
```

Tabla heredada que no debe utilizarse en nuevos desarrollos.

```text
[REVISAR]
```

Relación lógica o decisión arquitectónica que todavía debe verificarse o consolidarse.

---

# 3.9.4 Mapa general por dominios

```text
                              BASE DE DATOS LVJ

                                      │
          ┌───────────────────────────┼───────────────────────────┐
          │                           │                           │
          ▼                           ▼                           ▼

   ADMINISTRACIÓN              CONFIGURACIÓN                 COMUNIDAD
          │                           │                           │
          ├── Roles                  ├── Emisora                  ├── Usuarios
          ├── Logs                   ├── Aplicación               ├── Favoritos
          └── Auditoría              ├── Apariencia               ├── Grupos
                                      └── Redes sociales          ├── Peticiones
                                                                  ├── Testimonios
                                                                  └── Notas

          ┌───────────────────────────┼───────────────────────────┐
          │                           │                           │
          ▼                           ▼                           ▼

       CAPILLA                      RADIO                    CONTENIDOS
          │                           │                           │
          ├── Capillas               ├── Streams                  ├── Biblia
          ├── Streams                ├── Locutores                 ├── Liturgia
          ├── Configuración          ├── Programas                 ├── Santoral
          └── Logs                   └── Programación              ├── Oraciones
                                                                  ├── Podcast
                                                                  ├── Biblioteca
                                                                  └── Formación

          ┌───────────────────────────┼───────────────────────────┐
          │                           │                           │
          ▼                           ▼                           ▼

       ECONOMÍA                  PUBLICIDAD                 INFRAESTRUCTURA
          │                           │                           │
          ├── Apoyos                 ├── Campañas                 ├── Carpetas
          ├── Donaciones             ├── Patrocinadores           ├── Archivos
          ├── Planes                 ├── Impresiones              ├── Usuarios FileServer
          ├── Padrinos               └── Clics                    └── Logs FileServer
          └── Bonos

                                      │
                                      ▼

                                   LEGACY
                                      │
                                      ├── configs
                                      ├── settings
                                      ├── themes
                                      ├── radios
                                      ├── genres
                                      ├── radios_cat
                                      ├── users
                                      └── tmp_programacion_radio
```

---

# 3.9.5 Administración, identidad y auditoría

## Relación principal

```text
lvj_adm_roles
      │
      │ 1
      │
      └──────────────────── N
                       lvj_com_usuarios
                              │
                              │ 1
                              │
                              ├──────────────────── N  lvj_adm_logs
                              ├──────────────────── N  lvj_com_favoritos
                              ├──────────────────── N  lvj_com_notas_espirituales
                              ├──────────────────── N  lvj_com_peticiones_oracion
                              ├──────────────────── N  lvj_com_testimonios
                              ├──────────────────── N  lvj_com_grupo_miembros
                              ├──────────────────── N  lvj_bib_notas_usuario
                              ├──────────────────── N  lvj_bib_progreso_planes
                              ├──────────────────── N  lvj_for_progreso_cursos
                              ├──────────────────── N  lvj_eco_donaciones
                              └──────────────────── N  lvj_eco_padrinos
```

## Relaciones documentadas

```text
lvj_adm_roles.id
    → lvj_com_usuarios.rol_id

lvj_com_usuarios.id
    → lvj_adm_logs.usuario_id

lvj_com_usuarios.id
    → lvj_com_favoritos.usuario_id

lvj_com_usuarios.id
    → lvj_com_notas_espirituales.usuario_id

lvj_com_usuarios.id
    → lvj_com_peticiones_oracion.usuario_id

lvj_com_usuarios.id
    → lvj_com_testimonios.usuario_id

lvj_com_usuarios.id
    → lvj_com_grupo_miembros.usuario_id

lvj_com_usuarios.id
    → lvj_bib_notas_usuario.usuario_id

lvj_com_usuarios.id
    → lvj_bib_progreso_planes.usuario_id

lvj_com_usuarios.id
    → lvj_for_progreso_cursos.usuario_id

lvj_com_usuarios.id
    → lvj_eco_donaciones.usuario_id

lvj_com_usuarios.id
    → lvj_eco_padrinos.usuario_id
```

## Regla arquitectónica

`lvj_com_usuarios` constituye la identidad oficial de los usuarios generales de la plataforma.

Las tablas `lvj_file_users` y `users` representan identidades separadas o heredadas y deberán someterse a un proceso futuro de consolidación. No deberán crearse nuevas tablas de usuarios por módulo.

---

# 3.9.6 Configuración general de la aplicación

```text
lvj_cfg_emisora
      │
      │ 1
      │
      ├──────────────────── N  lvj_cfg_app
      ├──────────────────── N  lvj_cfg_apariencia
      └──────────────────── N  lvj_cfg_redes_sociales
```

## Relaciones documentadas

```text
lvj_cfg_emisora.id
    → lvj_cfg_app.emisora_id

lvj_cfg_emisora.id
    → lvj_cfg_apariencia.emisora_id

lvj_cfg_emisora.id
    → lvj_cfg_redes_sociales.emisora_id
```

## Flujo funcional

```text
lvj_cfg_emisora
        │
        ├── Identidad institucional
        ├── Datos de contacto
        ├── Logos
        └── Recursos generales
                │
                ├── lvj_cfg_app
                │       └── Módulos visibles y comportamiento PWA
                │
                ├── lvj_cfg_apariencia
                │       └── Tema visual general
                │
                └── lvj_cfg_redes_sociales
                        └── Enlaces externos oficiales
```

## Regla arquitectónica

La configuración general no deberá duplicarse en archivos PHP, JavaScript, JSON o componentes del frontend cuando exista un campo equivalente en estas tablas.

---

# 3.9.7 Capilla Virtual

## Modelo principal

```text
lvj_capillas
      │
      │ 1
      │
      ├──────────────────── N  lvj_capilla_streams
      │                            │
      │                            │ 1
      │                            ├────────────── N  lvj_capilla_logs
      │                            │
      │                            └────────────── 1  lvj_capilla_config.stream_activo_id
      │
      ├──────────────────── N  lvj_capilla_logs
      │
      └──────────────────── 1  lvj_capilla_config.capilla_activa_id
```

## Relaciones documentadas

```text
lvj_capillas.id
    → lvj_capilla_streams.capilla_id

lvj_capillas.id
    → lvj_capilla_config.capilla_activa_id

lvj_capilla_streams.id
    → lvj_capilla_config.stream_activo_id

lvj_capillas.id
    → lvj_capilla_logs.capilla_id

lvj_capilla_streams.id
    → lvj_capilla_logs.stream_id
```

## Flujo público

```text
Pantalla /capilla
        │
        ▼
API pública de Capilla
        │
        ▼
lvj_capilla_config
        │
        ├── capilla_activa_id
        │        │
        │        ▼
        │   lvj_capillas
        │
        └── stream_activo_id
                 │
                 ▼
         lvj_capilla_streams
                 │
                 ▼
           Reproductor
```

## Reglas obligatorias

1. La pantalla pública debe consultar primero `lvj_capilla_config`.
2. El `stream_activo_id` debe pertenecer a `capilla_activa_id`.
3. La capilla y el stream deben estar activos.
4. Los registros eliminados lógicamente deberán excluirse.
5. `es_principal` se interpreta dentro de cada capilla.
6. Varias capillas diferentes pueden tener un stream principal.
7. `prioridad` ordena los streams dentro de una misma capilla.
8. No existe ni se necesita `orden_fallback`.
9. Las URLs de reproducción pertenecen exclusivamente a `lvj_capilla_streams`.
10. `lvj_capillas` no debe almacenar URLs de reproducción.

## Fallback futuro

```text
lvj_capilla_config.stream_activo_id
                │
                ▼
       Stream activo configurado
                │
        ¿Está disponible?
          │            │
         Sí            No
          │            │
          ▼            ▼
     Reproducir   Consultar streams activos
                        │
                        ▼
                ORDER BY prioridad ASC
                        │
                        ▼
                  Siguiente stream
```

Esta lógica se encuentra planeada y no deberá asumirse como implementada hasta que una tarea específica la autorice.

---

# 3.9.8 Radio y programación

```text
lvj_rad_locutores
      │
      │ 1
      │
      └──────────────────── N  lvj_rad_programas
                                    │
                                    │ 1
                                    │
                                    └──────────────────── N  lvj_rad_programacion


lvj_rad_streams
      │
      └── Fuente independiente del reproductor de radio
```

## Relaciones documentadas

```text
lvj_rad_locutores.id
    → lvj_rad_programas.locutor_id

lvj_rad_programas.id
    → lvj_rad_programacion.programa_id
```

## Flujo funcional de contenidos

```text
lvj_rad_locutores
        │
        ▼
lvj_rad_programas
        │
        ▼
lvj_rad_programacion
        │
        ▼
Parrilla semanal
```

## Flujo funcional de transmisión

```text
lvj_rad_streams
        │
        ├── Stream principal
        ├── Stream de respaldo
        ├── Metadatos
        ├── Formato
        ├── Calidad
        └── Prioridad
                │
                ▼
         Reproductor de radio
```

## Regla arquitectónica

La identidad de un programa y su horario deben permanecer separados. Los streams oficiales deben provenir de `lvj_rad_streams`, no de la tabla legacy `radios`.

---

# 3.9.9 Biblia, notas y planes de lectura

## Estructura editorial

```text
lvj_bib_versiones
      │
      │ 1
      │
      ├──────────────────── N  lvj_bib_libros
      │                            │
      │                            │ 1
      │                            ├────────────── N  lvj_bib_versiculos
      │                            ├────────────── N  lvj_bib_notas_usuario
      │                            └────────────── N  lvj_bib_notas_versiones
      │
      ├──────────────────── N  lvj_bib_versiculos
      ├──────────────────── N  lvj_bib_notas_usuario
      └──────────────────── N  lvj_bib_notas_versiones
```

## Clasificación temática

```text
lvj_bib_versiculos
      │
      │ 1
      │
      └──────────────────── N  lvj_bib_versiculos_tematicos
```

## Planes de lectura

```text
lvj_bib_planes
      │
      │ 1
      │
      ├──────────────────── N  lvj_bib_plan_dias
      │
      └──────────────────── N  lvj_bib_progreso_planes
                                     ▲
                                     │
                                     N
                              lvj_com_usuarios
```

## Relaciones documentadas

```text
lvj_bib_versiones.id
    → lvj_bib_libros.version_id

lvj_bib_versiones.id
    → lvj_bib_versiculos.version_id

lvj_bib_libros.id
    → lvj_bib_versiculos.libro_id

lvj_bib_versiculos.id
    → lvj_bib_versiculos_tematicos.versiculo_id

lvj_com_usuarios.id
    → lvj_bib_notas_usuario.usuario_id

lvj_bib_versiones.id
    → lvj_bib_notas_usuario.version_id

lvj_bib_libros.id
    → lvj_bib_notas_usuario.libro_id

lvj_bib_versiones.id
    → lvj_bib_notas_versiones.version_id

lvj_bib_libros.id
    → lvj_bib_notas_versiones.libro_id

lvj_bib_planes.id
    → lvj_bib_plan_dias.plan_id

lvj_com_usuarios.id
    → lvj_bib_progreso_planes.usuario_id

lvj_bib_planes.id
    → lvj_bib_progreso_planes.plan_id
```

## Regla arquitectónica

Los textos bíblicos se identifican por versión, libro, capítulo y versículo. No deberán duplicarse en tablas temáticas, notas o planes cuando pueda utilizarse una referencia estructurada.

---

# 3.9.10 Liturgia, Lectio Divina y Santoral

## Modelo lógico actual

```text
lvj_lit_tipos_celebracion
      │
      │ 1
      │
      └──────────────────── N  lvj_lit_celebraciones


lvj_lit_tiempos
      │
      │ 1
      │
      ├──────────────────── N  lvj_lit_temas
      │                            │
      │                            └────────────── N  lvj_lit_lectura_dia
      │
      ├──────────────────── N  lvj_lit_lectura_dia
      ├──────────────────── N  lvj_lit_dia
      └──────────────────── N  lvj_ora_devociones


lvj_san_santo_dia
      │
      │ 1
      │
      └──────────────────── N  lvj_lit_lectura_dia


[TABLA DIARIA CANÓNICA PENDIENTE DE CONSOLIDACIÓN]
      │
      ├──────────────────── 1  lvj_lit_lectio_divina
      └──────────────────── N  lvj_lit_palabra_dia
```

## Relaciones documentadas

```text
lvj_lit_tipos_celebracion.id
    → lvj_lit_celebraciones.tipo_id

lvj_lit_tiempos.id
    → lvj_lit_temas.tiempo_id

lvj_lit_tiempos.id
    → lvj_lit_lectura_dia.tiempo_id

lvj_lit_temas.id
    → lvj_lit_lectura_dia.tema_id

lvj_san_santo_dia.id
    → lvj_lit_lectura_dia.santo_id

lvj_lit_tiempos.id
    → lvj_lit_dia.tiempo_id

lvj_lit_tiempos.id
    → lvj_ora_devociones.tiempo_id
```

## Relación pendiente de consolidación

```text
lvj_lit_lectio_divina.liturgia_id
    → [REVISAR: lvj_lit_lectura_dia.id o lvj_lit_dia.id]

lvj_lit_palabra_dia.liturgia_id
    → [REVISAR: tabla diaria canónica]
```

## Regla arquitectónica

Antes de conectar nuevas interfaces deberá definirse formalmente la tabla canónica para el contenido litúrgico diario.

La recomendación actual es utilizar:

```text
lvj_lit_lectura_dia
```

como fuente editorial principal, debido a que contiene el conjunto más completo de lecturas, reflexión, oración y recursos multimedia.

No deberán alimentarse simultáneamente varias tablas con el mismo contenido sin una estrategia explícita de sincronización.

---

# 3.9.11 Oraciones, devociones, rosarios y novenas

## Devociones y oraciones

```text
lvj_lit_tiempos
      │
      │ 1
      │
      └──────────────────── N  lvj_ora_devociones
                                     │
                                     │ 1
                                     │
                                     └──────────────────── N  lvj_ora_oraciones
```

## Rosarios

```text
lvj_ora_rosarios
      │
      │ 1
      │
      └──────────────────── N  lvj_ora_misterios_rosario
```

## Novenas

```text
lvj_ora_novenas
      │
      │ 1
      │
      └──────────────────── N  lvj_ora_novena_dias
```

## Relaciones documentadas

```text
lvj_lit_tiempos.id
    → lvj_ora_devociones.tiempo_id

lvj_ora_devociones.id
    → lvj_ora_oraciones.devocion_id

lvj_ora_rosarios.id
    → lvj_ora_misterios_rosario.rosario_id

lvj_ora_novenas.id
    → lvj_ora_novena_dias.novena_id
```

## Regla arquitectónica

Las estructuras detalladas por días o misterios deberán conservarse en sus tablas hijas. Los campos generales de contenido no deben duplicar innecesariamente la misma información estructurada.

---

# 3.9.12 Biblioteca, formación y progreso

## Biblioteca

```text
lvj_for_biblioteca
      │
      ├── archivo_url
      ├── imagen_url
      └── [REVISAR FUTURA RELACIÓN CON lvj_files.id]
```

## Formación

```text
lvj_for_cursos
      │
      │ 1
      │
      ├──────────────────── N  lvj_for_lecciones
      │                            │
      │                            │ 1
      │                            └────────────── N  lvj_for_progreso_cursos
      │
      └──────────────────── N  lvj_for_progreso_cursos
                                     ▲
                                     │
                                     N
                              lvj_com_usuarios
```

## Relaciones documentadas

```text
lvj_for_cursos.id
    → lvj_for_lecciones.curso_id

lvj_com_usuarios.id
    → lvj_for_progreso_cursos.usuario_id

lvj_for_cursos.id
    → lvj_for_progreso_cursos.curso_id

lvj_for_lecciones.id
    → lvj_for_progreso_cursos.leccion_id
```

## Relación futura recomendada

```text
lvj_files.id
    → lvj_for_biblioteca.file_id
```

Esta relación todavía no existe en el snapshot documentado y requerirá una migración formal. Las URLs actuales no deberán eliminarse hasta completar la transición.

---

# 3.9.13 Podcast

```text
lvj_pod_categorias
      │
      │ 1
      │
      └──────────────────── N  lvj_pod_podcasts
```

## Relación documentada

```text
lvj_pod_categorias.id
    → lvj_pod_podcasts.categoria_id
```

## Regla arquitectónica

Los audios deberán almacenarse mediante URL o referencia al sistema de archivos. La categoría no debe duplicarse como texto cuando exista `categoria_id`.

---

# 3.9.14 Comunidad y vida espiritual

## Grupos

```text
lvj_com_grupos_oracion
      │
      │ 1
      │
      └──────────────────── N  lvj_com_grupo_miembros
                                     ▲
                                     │
                                     N
                              lvj_com_usuarios
```

## Contenido generado por usuarios

```text
lvj_com_usuarios
      │
      │ 1
      │
      ├──────────────────── N  lvj_com_favoritos
      ├──────────────────── N  lvj_com_notas_espirituales
      ├──────────────────── N  lvj_com_peticiones_oracion
      └──────────────────── N  lvj_com_testimonios
```

## Relaciones documentadas

```text
lvj_com_grupos_oracion.id
    → lvj_com_grupo_miembros.grupo_id

lvj_com_usuarios.id
    → lvj_com_grupo_miembros.usuario_id

lvj_com_usuarios.id
    → lvj_com_favoritos.usuario_id

lvj_com_usuarios.id
    → lvj_com_notas_espirituales.usuario_id

lvj_com_usuarios.id
    → lvj_com_peticiones_oracion.usuario_id

lvj_com_usuarios.id
    → lvj_com_testimonios.usuario_id
```

## Relaciones polimórficas

Las tablas siguientes contienen relaciones lógicas mediante `tipo` y `referencia_id`:

```text
lvj_com_favoritos

lvj_com_notas_espirituales
```

Ejemplo:

```text
usuario
   │
   └── favorito
          ├── tipo = podcast
          └── referencia_id = 25
```

Estas relaciones no pueden protegerse completamente mediante una única clave foránea. El backend deberá validar que:

1. `tipo` sea uno de los valores permitidos.
2. `referencia_id` exista en la tabla correspondiente.
3. El recurso esté activo y accesible para el usuario.

---

# 3.9.15 Economía solidaria, donaciones y bonos

## Apoyos y donaciones

```text
lvj_eco_apoyos_emisora
      │
      │ 1
      │
      └──────────────────── N  lvj_eco_donaciones
                                     ▲
                                     │
                                     N
                              lvj_com_usuarios
```

## Padrinazgo

```text
lvj_eco_plan_padrino
      │
      │ 1
      │
      └──────────────────── N  lvj_eco_padrinos
                                     ▲
                                     │
                                     N
                              lvj_com_usuarios
```

## Bonos

```text
lvj_eco_bono_config
      │
      │ 1
      │
      ├──────────────────── N  lvj_eco_bono_numeros
      │
      └──────────────────── N  lvj_eco_bono_compras
```

## Relaciones documentadas

```text
lvj_eco_apoyos_emisora.id
    → lvj_eco_donaciones.apoyo_id

lvj_com_usuarios.id
    → lvj_eco_donaciones.usuario_id

lvj_eco_plan_padrino.id
    → lvj_eco_padrinos.plan_id

lvj_com_usuarios.id
    → lvj_eco_padrinos.usuario_id

lvj_eco_bono_config.id
    → lvj_eco_bono_numeros.bono_id

lvj_eco_bono_config.id
    → lvj_eco_bono_compras.bono_id
```

## Relación lógica adicional

```text
lvj_eco_bono_compras.numero
    → lvj_eco_bono_numeros.numero
```

La compra y el cambio de estado del número deberán ejecutarse dentro de una transacción para evitar ventas duplicadas.

---

# 3.9.16 Publicidad y patrocinadores

```text
lvj_pub_publicidad_comercial
      │
      │ 1
      │
      ├──────────────────── N  lvj_pub_clicks
      └──────────────────── N  lvj_pub_impresiones


lvj_pub_adsense
      │
      └── Configuración independiente de espacios publicitarios


lvj_pub_patrocinadores
      │
      └── Catálogo independiente de patrocinadores
```

## Relaciones documentadas

```text
lvj_pub_publicidad_comercial.id
    → lvj_pub_clicks.publicidad_id

lvj_pub_publicidad_comercial.id
    → lvj_pub_impresiones.publicidad_id
```

## Relación futura posible

```text
lvj_pub_patrocinadores
      │
      └── [FUTURA TABLA RELACIONAL]
              └── campañas o ubicaciones
```

No deberá mezclarse el patrocinio institucional permanente con las campañas publicitarias temporales sin una relación explícita.

---

# 3.9.17 FileServer y archivos

## Árbol de carpetas

```text
lvj_file_folders
      │
      │ 1
      │
      ├──────────────────── N  lvj_file_folders
      │                       mediante parent_id
      │
      └──────────────────── N  lvj_files
```

## Usuarios y auditoría del FileServer

```text
lvj_file_users
      │
      │ 1
      │
      ├──────────────────── N  lvj_files
      └──────────────────── N  lvj_file_logs
```

## Relaciones documentadas

```text
lvj_file_folders.id
    → lvj_file_folders.parent_id

lvj_file_folders.id
    → lvj_files.folder_id

lvj_file_users.id
    → lvj_files.uploaded_by

lvj_file_users.id
    → lvj_file_logs.user_id
```

## Regla arquitectónica

La autorrelación de carpetas no deberá permitir ciclos.

Ejemplo prohibido:

```text
Carpeta A
    └── Carpeta B
           └── Carpeta A
```

El FileServer mantiene actualmente una identidad separada mediante `lvj_file_users`. Esta estructura deberá revisarse antes de una futura consolidación con `lvj_com_usuarios` y `lvj_adm_roles`.

---

# 3.9.18 Tablas legacy

## Modelo heredado de radio

```text
genres
   │
   │ N
   │
   └──────────── radios_cat ──────────── N
                                      radios
```

## Configuración heredada

```text
configs

settings

themes
```

## Usuarios heredados

```text
users
```

## Programación temporal

```text
tmp_programacion_radio
```

## Reemplazos oficiales

```text
configs
    → lvj_cfg_app

settings
    → lvj_cfg_emisora
    → lvj_cfg_redes_sociales

themes
    → lvj_cfg_apariencia
    → lvj_lit_temas

radios
    → lvj_rad_streams

genres
    → [REVISAR CATEGORÍAS OFICIALES]

radios_cat
    → [RETIRAR DESPUÉS DE MIGRACIÓN]

users
    → lvj_com_usuarios

tmp_programacion_radio
    → lvj_rad_programas
    → lvj_rad_programacion
```

## Regla obligatoria

Las tablas legacy:

- no deberán recibir nuevas funcionalidades;
- no deberán ser consumidas por nuevos endpoints;
- no deberán relacionarse con tablas oficiales salvo durante una migración;
- no deberán eliminarse hasta verificar dependencias y respaldar la información;
- deberán contar con un plan documentado de retiro.

---

# 3.9.19 Relaciones transversales entre módulos

Algunas relaciones conectan módulos diferentes.

```text
lvj_com_usuarios
      │
      ├── Biblia
      │     ├── Notas
      │     └── Progreso de planes
      │
      ├── Formación
      │     └── Progreso de cursos
      │
      ├── Economía
      │     ├── Donaciones
      │     └── Padrinos
      │
      └── Comunidad
            ├── Grupos
            ├── Favoritos
            ├── Peticiones
            ├── Testimonios
            └── Notas espirituales


lvj_lit_tiempos
      │
      ├── Temas litúrgicos
      ├── Lecturas del día
      ├── Registro litúrgico alterno
      └── Devociones


lvj_san_santo_dia
      │
      └── Lectura del día


lvj_files
      │
      └── [FUTURA INTEGRACIÓN]
            ├── Biblioteca
            ├── Podcast
            ├── Formación
            ├── Publicidad
            ├── Liturgia
            └── Oraciones
```

Las relaciones transversales deben mantenerse limitadas y claramente justificadas para evitar un acoplamiento excesivo entre módulos.

---

# 3.9.20 Relaciones pendientes de auditoría física

Las relaciones documentadas en este capítulo provienen del diccionario de datos y de la arquitectura lógica del proyecto.

Antes de realizar operaciones que dependan de restricciones físicas, Codex deberá verificar:

```sql
SELECT
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, COLUMN_NAME;
```

También deberá revisar los índices:

```sql
SELECT
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    NON_UNIQUE
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;
```

La existencia de una relación lógica documentada no autoriza a asumir que existe una acción física como:

```text
ON DELETE CASCADE

ON UPDATE CASCADE

ON DELETE SET NULL
```

Estas acciones deberán confirmarse expresamente antes de modificar o eliminar registros relacionados.

---

# 3.9.21 Reglas de integridad entre módulos

1. Un stream de Capilla debe pertenecer a una capilla existente.
2. El stream activo debe corresponder a la capilla activa.
3. Un programa de radio debe relacionarse con un locutor existente cuando `locutor_id` no sea nulo.
4. Una programación debe referenciar un programa válido.
5. Un libro bíblico debe pertenecer a una versión.
6. Un versículo debe pertenecer a un libro y a una versión coherentes.
7. Una nota bíblica debe respetar la versión y el libro seleccionados.
8. Un día de plan debe pertenecer al plan indicado.
9. El progreso de un usuario no puede referenciar un plan o curso inexistente.
10. Una lección debe pertenecer al curso informado.
11. El progreso de una lección debe utilizar una lección del mismo curso.
12. Una petición, testimonio o nota privada debe respetar la identidad y privacidad de su usuario.
13. Un miembro de grupo debe referenciar un usuario y un grupo existentes.
14. Una donación debe referenciar un apoyo válido cuando `apoyo_id` sea obligatorio.
15. Un padrino debe pertenecer a un plan existente.
16. Un número de bono debe pertenecer a una campaña.
17. Una compra de bono debe reservar o vender un número de la misma campaña.
18. Una publicidad debe existir antes de registrar clics o impresiones.
19. Un archivo debe pertenecer a una carpeta válida cuando `folder_id` no sea nulo.
20. Una carpeta no puede ser descendiente de sí misma.
21. Una celebración debe utilizar un tipo de celebración válido.
22. Una lectura del día debe utilizar tiempos, temas y santos existentes cuando esos identificadores estén presentes.
23. Una oración debe pertenecer a una devoción válida cuando `devocion_id` no sea nulo.
24. Un misterio debe pertenecer al rosario informado.
25. Un día de novena debe pertenecer a la novena informada.
26. Un podcast debe pertenecer a una categoría válida.
27. Ningún nuevo módulo debe relacionarse con tablas legacy.

---

# 3.9.22 Reglas para Codex

Antes de modificar una relación, Codex deberá:

1. Leer completamente este modelo relacional.
2. Consultar el diccionario individual de las tablas involucradas.
3. Verificar los tipos reales de las columnas.
4. Confirmar índices y claves foráneas en `information_schema`.
5. Identificar registros huérfanos antes de crear una restricción.
6. Revisar el impacto en consultas, CRUD, APIs y panel administrativo.
7. Preparar una migración controlada.
8. Incluir estrategia de reversión.
9. Probar operaciones de creación, edición, desactivación y borrado lógico.
10. Actualizar este capítulo cuando cambie una relación oficial.

Codex no deberá:

- inventar relaciones no documentadas;
- crear claves foráneas con tipos incompatibles;
- utilizar `ON DELETE CASCADE` sin analizar el impacto;
- eliminar datos para forzar la creación de una restricción;
- relacionar nuevas tablas con estructuras legacy;
- asumir que una relación lógica ya existe físicamente;
- modificar varias relaciones fuera del alcance de la tarea;
- introducir dependencias circulares entre módulos.

---

# 3.9.23 Decisiones relacionales pendientes

Las siguientes decisiones deberán resolverse mediante tareas específicas:

## Liturgia diaria

Definir si la tabla canónica será:

```text
lvj_lit_lectura_dia
```

y establecer formalmente las relaciones de:

```text
lvj_lit_lectio_divina.liturgia_id

lvj_lit_palabra_dia.liturgia_id
```

---

## Identidad de usuarios

Definir el plan de consolidación entre:

```text
lvj_com_usuarios

lvj_file_users

users
```

La recomendación actual es mantener `lvj_com_usuarios` como identidad oficial.

---

## FileServer y contenidos

Evaluar relaciones mediante `file_id` desde:

```text
lvj_for_biblioteca

lvj_for_lecciones

lvj_pod_podcasts

lvj_pub_publicidad_comercial

lvj_san_santo_dia

lvj_ora_oraciones
```

hacia:

```text
lvj_files
```

No eliminar las URLs actuales hasta completar una migración segura.

---

## Categorías heredadas de radio

Determinar si los datos útiles de:

```text
genres

radios_cat
```

deben migrarse a una nueva estructura oficial o retirarse definitivamente.

---

## Claves foráneas físicas

Auditar todas las relaciones lógicas y determinar cuáles requieren restricciones físicas en MySQL.

---

# 3.9.24 Regla fundamental

El Modelo Relacional General constituye el mapa oficial de dependencias de la base de datos de **La Voz de Jesús**.

Toda nueva tabla deberá:

1. pertenecer a un módulo definido;
2. tener una responsabilidad única;
3. documentar sus relaciones;
4. utilizar tipos compatibles;
5. evitar dependencias innecesarias;
6. integrarse sin duplicar datos;
7. actualizar este modelo antes de considerarse parte oficial del proyecto.

Cuando exista una diferencia entre este modelo, el diccionario de tablas y la implementación física, Codex deberá detenerse, verificar la estructura real y reportar la inconsistencia antes de realizar modificaciones.

---

**Fin de la sección 3.9 – Modelo Relacional General**

# 3.10 Reglas de Evolución de la Base de Datos

## 3.10.1 Objetivo

La presente sección establece las reglas obligatorias para crear, modificar, ampliar, migrar, consolidar o retirar estructuras de la Base de Datos del proyecto **La Voz de Jesús (LVJ)**.

Su finalidad es garantizar que toda evolución del modelo de datos se realice de manera:

- Controlada.
- Documentada.
- Reversible.
- Segura.
- Compatible con la arquitectura existente.
- Coherente con los módulos oficiales.
- Sin pérdida de información.
- Sin duplicidad de tablas o responsabilidades.

Toda modificación estructural deberá respetar las reglas descritas en esta sección.

---

# 3.10.2 Principio General de Evolución

La Base de Datos deberá evolucionar de forma incremental.

Nunca deberá modificarse mediante cambios improvisados, destructivos o aislados.

Toda evolución deberá seguir este flujo:

```text
Necesidad funcional

↓

Revisión del Diccionario Oficial

↓

Análisis de tablas existentes

↓

Decisión arquitectónica

↓

Actualización de AGENTS.md

↓

Migración SQL

↓

Pruebas

↓

Implementación

↓

Validación

↓

Documentación final
```

La estructura vigente no deberá modificarse únicamente para simplificar una tarea puntual.

---

# 3.10.3 Cómo modificar una tabla existente

Una tabla existente solo deberá modificarse cuando la necesidad no pueda resolverse correctamente mediante la estructura actual.

Antes de modificarla, deberá verificarse:

1. La responsabilidad oficial de la tabla.
2. Los módulos que la consumen.
3. Las relaciones existentes.
4. Los índices actuales.
5. Las claves foráneas.
6. Los registros almacenados.
7. Los endpoints que dependen de ella.
8. Los formularios administrativos relacionados.
9. Las consultas públicas que la utilizan.
10. El impacto sobre el borrado lógico y la auditoría.

---

## Modificaciones permitidas

Podrán realizarse, mediante migración documentada:

- Agregar columnas.
- Agregar índices.
- Agregar restricciones.
- Ajustar valores por defecto.
- Ampliar longitudes cuando exista justificación.
- Incorporar campos de auditoría.
- Agregar relaciones.
- Agregar estados.
- Agregar prioridad.
- Agregar metadatos necesarios.

---

## Modificaciones de alto riesgo

Requieren análisis especial:

- Cambiar el tipo de una clave primaria.
- Cambiar el tipo de una clave foránea.
- Renombrar columnas.
- Renombrar tablas.
- Convertir datos entre formatos.
- Cambiar la semántica de un campo.
- Eliminar columnas.
- Modificar valores de estado existentes.
- Cambiar reglas de unicidad.
- Agregar `ON DELETE CASCADE`.
- Cambiar una relación de opcional a obligatoria.

Estas acciones no deberán ejecutarse sin:

- respaldo;
- análisis de datos;
- migración;
- estrategia de reversión;
- aprobación expresa.

---

# 3.10.4 Cómo agregar una columna

Antes de agregar una columna, deberá comprobarse:

1. Que el dato no exista ya en otra columna.
2. Que no pertenezca a otra tabla.
3. Que la columna corresponda a la responsabilidad de la tabla.
4. Que no duplique una configuración existente.
5. Que el tipo de dato sea adecuado.
6. Que el valor por defecto no altere registros existentes.
7. Que los formularios y APIs puedan adaptarse.
8. Que la columna se documente en este Diccionario.

Ejemplo correcto:

```sql
ALTER TABLE lvj_capilla_streams
ADD COLUMN prioridad INT NOT NULL DEFAULT 1
AFTER es_principal;
```

La migración deberá definir claramente:

- nombre;
- tipo;
- nulabilidad;
- valor por defecto;
- posición cuando sea relevante;
- índices necesarios;
- impacto en datos existentes.

---

# 3.10.5 Cómo crear una tabla nueva

Una tabla nueva solo deberá crearse cuando represente una entidad o responsabilidad que no pueda resolverse adecuadamente mediante las tablas existentes.

Antes de crearla, Codex deberá responder:

1. ¿Ya existe una tabla con la misma responsabilidad?
2. ¿Existe una tabla similar que pueda ampliarse?
3. ¿La nueva funcionalidad pertenece a un módulo oficial?
4. ¿Es una entidad real o solo una propiedad de otra tabla?
5. ¿Necesita realmente una tabla independiente?
6. ¿Puede resolverse mediante una tabla puente?
7. ¿Puede resolverse mediante una configuración existente?
8. ¿La tabla duplicaría información?
9. ¿La tabla introduce una dependencia circular?
10. ¿La tabla requiere auditoría o borrado lógico?

Si existe una estructura equivalente, deberá reutilizarse.

---

## Requisitos mínimos de una tabla nueva

Toda tabla nueva deberá definir:

- Nombre oficial.
- Módulo.
- Propósito.
- Responsabilidad.
- Llave primaria.
- Llaves foráneas.
- Índices.
- Estado.
- Auditoría.
- Borrado lógico cuando aplique.
- Restricciones de unicidad.
- Consumidores.
- Reglas de negocio.
- Estrategia de migración.
- Estrategia de reversión.

---

## Convención de nombre

Toda tabla nueva deberá utilizar:

```text
lvj_<prefijo_modulo>_<entidad>
```

Ejemplos:

```text
lvj_rad_programas

lvj_bib_versiones

lvj_com_peticiones_oracion

lvj_pub_impresiones
```

No crear nombres como:

```text
tabla_nueva

datos_app

contenido2

usuarios_nuevos

streams_final
```

---

# 3.10.6 Cuándo reutilizar una tabla existente

Una tabla deberá reutilizarse cuando:

- Su propósito coincida con la nueva necesidad.
- La nueva función sea una ampliación natural.
- Los datos pertenezcan al mismo dominio.
- Las relaciones existentes sigan siendo válidas.
- No se mezcle una responsabilidad diferente.
- La ampliación no convierta la tabla en una estructura genérica sin control.

Ejemplo correcto:

Agregar `prioridad` a:

```text
lvj_capilla_streams
```

porque el orden de preferencia pertenece al dominio de los streams.

Ejemplo incorrecto:

Agregar campos de pago a:

```text
lvj_com_usuarios
```

porque los pagos pertenecen al módulo Economía.

---

# 3.10.7 Cuándo no reutilizar una tabla

No deberá reutilizarse una tabla cuando:

- La nueva información pertenece a otro módulo.
- Se altera su propósito original.
- Se mezclan configuraciones, contenido y transacciones.
- Se introducen columnas que solo aplican a unos pocos registros.
- Se genera una tabla excesivamente genérica.
- Se compromete la normalización.
- Se crean dependencias difíciles de mantener.

Ejemplo incorrecto:

Guardar en `lvj_capillas`:

- URL HLS;
- tokens;
- logs;
- historial;
- intención de oración.

Cada una de estas responsabilidades pertenece a tablas distintas.

---

# 3.10.8 Tablas puente

Cuando exista una relación muchos a muchos, deberá utilizarse una tabla puente.

Ejemplo:

```text
Usuarios

N

↓

Tabla puente

↓

N

Grupos
```

Representación:

```text
lvj_com_grupo_miembros
```

La tabla puente deberá incluir:

- `id`, cuando el patrón del proyecto lo requiera;
- las dos claves foráneas;
- una restricción única compuesta;
- estado;
- rol o metadatos cuando aplique;
- `created_at`.

Nunca almacenar listas de IDs separadas por comas.

---

# 3.10.9 Estados y catálogos

Antes de crear un nuevo estado deberá verificarse:

1. Si ya existe un catálogo.
2. Si el campo utiliza `VARCHAR`.
3. Si el módulo comparte estados.
4. Si la nueva opción cambia reglas de negocio.

No deberán modificarse valores históricos sin migración.

Ejemplo:

```text
activo
inactivo
pendiente
aprobado
rechazado
error
mantenimiento
```

Codex no deberá introducir nuevos estados arbitrariamente.

---

# 3.10.10 Índices

Los índices deberán crearse únicamente cuando respondan a consultas reales.

Candidatos frecuentes:

- claves foráneas;
- `estado`;
- `fecha`;
- `prioridad`;
- `email`;
- `slug`;
- combinaciones utilizadas en búsquedas;
- restricciones de unicidad.

Ejemplo:

```sql
CREATE INDEX idx_capilla_stream_estado_prioridad
ON lvj_capilla_streams (
    capilla_id,
    estado,
    prioridad,
    deleted_at
);
```

Antes de crear un índice, deberá verificarse que no exista uno equivalente.

---

# 3.10.11 Claves foráneas

Toda nueva relación deberá utilizar tipos compatibles.

Ejemplo correcto:

```text
lvj_capillas.id BIGINT

lvj_capilla_streams.capilla_id BIGINT
```

Ejemplo incorrecto:

```text
lvj_capillas.id BIGINT

lvj_capilla_streams.capilla_id INT
```

Antes de crear la restricción deberá comprobarse:

- ausencia de registros huérfanos;
- compatibilidad de tipos;
- índices;
- comportamiento esperado al eliminar;
- comportamiento esperado al actualizar.

No usar `ON DELETE CASCADE` por defecto.

---

# 3.10.12 Borrado lógico

Cuando una tabla tenga:

```text
deleted_at
```

deberá aplicarse borrado lógico.

Las consultas públicas deberán utilizar:

```sql
WHERE deleted_at IS NULL
```

El borrado físico se reservará para:

- datos temporales;
- registros de prueba;
- información expresamente autorizada;
- procesos de mantenimiento documentados.

No deberá eliminarse físicamente información con historial, relaciones o valor de auditoría.

---

# 3.10.13 Migraciones SQL

Todo cambio estructural deberá entregarse mediante un archivo o bloque SQL explícito.

La migración deberá ser:

- clara;
- revisable;
- reproducible;
- ordenada;
- compatible con los datos existentes.

Cuando sea posible, deberá ser idempotente o incluir verificaciones previas.

Ejemplo conceptual:

```sql
ALTER TABLE lvj_capilla_streams
ADD COLUMN prioridad INT NOT NULL DEFAULT 1;
```

La entrega deberá indicar:

- entorno;
- tabla;
- cambio;
- motivo;
- impacto;
- reversión.

---

# 3.10.14 Estrategia de reversión

Toda migración relevante deberá incluir una forma de revertirse.

Ejemplo:

```sql
ALTER TABLE lvj_capilla_streams
DROP COLUMN prioridad;
```

La reversión no deberá ejecutarse si implica pérdida de datos sin respaldo.

Cuando una migración transforme datos, deberá existir:

- copia previa;
- tabla temporal controlada, si aplica;
- consulta de validación;
- procedimiento de restauración.

---

# 3.10.15 Respaldo previo

Antes de modificar la base de producción deberá realizarse:

1. Exportación de las tablas afectadas.
2. Exportación de estructura y datos.
3. Confirmación del archivo de respaldo.
4. Verificación de espacio disponible.
5. Registro de la fecha y responsable.

No ejecutar modificaciones estructurales directamente en producción sin respaldo.

---

# 3.10.16 Ambientes

Los cambios deberán probarse primero en:

```text
Desarrollo

↓

Pruebas

↓

Producción
```

Cuando no exista un entorno de pruebas separado, deberá utilizarse:

- una copia local;
- una base clonada;
- una tabla temporal controlada;
- una ventana de mantenimiento.

Nunca utilizar producción como primer entorno de ensayo.

---

# 3.10.17 Reglas para Codex

Antes de modificar la Base de Datos, Codex deberá:

1. Leer completamente el Capítulo 3.
2. Consultar el Diccionario de la tabla.
3. Identificar el módulo.
4. Revisar tablas equivalentes.
5. Inspeccionar el código que la consume.
6. Consultar índices y relaciones reales.
7. Presentar un plan corto.
8. Limitarse al alcance autorizado.
9. Preparar SQL explícito.
10. Preparar validaciones.
11. No ejecutar cambios destructivos.
12. Actualizar AGENTS.md cuando corresponda.

Codex no deberá:

- crear tablas duplicadas;
- inventar columnas;
- cambiar nombres sin autorización;
- eliminar datos;
- modificar producción directamente;
- usar tablas legacy en nuevas implementaciones;
- añadir relaciones no documentadas;
- mezclar responsabilidades;
- ejecutar migraciones fuera del alcance;
- cambiar otras tablas por conveniencia.

---

# 3.10.18 Checklist antes de modificar la Base de Datos

Antes de ejecutar cualquier cambio, verificar:

## Arquitectura

- [ ] Se leyó completamente el Capítulo 3.
- [ ] Se identificó el módulo correcto.
- [ ] La tabla está documentada.
- [ ] Se verificó su responsabilidad.
- [ ] No existe una tabla equivalente.
- [ ] No se está duplicando información.
- [ ] La modificación respeta la normalización.
- [ ] La modificación no mezcla responsabilidades.

## Dependencias

- [ ] Se localizaron todas las consultas relacionadas.
- [ ] Se revisaron APIs.
- [ ] Se revisaron formularios.
- [ ] Se revisaron CRUD.
- [ ] Se revisaron relaciones.
- [ ] Se verificaron claves foráneas reales.
- [ ] Se verificaron índices existentes.
- [ ] Se identificaron módulos consumidores.

## Datos

- [ ] Se revisó la cantidad de registros.
- [ ] Se buscaron valores nulos.
- [ ] Se buscaron duplicados.
- [ ] Se buscaron registros huérfanos.
- [ ] Se verificó compatibilidad de tipos.
- [ ] Se definieron valores por defecto.
- [ ] Se confirmó el efecto sobre datos existentes.

## Seguridad

- [ ] No se almacenarán secretos.
- [ ] No se expondrán tokens.
- [ ] No se guardarán contraseñas en texto plano.
- [ ] Se usarán consultas preparadas.
- [ ] Se respetará el borrado lógico.
- [ ] Se conservará la auditoría.

## Operación

- [ ] Existe respaldo.
- [ ] Existe migración SQL.
- [ ] Existe estrategia de reversión.
- [ ] Se definió el entorno de prueba.
- [ ] Se definieron las consultas de validación.
- [ ] Se obtuvo autorización cuando el cambio es destructivo.

---

# 3.10.19 Checklist después de modificar la Base de Datos

Después de ejecutar el cambio, verificar:

## Estructura

- [ ] La columna o tabla fue creada correctamente.
- [ ] Los tipos de datos coinciden.
- [ ] Los valores por defecto son correctos.
- [ ] Las restricciones fueron aplicadas.
- [ ] Los índices fueron creados.
- [ ] No se duplicaron índices.
- [ ] Las claves foráneas son válidas.

## Datos

- [ ] No se perdieron registros.
- [ ] No se crearon duplicados.
- [ ] No quedaron registros huérfanos.
- [ ] Los datos antiguos siguen siendo legibles.
- [ ] Los nuevos campos tienen valores coherentes.
- [ ] Las consultas de validación devuelven el resultado esperado.

## Aplicación

- [ ] El listado funciona.
- [ ] La búsqueda funciona.
- [ ] La creación funciona.
- [ ] La edición funciona.
- [ ] El cambio de estado funciona.
- [ ] El borrado lógico funciona.
- [ ] Las APIs responden correctamente.
- [ ] El frontend consume los datos correctos.
- [ ] No se afectaron otros módulos.

## Seguridad y auditoría

- [ ] Los permisos siguen funcionando.
- [ ] Las consultas usan parámetros.
- [ ] Los logs se generan cuando aplica.
- [ ] No se expone información sensible.
- [ ] Los mensajes de error son seguros.

## Documentación

- [ ] AGENTS.md fue actualizado.
- [ ] El Diccionario de Datos fue actualizado.
- [ ] La migración quedó registrada.
- [ ] Se documentaron archivos modificados.
- [ ] Se documentaron pruebas.
- [ ] Se documentaron pendientes y riesgos.

---

# 3.10.20 Validaciones SQL recomendadas

## Verificar estructura

```sql
SHOW CREATE TABLE nombre_tabla;
```

## Verificar columnas

```sql
SHOW COLUMNS FROM nombre_tabla;
```

## Verificar índices

```sql
SHOW INDEX FROM nombre_tabla;
```

## Verificar claves foráneas

```sql
SELECT
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'nombre_tabla'
  AND REFERENCED_TABLE_NAME IS NOT NULL;
```

## Verificar registros huérfanos

```sql
SELECT h.*
FROM tabla_hija h
LEFT JOIN tabla_padre p
    ON p.id = h.padre_id
WHERE p.id IS NULL;
```

## Verificar duplicados

```sql
SELECT campo, COUNT(*) AS total
FROM nombre_tabla
GROUP BY campo
HAVING COUNT(*) > 1;
```

---

# 3.10.21 Cambios que requieren aprobación expresa

Requieren autorización previa:

- eliminar tablas;
- eliminar columnas;
- truncar tablas;
- renombrar tablas;
- renombrar columnas;
- cambiar claves primarias;
- convertir `INT` a `BIGINT`;
- activar cascadas;
- consolidar usuarios;
- migrar tablas legacy;
- transformar datos masivamente;
- modificar producción;
- retirar un módulo;
- crear una nueva fuente oficial de datos.

Codex deberá limitarse a proponer estos cambios hasta recibir autorización.

---

# 3.10.22 Mantenimiento del Diccionario

Toda evolución del modelo deberá reflejarse en este capítulo.

Cuando una migración modifique:

- columnas;
- relaciones;
- índices;
- estados;
- responsabilidad;
- consumidores;
- reglas de negocio;

el mismo trabajo deberá actualizar el Diccionario Oficial.

No se considerará completa una migración si la documentación permanece desactualizada.

---

# 3.10.23 Regla de cierre del Capítulo 3

La Base de Datos del proyecto **La Voz de Jesús** deberá evolucionar sin perder coherencia, integridad ni trazabilidad.

Toda decisión deberá priorizar:

1. La reutilización.
2. La responsabilidad única.
3. La seguridad.
4. La compatibilidad.
5. La documentación.
6. La reversibilidad.
7. La protección de los datos.

Ningún cambio estructural deberá considerarse menor cuando pueda afectar la fuente oficial de información del sistema.

---

**Fin del Capítulo 3 – Arquitectura y Diccionario Oficial de Base de Datos**

# CAPÍTULO 4
# ARQUITECTURA Y REGLAS DEL FRONTEND

## 4.1 Objetivo

El Frontend constituye la capa de presentación e interacción del proyecto **La Voz de Jesús (LVJ)**.

Su responsabilidad principal es mostrar la información proveniente del Backend, permitir la interacción del usuario y conservar una experiencia visual coherente, rápida, accesible y profundamente alineada con la identidad católica del proyecto.

El Frontend no deberá convertirse en una segunda capa de negocio ni en una fuente paralela de configuración.

Toda decisión funcional deberá provenir de:

```text
Base de Datos

↓

Backend / API

↓

Frontend

↓

Usuario
```

El Frontend será responsable de:

- representar información;
- gestionar estados visuales;
- capturar acciones del usuario;
- consumir APIs;
- manejar carga, éxito y error;
- conservar la navegación;
- proteger la experiencia móvil;
- reproducir contenidos multimedia;
- respetar la identidad gráfica del proyecto.

No será responsable de:

- acceder directamente a MySQL;
- ejecutar consultas SQL;
- almacenar credenciales;
- decidir configuraciones globales;
- aplicar reglas de negocio críticas;
- modificar datos sin pasar por el Backend;
- hardcodear información administrable.

---

# 4.2 Principios Fundamentales

Toda implementación del Frontend deberá respetar los siguientes principios.

## 4.2.1 Mobile First

La aplicación deberá diseñarse y probarse primero para dispositivos móviles.

El orden de prioridad será:

```text
Teléfono móvil

↓

Tableta

↓

Portátil

↓

Escritorio
```

La experiencia móvil no deberá considerarse una adaptación reducida de la versión de escritorio.

Deberá ser la experiencia principal.

---

## 4.2.2 Consistencia Visual

Todos los módulos deberán conservar:

- tipografía coherente;
- jerarquía visual uniforme;
- botones consistentes;
- tarjetas reutilizables;
- espaciados regulares;
- iconografía común;
- comportamiento uniforme;
- estados visuales predecibles.

No crear estilos aislados para resolver tareas puntuales cuando ya exista un patrón reutilizable.

---

## 4.2.3 Separación de Responsabilidades

Cada componente deberá tener una responsabilidad clara.

Ejemplo correcto:

```text
CapillaPage
    ├── CapillaHeader
    ├── CapillaPlayer
    ├── PrayerForm
    └── PrayerWall
```

Ejemplo incorrecto:

```text
CapillaPage
    └── Un solo componente con video, formulario, API, validación, diseño y lógica completa
```

---

## 4.2.4 Configuración Dinámica

El Frontend no deberá contener configuraciones administrables escritas directamente.

Ejemplos prohibidos:

- URL de stream;
- nombre de capilla;
- nombre de emisora;
- mensajes de carga;
- mensajes de error;
- colores configurables;
- banners;
- logos;
- IDs de registros;
- programación;
- publicidad.

Estos valores deberán provenir de la Base de Datos mediante APIs.

---

## 4.2.5 Reutilización

Antes de crear un nuevo componente, deberá revisarse si existe uno equivalente.

Se deberán reutilizar:

- botones;
- tarjetas;
- modales;
- loaders;
- mensajes de error;
- reproductores;
- campos de formulario;
- encabezados;
- navegaciones;
- contenedores;
- componentes de estado.

No crear duplicados con nombres diferentes.

---

## 4.2.6 Simplicidad

El Frontend deberá resolver cada necesidad con la mínima complejidad necesaria.

No introducir:

- librerías innecesarias;
- estados globales sin justificación;
- abstracciones prematuras;
- componentes genéricos difíciles de mantener;
- dependencias pesadas;
- soluciones incompatibles con la PWA.

---

# 4.3 Arquitectura Oficial del Frontend

El flujo oficial será:

```text
Pantalla

↓

Componente

↓

Servicio o cliente API

↓

Backend PHP

↓

Base de Datos
```

Nunca:

```text
Componente

↓

MySQL
```

Nunca:

```text
Componente

↓

URL hardcodeada
```

---

## 4.3.1 Capas del Frontend

El Frontend deberá organizarse en las siguientes capas lógicas.

### Páginas o vistas

Representan rutas completas.

Ejemplos:

```text
Inicio
Capilla Virtual
Radio
Liturgia
Biblia
Biblioteca
Comunidad
```

### Componentes de módulo

Representan partes funcionales específicas.

Ejemplos:

```text
CapillaPlayer
RadioPlayer
LiturgiaCard
PodcastCard
PrayerCard
```

### Componentes compartidos

Elementos reutilizables en varios módulos.

Ejemplos:

```text
Button
Modal
Card
Loader
EmptyState
ErrorState
SectionHeader
```

### Servicios API

Centralizan las solicitudes al Backend.

Ejemplos:

```text
capillaService
radioService
liturgiaService
configService
```

### Utilidades

Funciones reutilizables sin estado visual.

Ejemplos:

```text
formatearFecha
normalizarUrl
formatearDuracion
sanitizarTexto
```

---

# 4.4 Reglas de Estructura

## 4.4.1 No inventar rutas

Antes de crear una nueva ruta, Codex deberá localizar la estructura real del proyecto.

No deberá asumir que existe:

```text
app/
pages/
src/
components/
services/
```

sin verificarlo.

---

## 4.4.2 No mover archivos sin necesidad

No renombrar ni mover componentes durante una tarea específica, salvo que sea indispensable y esté autorizado.

Las refactorizaciones generales deberán tratarse como tareas independientes.

---

## 4.4.3 No crear arquitectura paralela

Si el proyecto ya utiliza un patrón para:

- servicios;
- hooks;
- rutas;
- estilos;
- componentes;
- consumo de APIs;

deberá reutilizarse.

No crear un segundo patrón dentro del mismo repositorio.

---

# 4.5 Componentes

## 4.5.1 Responsabilidad Única

Cada componente deberá cumplir una función concreta.

Un componente no deberá mezclar:

- consumo de múltiples APIs;
- reglas de negocio;
- almacenamiento;
- reproducción;
- validación;
- diseño complejo;

si puede dividirse de manera clara.

---

## 4.5.2 Tamaño razonable

Cuando un componente crezca excesivamente, deberá evaluarse su división.

No dividir por cantidad de líneas de forma mecánica.

Dividir cuando existan responsabilidades distintas.

---

## 4.5.3 Props

Las propiedades deberán:

- tener nombres claros;
- estar tipadas;
- evitar estructuras ambiguas;
- ser mínimas;
- no duplicar datos.

Ejemplo correcto:

```ts
type CapillaPlayerProps = {
  tipoStream: string;
  urlStream: string;
  nombre: string;
};
```

Evitar pasar objetos gigantes cuando el componente solo necesita tres valores.

---

## 4.5.4 Estado local

Utilizar estado local cuando la información pertenezca únicamente al componente o a la pantalla actual.

Ejemplos:

- modal abierto;
- campo de formulario;
- estado de reproducción;
- mensaje temporal;
- pestaña activa.

---

## 4.5.5 Estado global

No crear estado global sin necesidad.

Solo utilizarlo cuando la información deba compartirse entre múltiples áreas independientes.

Ejemplos posibles:

- usuario autenticado;
- configuración general;
- reproducción global de radio;
- tema de la aplicación;
- notificaciones globales.

---

# 4.6 Consumo de APIs

## 4.6.1 Servicio centralizado

Las llamadas a APIs deberán concentrarse en funciones o servicios reutilizables.

No repetir solicitudes directamente dentro de múltiples componentes.

---

## 4.6.2 Estados obligatorios

Toda solicitud deberá contemplar:

```text
Cargando

Éxito

Vacío

Error
```

No dejar pantallas sin respuesta visual.

---

## 4.6.3 Manejo de errores

El usuario deberá recibir mensajes claros y pastorales cuando corresponda.

No mostrar errores técnicos como:

```text
500 Internal Server Error
CORS
manifestLoadError
SQLSTATE
Undefined index
```

Los detalles técnicos deberán registrarse en consola únicamente durante desarrollo o enviarse al sistema de logs cuando exista.

---

## 4.6.4 Cancelación y desmontaje

Cuando una pantalla se cierre o un componente se desmonte, deberán cancelarse o ignorarse solicitudes pendientes cuando el patrón del proyecto lo permita.

Esto evita:

- actualizaciones de estado tardías;
- fugas de memoria;
- errores de navegación;
- resultados obsoletos.

---

## 4.6.5 No confiar en el Frontend

Toda validación crítica deberá repetirse en el Backend.

El Frontend puede validar para mejorar la experiencia, pero no constituye una barrera de seguridad.

---

# 4.7 Datos y Tipado

## 4.7.1 Tipos explícitos

Cuando el proyecto utilice TypeScript, todas las respuestas importantes deberán estar tipadas.

Ejemplo:

```ts
type CapillaResponse = {
  success: boolean;
  data: {
    config: CapillaConfig;
    capilla: Capilla;
    stream: CapillaStream;
  };
};
```

---

## 4.7.2 No usar `any` sin justificación

Evitar `any`.

Si una estructura es incierta, deberá inspeccionarse el endpoint real y definirse correctamente.

---

## 4.7.3 Campos opcionales

Los campos opcionales deberán declararse y manejarse explícitamente.

Ejemplo:

```ts
logoUrl?: string | null;
```

No asumir que todos los recursos existen.

---

## 4.7.4 Normalización

Cuando varias APIs devuelvan información similar, deberá mantenerse una convención uniforme de nombres.

No mezclar:

```text
image
imagen
imagen_url
imageUrl
```

sin una capa de adaptación clara.

El Frontend podrá normalizar la respuesta, pero no deberá ocultar inconsistencias importantes sin documentarlas.

---

# 4.8 Diseño Responsive

## 4.8.1 Teléfonos estrechos

La aplicación deberá probarse en pantallas pequeñas.

Especial cuidado con:

- botones superpuestos;
- textos truncados;
- títulos largos;
- navegación inferior;
- reproductores;
- formularios;
- tarjetas horizontales;
- modales.

---

## 4.8.2 Contenido flexible

Evitar anchos fijos que rompan la interfaz.

Preferir:

- porcentajes;
- `max-width`;
- contenedores fluidos;
- proporciones;
- rejillas adaptables.

---

## 4.8.3 Área segura

La navegación y los controles deberán respetar las áreas seguras de dispositivos móviles.

Especialmente:

- barra inferior;
- botón de reproducción;
- acciones flotantes;
- modales;
- pantalla completa.

---

# 4.9 Navegación

## 4.9.1 Coherencia

Las rutas deberán conservar nombres consistentes y predecibles.

No crear rutas duplicadas para la misma funcionalidad.

---

## 4.9.2 Botón atrás

Las pantallas internas deberán respetar el historial del navegador.

No reemplazar navegación estándar con comportamientos inesperados.

---

## 4.9.3 Navegación inferior

La barra inferior deberá mantener:

- orden;
- iconos;
- etiquetas;
- estado activo;
- comportamiento;
- tamaño.

No modificarla durante tareas de otros módulos salvo autorización expresa.

---

## 4.9.4 Capilla como módulo central

El acceso a la Capilla Virtual deberá conservar su posición y relevancia definida dentro de la experiencia de la aplicación.

Cualquier cambio deberá respetar la identidad espiritual del proyecto.

---

# 4.10 Formularios

## 4.10.1 Validación

Todo formulario deberá validar:

- campos obligatorios;
- longitud;
- formato;
- URLs;
- correos;
- números;
- archivos;
- valores permitidos.

---

## 4.10.2 Conservación de datos

Si ocurre un error, los campos no deberán borrarse innecesariamente.

---

## 4.10.3 Estado de envío

Durante el envío:

- desactivar el botón cuando corresponda;
- evitar envíos duplicados;
- mostrar estado;
- informar éxito o error.

---

## 4.10.4 Mensajes

Los mensajes deberán ser:

- claros;
- breves;
- comprensibles;
- coherentes con la identidad del proyecto.

---

## 4.10.5 Seguridad

No permitir:

- HTML arbitrario;
- JavaScript;
- URLs inseguras;
- archivos no validados;
- formularios sin protección cuando el patrón del proyecto utilice CSRF.

---

# 4.11 Contenido Multimedia

## 4.11.1 Imágenes

Las imágenes deberán:

- cargarse de forma optimizada;
- conservar proporción;
- usar `alt`;
- evitar deformación;
- usar carga diferida cuando corresponda;
- mostrar respaldo cuando no existan.

---

## 4.11.2 Audio

No reproducir dos fuentes de audio simultáneamente.

La Radio y la Capilla deberán coordinarse.

Si el usuario inicia la Capilla con audio y la Radio está reproduciéndose, la aplicación deberá aplicar la regla definida por el proyecto.

---

## 4.11.3 Video

El video deberá:

- conservar relación de aspecto;
- permitir pantalla completa;
- utilizar `playsinline`;
- manejar carga;
- manejar error;
- liberar recursos al salir.

---

## 4.11.4 HLS

Cuando `tipo_stream = hls`:

- usar soporte nativo si existe;
- utilizar `hls.js` cuando sea necesario;
- no usar iframe;
- destruir la instancia al desmontar;
- no hardcodear la URL;
- mostrar reintento;
- evitar ciclos infinitos.

---

## 4.11.5 YouTube e iframe

Cuando el tipo sea `youtube` o `iframe`:

- usar únicamente URLs autorizadas;
- validar origen;
- permitir pantalla completa;
- evitar autoplay con sonido;
- manejar bloqueos de inserción.

---

# 4.12 Accesibilidad

Toda pantalla deberá procurar:

- contraste suficiente;
- botones identificables;
- textos legibles;
- etiquetas en formularios;
- navegación mediante teclado cuando aplique;
- estados visibles;
- descripciones alternativas;
- tamaño táctil adecuado.

No depender únicamente del color para comunicar estados.

---

# 4.13 Rendimiento

## 4.13.1 Carga diferida

Utilizar lazy loading para:

- imágenes;
- módulos pesados;
- reproductores;
- listas extensas.

---

## 4.13.2 Evitar renderizados innecesarios

No crear estados redundantes.

No recalcular valores simples en cada render si pueden derivarse de forma clara.

---

## 4.13.3 Listas

Cuando una lista pueda crecer significativamente:

- paginar;
- cargar por bloques;
- usar scroll incremental;
- virtualizar cuando sea necesario.

---

## 4.13.4 Dependencias

No instalar nuevas dependencias sin revisar:

- peso;
- mantenimiento;
- compatibilidad;
- seguridad;
- necesidad real.

---

# 4.14 PWA

## 4.14.1 Instalabilidad

La aplicación deberá conservar:

- manifiesto válido;
- iconos;
- nombre;
- tema;
- service worker;
- comportamiento instalable.

---

## 4.14.2 Actualizaciones

Las actualizaciones de la PWA deberán manejarse sin bloquear al usuario.

Cuando exista una nueva versión, podrá mostrarse un aviso claro para actualizar.

---

## 4.14.3 Caché

No cachear indefinidamente:

- streams;
- configuración dinámica;
- datos sensibles;
- contenido que deba actualizarse con frecuencia.

---

## 4.14.4 Offline

Cuando no exista conexión, deberá mostrarse un estado claro.

No simular contenido actualizado.

---

# 4.15 Seguridad del Frontend

El Frontend deberá:

- escapar contenido;
- no insertar HTML sin sanitización;
- no exponer credenciales;
- no almacenar secretos;
- no mostrar tokens;
- no confiar en datos del navegador;
- validar URLs;
- respetar permisos;
- evitar información sensible en consola.

No usar almacenamiento local para información crítica salvo que exista una decisión arquitectónica documentada.

---

# 4.16 Estilos

## 4.16.1 Reutilización

Reutilizar clases, variables y componentes existentes.

No crear estilos duplicados para pequeñas variaciones.

---

## 4.16.2 Tailwind

Cuando el proyecto utilice Tailwind:

- respetar la convención existente;
- evitar clases excesivamente repetidas;
- no introducir configuraciones nuevas sin necesidad;
- no sustituir estilos existentes durante tareas funcionales.

---

## 4.16.3 CSS global

No modificar estilos globales salvo autorización expresa.

Un cambio global puede afectar múltiples módulos.

---

## 4.16.4 Identidad visual

La interfaz deberá mantener:

- fondo oscuro cuando corresponda;
- tonos dorados;
- sobriedad;
- profundidad;
- contraste;
- ambiente contemplativo;
- estética profesional.

No utilizar colores estridentes o elementos visuales que distraigan de la experiencia espiritual.

---

# 4.17 Reglas específicas para Codex

Antes de modificar el Frontend, Codex deberá:

1. Leer completamente AGENTS.md.
2. Localizar la ruta real.
3. Localizar los componentes involucrados.
4. Identificar los servicios API existentes.
5. Revisar patrones de módulos similares.
6. Verificar estilos y componentes compartidos.
7. Presentar un plan corto.
8. Modificar únicamente lo solicitado.
9. No rediseñar sin autorización.
10. Probar móvil y escritorio.
11. Informar archivos modificados.

Codex no deberá:

- rehacer pantallas completas;
- cambiar navegación global;
- crear componentes duplicados;
- hardcodear datos;
- instalar librerías innecesarias;
- mover archivos fuera del alcance;
- refactorizar otros módulos;
- cambiar estilos globales;
- modificar APIs sin necesidad;
- inventar rutas;
- alterar el panel administrativo durante una tarea pública;
- corregir problemas no solicitados.

---

# 4.18 Checklist antes de modificar el Frontend

## Alcance

- [ ] Se leyó AGENTS.md.
- [ ] Se entendió la tarea.
- [ ] Se identificó la pantalla correcta.
- [ ] Se identificaron los componentes involucrados.
- [ ] Se revisó si existe un patrón reutilizable.
- [ ] No se modificará otro módulo.

## Datos

- [ ] Se identificó el endpoint correcto.
- [ ] Se revisó el formato real de la respuesta.
- [ ] Se definieron tipos.
- [ ] No se hardcodearán datos.
- [ ] Se contemplaron valores nulos.
- [ ] Se contemplaron estados vacíos.

## Diseño

- [ ] Se conservará el diseño actual.
- [ ] Se revisó móvil.
- [ ] Se revisó escritorio.
- [ ] Se respetará la navegación.
- [ ] Se respetarán estilos existentes.
- [ ] No se modificarán estilos globales.

## Seguridad

- [ ] No se expondrán secretos.
- [ ] No se insertará HTML inseguro.
- [ ] No se confiará en validación del cliente.
- [ ] Se respetarán permisos.
- [ ] Se validarán URLs y archivos.

---

# 4.19 Checklist después de modificar el Frontend

## Funcionalidad

- [ ] La pantalla carga.
- [ ] Los datos provienen de la API.
- [ ] El estado de carga funciona.
- [ ] El estado vacío funciona.
- [ ] El estado de error funciona.
- [ ] Las acciones del usuario funcionan.
- [ ] No se duplican solicitudes.
- [ ] No aparecen errores en consola.

## Diseño

- [ ] El diseño se mantiene.
- [ ] Funciona en teléfono estrecho.
- [ ] Funciona en tableta.
- [ ] Funciona en escritorio.
- [ ] No hay superposiciones.
- [ ] Los textos no se cortan.
- [ ] La navegación inferior funciona.

## Multimedia

- [ ] El reproductor inicia.
- [ ] El reproductor se detiene correctamente.
- [ ] No hay audio simultáneo.
- [ ] La pantalla completa funciona.
- [ ] Los errores se manejan.
- [ ] Los recursos se liberan al desmontar.

## Accesibilidad

- [ ] Las imágenes tienen texto alternativo.
- [ ] Los botones tienen etiqueta.
- [ ] Los campos tienen identificación.
- [ ] El contraste es adecuado.
- [ ] Los elementos táctiles tienen tamaño suficiente.

## Integración

- [ ] No se afectó Home.
- [ ] No se afectó Radio.
- [ ] No se afectó Capilla.
- [ ] No se afectó Liturgia.
- [ ] No se afectó el Panel Administrativo.
- [ ] No se cambiaron rutas sin autorización.

---

# 4.20 Regla Fundamental

El Frontend de **La Voz de Jesús** deberá permanecer como una capa de presentación clara, dinámica, segura y fiel a la arquitectura oficial.

Toda pantalla deberá:

1. consumir datos desde APIs;
2. evitar configuraciones hardcodeadas;
3. respetar la identidad visual;
4. conservar la experiencia móvil;
5. reutilizar componentes;
6. manejar carga y error;
7. limitarse a su responsabilidad;
8. no duplicar lógica del Backend.

Cuando exista una diferencia entre el diseño actual, el código y AGENTS.md, Codex deberá inspeccionar la implementación real y reportar la inconsistencia antes de realizar cambios amplios.

---

**Fin del Capítulo 4 – Arquitectura y Reglas del Frontend**

# CAPÍTULO 5
# ARQUITECTURA Y REGLAS DEL BACKEND

## 5.1 Objetivo

El Backend constituye la capa responsable de la lógica de negocio, la seguridad, la validación, la persistencia y la comunicación entre el Frontend y la Base de Datos del proyecto **La Voz de Jesús (LVJ)**.

Su función principal es recibir solicitudes, validar datos, aplicar reglas de negocio, consultar o modificar la Base de Datos y devolver respuestas seguras y estructuradas al Frontend.

El Backend será la única capa autorizada para comunicarse directamente con MySQL.

El flujo oficial será:

```text
Frontend

↓

API PHP

↓

Validación

↓

Reglas de negocio

↓

Base de Datos

↓

Respuesta JSON

↓

Frontend
```

Nunca deberá existir el siguiente flujo:

```text
Frontend

↓

MySQL
```

El Backend será responsable de:

- autenticación;
- autorización;
- validación de entradas;
- saneamiento de datos;
- reglas de negocio;
- consultas SQL;
- transacciones;
- control de errores;
- respuestas JSON;
- auditoría;
- protección de información sensible;
- integración con servicios externos;
- soporte para el Panel Administrativo;
- soporte para la PWA pública.

---

# 5.2 Principios Fundamentales

Toda implementación del Backend deberá respetar los siguientes principios.

## 5.2.1 Responsabilidad Central

La lógica crítica deberá residir en el Backend.

Ejemplos:

- verificar permisos;
- validar que un stream pertenezca a una capilla;
- impedir duplicados;
- controlar estados;
- aplicar borrado lógico;
- comprobar relaciones;
- registrar auditoría;
- validar URLs;
- proteger datos privados.

El Frontend podrá realizar validaciones visuales, pero nunca deberá ser la única barrera de seguridad.

---

## 5.2.2 Compatibilidad con Hosting Compartido

La arquitectura deberá mantener compatibilidad con:

- PHP;
- MySQL o MariaDB;
- cPanel;
- phpMyAdmin;
- Apache;
- hosting compartido.

No se deberán introducir procesos permanentes de Node.js en producción salvo decisión arquitectónica expresa.

No depender de:

- workers residentes;
- colas que requieran procesos permanentes;
- servicios no disponibles en el hosting;
- extensiones PHP no confirmadas;
- demonios propios.

---

## 5.2.3 Modularidad

Cada módulo deberá mantener sus propias responsabilidades.

Ejemplo:

```text
Capilla Virtual

├── Controlador
├── Servicio
├── Repositorio o acceso a datos
├── Validaciones
└── Respuesta API
```

No mezclar lógica de Radio, Capilla, Liturgia, Biblia o Comunidad dentro de un mismo archivo genérico sin una razón arquitectónica.

---

## 5.2.4 Reutilización

Antes de crear:

- una conexión;
- un helper;
- una función de respuesta;
- un validador;
- un middleware;
- un controlador;
- un repositorio;

deberá revisarse si ya existe una implementación equivalente.

No crear conexiones paralelas a la misma Base de Datos.

---

## 5.2.5 Cambios Localizados

Una tarea específica deberá resolverse mediante cambios mínimos.

No refactorizar todo el Backend para conectar un único endpoint.

No modificar módulos no relacionados.

---

# 5.3 Arquitectura Oficial del Backend

La arquitectura lógica recomendada es:

```text
Solicitud HTTP

↓

Ruta o Endpoint

↓

Controlador

↓

Servicio

↓

Acceso a Datos

↓

MySQL

↓

Respuesta
```

La estructura física deberá adaptarse al patrón real del proyecto.

Codex no deberá asumir que existen:

```text
controllers/
services/
repositories/
routes/
models/
```

sin inspeccionar primero el repositorio.

---

## 5.3.1 Ruta o Endpoint

Responsable de:

- recibir la solicitud;
- identificar el método HTTP;
- verificar autenticación cuando aplique;
- delegar la operación;
- devolver la respuesta.

No deberá contener consultas SQL extensas si el proyecto ya separa el acceso a datos.

---

## 5.3.2 Controlador

Responsable de:

- interpretar parámetros;
- validar formato básico;
- llamar a la lógica correspondiente;
- construir la respuesta;
- manejar excepciones controladas.

No deberá concentrar toda la lógica del módulo.

---

## 5.3.3 Servicio

Responsable de:

- aplicar reglas de negocio;
- coordinar múltiples tablas;
- ejecutar transacciones;
- validar coherencia entre entidades;
- decidir flujos funcionales.

Ejemplo:

```text
Activar Capilla

↓

Validar capilla

↓

Validar stream

↓

Confirmar que el stream pertenece a la capilla

↓

Actualizar configuración

↓

Registrar log
```

---

## 5.3.4 Acceso a Datos

Responsable de:

- consultas;
- inserciones;
- actualizaciones;
- búsquedas;
- paginación;
- filtros;
- relaciones;
- transacciones cuando el patrón del proyecto lo permita.

Toda consulta deberá utilizar parámetros.

---

# 5.4 Conexión a la Base de Datos

## 5.4.1 Conexión Única

El proyecto deberá reutilizar el helper o archivo oficial de conexión.

No crear una nueva conexión en cada módulo.

---

## 5.4.2 Credenciales

Las credenciales deberán almacenarse fuera del código versionado.

Ejemplos:

- variables de entorno;
- archivos de configuración protegidos;
- configuración de cPanel;
- secretos del entorno.

Nunca incluir:

```text
DB_PASSWORD
FTP_PASSWORD
API_SECRET
TOKEN
```

en archivos públicos o repositorios.

---

## 5.4.3 PDO o mysqli

Se deberá utilizar el patrón ya establecido por el proyecto.

No mezclar PDO y mysqli dentro del mismo módulo sin necesidad.

Si el proyecto usa PDO, deberá conservarse.

Si usa mysqli, deberá conservarse.

---

## 5.4.4 Charset

La conexión deberá utilizar:

```text
utf8mb4
```

para garantizar compatibilidad con:

- acentos;
- símbolos;
- emojis;
- textos litúrgicos;
- nombres propios;
- caracteres especiales.

---

# 5.5 Consultas SQL

## 5.5.1 Consultas Preparadas

Toda consulta deberá utilizar parámetros.

Ejemplo correcto:

```php
$stmt = $pdo->prepare(
    'SELECT * FROM lvj_capillas WHERE id = :id AND deleted_at IS NULL'
);

$stmt->execute([
    'id' => $id,
]);
```

Ejemplo incorrecto:

```php
$sql = "SELECT * FROM lvj_capillas WHERE id = " . $_GET['id'];
```

---

## 5.5.2 No usar `SELECT *` sin necesidad

Las APIs deberán devolver únicamente los campos requeridos.

Ejemplo recomendado:

```sql
SELECT
    id,
    nombre,
    subtitulo,
    pais,
    ciudad,
    imagen_url,
    logo_url
FROM lvj_capillas
WHERE id = :id;
```

Esto reduce:

- exposición innecesaria;
- consumo de memoria;
- dependencia del Frontend;
- riesgo de devolver campos sensibles.

---

## 5.5.3 Filtros obligatorios

Las consultas públicas deberán considerar:

```sql
estado = 'activo'
```

y cuando exista:

```sql
deleted_at IS NULL
```

No devolver registros eliminados, inactivos o internos sin una razón autorizada.

---

## 5.5.4 Paginación

Los listados grandes deberán utilizar paginación.

Parámetros sugeridos:

```text
pagina
limite
busqueda
estado
orden
```

El límite máximo deberá controlarse en el Backend.

No permitir que el cliente solicite cantidades ilimitadas.

---

## 5.5.5 Ordenamiento

Los campos de ordenamiento deberán pertenecer a una lista permitida.

Nunca concatenar directamente un campo recibido desde el navegador.

Ejemplo:

```php
$columnasPermitidas = [
    'nombre',
    'created_at',
    'prioridad',
];
```

---

# 5.6 Validación de Entradas

## 5.6.1 Validación Obligatoria

Toda entrada deberá validarse en el servidor.

Incluye:

- identificadores;
- textos;
- fechas;
- estados;
- URLs;
- correos;
- números;
- archivos;
- tipos de stream;
- relaciones.

---

## 5.6.2 Identificadores

Los IDs deberán validarse como números enteros positivos.

Ejemplo:

```php
$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);

if (!$id || $id < 1) {
    // Respuesta de validación.
}
```

---

## 5.6.3 Estados permitidos

Los estados deberán validarse contra una lista.

Ejemplo:

```php
$estadosPermitidos = [
    'activo',
    'inactivo',
    'pendiente',
    'aprobado',
    'rechazado',
    'error',
    'mantenimiento',
];
```

No aceptar valores arbitrarios.

---

## 5.6.4 URLs

Las URLs deberán:

- ser válidas;
- usar `https` cuando corresponda;
- pertenecer a dominios permitidos cuando se trate de iframes;
- no contener JavaScript;
- no exponer credenciales;
- no incluir contenido malicioso.

---

## 5.6.5 Textos

Los textos deberán:

- limitar longitud;
- conservar caracteres válidos;
- impedir contenido ejecutable;
- sanearse según el contexto;
- almacenarse sin alterar innecesariamente el contenido pastoral.

No aplicar filtros destructivos que eliminen acentos, signos bíblicos o formato legítimo.

---

# 5.7 Saneamiento y Salida

## 5.7.1 Separar validación y escape

Validar antes de almacenar.

Escapar al mostrar.

No transformar todos los textos a HTML escapado antes de guardarlos en Base de Datos.

---

## 5.7.2 JSON

Las respuestas deberán utilizar JSON válido y UTF-8.

Ejemplo:

```json
{
  "success": true,
  "data": {},
  "message": "Operación completada."
}
```

---

## 5.7.3 No exponer errores internos

No devolver al usuario:

- consultas SQL;
- credenciales;
- rutas del servidor;
- stack traces;
- nombres internos;
- mensajes completos de excepciones;
- tokens;
- sesiones;
- contraseñas.

---

# 5.8 Formato Oficial de Respuestas API

## 5.8.1 Respuesta exitosa

```json
{
  "success": true,
  "data": {
    "id": 1
  },
  "message": "Información obtenida correctamente."
}
```

---

## 5.8.2 Error de validación

```json
{
  "success": false,
  "data": null,
  "message": "Los datos enviados no son válidos.",
  "errors": {
    "nombre": "El nombre es obligatorio."
  }
}
```

---

## 5.8.3 Error no controlado

```json
{
  "success": false,
  "data": null,
  "message": "No fue posible completar la operación."
}
```

No incluir el detalle técnico en producción.

---

## 5.8.4 Consistencia

El proyecto deberá conservar el formato real ya utilizado.

Si existe otro estándar oficial, deberá reutilizarse.

No crear respuestas diferentes para cada endpoint.

---

# 5.9 Métodos HTTP

La semántica recomendada será:

```text
GET
```

Consultar información.

```text
POST
```

Crear registros o ejecutar acciones.

```text
PUT / PATCH
```

Actualizar registros cuando la infraestructura lo soporte.

```text
DELETE
```

Solicitar eliminación lógica cuando el patrón oficial lo permita.

Si el hosting o la arquitectura usa únicamente GET y POST, deberá conservarse el patrón real y documentarse.

---

# 5.10 Códigos HTTP

Usar códigos coherentes:

```text
200
```

Consulta o actualización correcta.

```text
201
```

Creación correcta.

```text
400
```

Solicitud inválida.

```text
401
```

No autenticado.

```text
403
```

Sin permiso.

```text
404
```

Recurso inexistente.

```text
409
```

Conflicto o duplicado.

```text
422
```

Validación fallida.

```text
500
```

Error interno.

No devolver siempre `200` cuando la operación falló, salvo que el patrón heredado del proyecto lo exija y exista una migración futura documentada.

---

# 5.11 Autenticación

## 5.11.1 Usuarios

La autenticación oficial deberá utilizar la tabla definida por la arquitectura.

La identidad principal recomendada es:

```text
lvj_com_usuarios
```

No crear nuevas tablas de usuarios.

---

## 5.11.2 Contraseñas

Las contraseñas deberán:

- almacenarse con hash seguro;
- verificarse mediante funciones nativas;
- nunca registrarse en logs;
- nunca devolverse mediante API.

En PHP:

```php
password_hash($password, PASSWORD_DEFAULT);
```

y:

```php
password_verify($password, $hash);
```

---

## 5.11.3 Sesiones

Las sesiones administrativas deberán:

- regenerar el ID al iniciar sesión;
- usar cookies seguras cuando exista HTTPS;
- limitar el tiempo de inactividad;
- invalidarse al cerrar sesión;
- no exponer datos sensibles.

---

# 5.12 Autorización y Roles

## 5.12.1 Verificación de Permisos

Toda acción administrativa deberá validar permisos en el Backend.

No confiar en que el botón esté oculto en el Frontend.

---

## 5.12.2 Roles

La relación oficial será:

```text
lvj_adm_roles

↓

lvj_com_usuarios.rol_id
```

Los roles administrativos y los roles internos de grupos no deberán confundirse.

---

## 5.12.3 Acciones sensibles

Requieren autorización expresa:

- eliminar;
- aprobar;
- rechazar;
- cambiar configuración;
- activar streams;
- modificar usuarios;
- acceder a logs;
- gestionar donaciones;
- publicar contenido.

---

# 5.13 CSRF

Cuando el Panel Administrativo utilice sesiones y formularios, deberá aplicarse protección CSRF según el patrón del proyecto.

Toda acción que cambie datos deberá:

- utilizar un token;
- verificarlo en el Backend;
- rechazar solicitudes inválidas.

No aplicar CSRF a endpoints públicos de solo lectura.

---

# 5.14 CORS

La política CORS deberá ser restrictiva.

No utilizar:

```text
Access-Control-Allow-Origin: *
```

para APIs privadas o administrativas.

Los orígenes permitidos deberán configurarse.

Los streams externos pueden tener políticas propias y no deben confundirse con el CORS de la API de LVJ.

---

# 5.15 Transacciones

## 5.15.1 Cuándo usar transacciones

Utilizar transacciones cuando una operación afecte varias tablas o registros relacionados.

Ejemplos:

- marcar un stream principal;
- cambiar capilla y stream activos;
- confirmar compra de bono;
- crear curso con lecciones;
- registrar donación y referencia;
- cambiar relaciones.

---

## 5.15.2 Ejemplo conceptual

```php
$pdo->beginTransaction();

try {
    // Actualizaciones relacionadas.
    $pdo->commit();
} catch (Throwable $e) {
    $pdo->rollBack();
    throw $e;
}
```

---

## 5.15.3 Regla

Una operación compuesta deberá completarse totalmente o revertirse.

No dejar estados parciales.

---

# 5.16 Borrado Lógico

Cuando exista:

```text
deleted_at
```

el Backend deberá utilizar eliminación lógica.

Ejemplo:

```sql
UPDATE lvj_capillas
SET deleted_at = CURRENT_TIMESTAMP
WHERE id = :id;
```

No ejecutar:

```sql
DELETE FROM lvj_capillas
```

salvo autorización expresa.

Las consultas deberán excluir registros eliminados.

---

# 5.17 Auditoría y Logs

## 5.17.1 Acciones auditables

Registrar cuando aplique:

- creación;
- edición;
- activación;
- desactivación;
- aprobación;
- rechazo;
- eliminación lógica;
- cambio de configuración;
- inicio de sesión;
- cambios de stream;
- errores críticos.

---

## 5.17.2 Datos mínimos

Un log debería contener:

- usuario;
- acción;
- tabla o módulo;
- registro;
- detalle resumido;
- fecha;
- IP cuando corresponda.

---

## 5.17.3 Información prohibida

No registrar:

- contraseñas;
- hashes completos sin necesidad;
- tokens;
- cookies;
- credenciales FTP;
- claves de Cloudflare;
- datos completos de tarjetas;
- URLs firmadas sensibles.

---

# 5.18 Archivos

## 5.18.1 Validación

Toda carga deberá validar:

- extensión;
- MIME;
- tamaño;
- nombre;
- destino;
- permisos.

---

## 5.18.2 Nombre físico

El nombre almacenado deberá ser generado por el sistema.

No confiar en el nombre original.

---

## 5.18.3 Rutas

Evitar:

- traversal;
- `../`;
- rutas absolutas recibidas del cliente;
- sobrescritura accidental;
- acceso a carpetas privadas.

---

## 5.18.4 Base de Datos

MySQL almacenará metadatos.

No almacenar binarios en campos de contenido salvo decisión expresa.

---

# 5.19 Integraciones Externas

## 5.19.1 Principio

Toda integración deberá encapsularse.

Ejemplos:

- Cloudflare;
- FTP;
- streams;
- servicios de correo;
- APIs externas.

No dispersar llamadas a un proveedor en múltiples archivos.

---

## 5.19.2 Errores externos

Los errores de terceros deberán traducirse a mensajes controlados.

No devolver respuestas crudas del proveedor.

---

## 5.19.3 Secretos

Nunca exponer secretos al Frontend.

---

# 5.20 Backend de Capilla Virtual

El Backend del módulo Capilla deberá seguir este flujo:

```text
Solicitud pública

↓

Consultar lvj_capilla_config

↓

Obtener capilla activa

↓

Obtener stream activo

↓

Validar relación

↓

Validar estado

↓

Construir respuesta JSON
```

Reglas:

1. No aceptar `capilla_id` arbitrario desde la pantalla pública para elegir la transmisión activa.
2. No aceptar `stream_id` arbitrario.
3. La configuración es la fuente maestra.
4. El stream deberá pertenecer a la capilla.
5. No exponer tokens.
6. No hardcodear URLs.
7. No implementar fallback salvo tarea expresa.

---

# 5.21 Backend de Radio

El Backend deberá:

- obtener el stream oficial desde `lvj_rad_streams`;
- consultar programación;
- relacionar programas y locutores;
- respetar estado y prioridad;
- no utilizar tablas legacy en nuevas implementaciones.

---

# 5.22 Backend de Liturgia

El Backend deberá:

- consultar la tabla canónica definida;
- evitar duplicidad entre tablas;
- relacionar tiempos, temas y santoral;
- devolver únicamente el contenido necesario;
- respetar fecha y estado;
- no decidir contenido pastoral en el Frontend.

---

# 5.23 Backend de Comunidad

El Backend deberá proteger:

- usuarios;
- notas;
- peticiones;
- testimonios;
- grupos;
- favoritos.

Reglas:

- aplicar privacidad;
- moderar contenido público;
- impedir acceso a registros de otros usuarios;
- validar pertenencia a grupos;
- ocultar identidad en peticiones anónimas;
- no publicar contenido pendiente.

---

# 5.24 Rendimiento

## 5.24.1 Consultas

Evitar:

- consultas repetidas;
- N+1;
- `SELECT *`;
- joins innecesarios;
- listados sin límite.

---

## 5.24.2 Caché

Podrá utilizarse para contenido estable.

No cachear indefinidamente:

- configuración activa;
- streams;
- sesiones;
- datos privados;
- estados de moderación.

---

## 5.24.3 Respuestas

Las respuestas deberán ser compactas.

No devolver contenido que la pantalla no utiliza.

---

# 5.25 Manejo de Errores

## 5.25.1 Desarrollo

En desarrollo podrán registrarse detalles técnicos.

---

## 5.25.2 Producción

En producción:

- ocultar stack traces;
- ocultar SQL;
- registrar internamente;
- devolver mensaje seguro;
- conservar código HTTP adecuado.

---

## 5.25.3 Excepciones

Las excepciones deberán capturarse en una capa coherente.

No rodear cada línea con bloques independientes sin necesidad.

---

# 5.26 Seguridad

El Backend deberá proteger contra:

- SQL Injection;
- XSS almacenado;
- CSRF;
- subida maliciosa de archivos;
- manipulación de IDs;
- escalamiento de privilegios;
- exposición de secretos;
- acceso no autorizado;
- enumeración de usuarios;
- fuerza bruta;
- rutas inseguras;
- SSRF en integraciones;
- iframes o URLs maliciosas.

---

# 5.27 Convenciones de Código PHP

## 5.27.1 Nombres claros

Usar nombres descriptivos.

Ejemplo:

```php
obtenerCapillaActiva()
```

Evitar:

```php
getData2()
```

---

## 5.27.2 Funciones pequeñas

Cada función deberá cumplir una responsabilidad.

---

## 5.27.3 Tipado

Cuando la versión de PHP lo permita, utilizar:

- tipos de parámetros;
- tipos de retorno;
- `strict_types`;
- propiedades tipadas.

---

## 5.27.4 Comentarios

Comentar decisiones, no instrucciones obvias.

---

## 5.27.5 Compatibilidad

Antes de usar una característica moderna, verificar la versión de PHP disponible.

---

# 5.28 Reglas para Codex

Antes de modificar el Backend, Codex deberá:

1. Leer AGENTS.md completo.
2. Identificar la ruta real.
3. Revisar la conexión existente.
4. Revisar endpoints similares.
5. Verificar tablas y columnas reales.
6. Revisar autenticación y permisos.
7. Presentar un plan breve.
8. Hacer cambios localizados.
9. Probar sintaxis PHP.
10. Probar las consultas.
11. No exponer información sensible.
12. Informar archivos modificados.

Codex no deberá:

- inventar endpoints;
- crear una segunda conexión;
- duplicar helpers;
- concatenar SQL;
- eliminar datos;
- crear tablas sin autorización;
- cambiar la arquitectura completa;
- modificar módulos no relacionados;
- exponer errores internos;
- usar tablas legacy en código nuevo;
- añadir dependencias innecesarias;
- publicar en producción;
- hacer push sin autorización.

---

# 5.29 Checklist antes de modificar el Backend

## Alcance

- [ ] Se leyó AGENTS.md.
- [ ] Se identificó el módulo.
- [ ] Se localizaron rutas y archivos reales.
- [ ] Se revisó un patrón similar.
- [ ] Se definió un alcance mínimo.
- [ ] No se modificarán otros módulos.

## Base de Datos

- [ ] Se verificaron nombres reales.
- [ ] Se verificaron relaciones.
- [ ] Se revisó `deleted_at`.
- [ ] Se revisó `estado`.
- [ ] Se revisaron índices.
- [ ] Se revisaron claves foráneas.
- [ ] No se utilizarán tablas legacy.

## Seguridad

- [ ] Se validarán entradas.
- [ ] Se usarán consultas preparadas.
- [ ] Se verificará autenticación.
- [ ] Se verificarán permisos.
- [ ] Se protegerán secretos.
- [ ] Se revisará CSRF.
- [ ] Se validarán URLs o archivos.

## Respuesta

- [ ] Se utilizará el formato oficial.
- [ ] Se definirán códigos HTTP.
- [ ] No se expondrán errores internos.
- [ ] Solo se devolverán campos necesarios.

---

# 5.30 Checklist después de modificar el Backend

## Sintaxis

- [ ] PHP no presenta errores.
- [ ] Las rutas cargan.
- [ ] No existen warnings.
- [ ] No existen notices.
- [ ] No existen errores de tipos.

## Consultas

- [ ] Las consultas funcionan.
- [ ] Los parámetros se enlazan.
- [ ] No se devuelven eliminados.
- [ ] No se devuelven inactivos indebidamente.
- [ ] Las relaciones son coherentes.
- [ ] No se generaron duplicados.

## API

- [ ] La respuesta JSON es válida.
- [ ] El formato es consistente.
- [ ] Los códigos HTTP son correctos.
- [ ] El estado de error funciona.
- [ ] El estado vacío funciona.
- [ ] No se exponen campos sensibles.

## Seguridad

- [ ] Los permisos se validan.
- [ ] La sesión funciona.
- [ ] El CSRF funciona cuando aplica.
- [ ] No hay SQL Injection.
- [ ] No se exponen secretos.
- [ ] Los archivos se validan.

## Integración

- [ ] El Frontend consume el endpoint.
- [ ] El Panel Administrativo funciona.
- [ ] No se afectaron otros módulos.
- [ ] No se modificó la Base de Datos fuera del alcance.
- [ ] Los logs se generan cuando corresponde.

---

# 5.31 Formato de Entrega

Toda tarea de Backend deberá informar:

## Resultado

Descripción breve.

## Archivos modificados

```text
ruta/archivo.php
```

## Endpoints

Indicar:

- método;
- ruta;
- autenticación;
- respuesta.

## Base de Datos

Indicar:

- tablas consultadas;
- tablas modificadas;
- SQL ejecutado;
- migraciones.

## Seguridad

Indicar validaciones y permisos implementados.

## Pruebas

Indicar:

- sintaxis;
- consultas;
- respuestas;
- errores;
- permisos.

## Pendientes

Indicar limitaciones o riesgos.

---

# 5.32 Regla Fundamental

El Backend de **La Voz de Jesús** deberá ser la capa central de seguridad, validación y reglas de negocio.

Toda implementación deberá:

1. reutilizar la arquitectura existente;
2. proteger la Base de Datos;
3. validar todas las entradas;
4. aplicar permisos;
5. usar consultas preparadas;
6. devolver respuestas coherentes;
7. registrar acciones críticas;
8. ocultar información sensible;
9. mantener compatibilidad con el hosting;
10. limitarse al alcance autorizado.

Cuando exista una diferencia entre AGENTS.md y la implementación real, Codex deberá inspeccionar el código, verificar la Base de Datos y reportar la inconsistencia antes de realizar cambios estructurales.

---

**Fin del Capítulo 5 – Arquitectura y Reglas del Backend**

# CAPÍTULO 6
# ARQUITECTURA Y REGLAS DEL PANEL ADMINISTRATIVO

## 6.1 Objetivo

El **Panel Administrativo** constituye la herramienta central de gestión interna del proyecto **La Voz de Jesús (LVJ)**.

Su finalidad es permitir que los administradores, editores y usuarios autorizados gestionen de forma segura, ordenada y dinámica los contenidos, configuraciones, usuarios, transmisiones, recursos multimedia y demás módulos de la plataforma.

El Panel Administrativo deberá permitir que la operación ordinaria del sistema pueda realizarse sin modificar directamente:

- archivos PHP;
- componentes del Frontend;
- consultas SQL;
- variables internas;
- configuraciones escritas en código;
- registros mediante phpMyAdmin, salvo tareas técnicas excepcionales.

El flujo oficial será:

```text
Administrador autorizado

↓

Panel Administrativo

↓

Validación de permisos

↓

Backend PHP

↓

Base de Datos

↓

Auditoría

↓

Respuesta al administrador
```

El Panel Administrativo será responsable de:

- gestionar contenidos;
- administrar configuraciones;
- controlar estados;
- validar y moderar información;
- seleccionar recursos activos;
- administrar streams;
- gestionar usuarios y roles;
- registrar acciones importantes;
- presentar errores de manera segura;
- mantener coherencia entre módulos.

No será responsable de:

- conectarse directamente a MySQL desde JavaScript;
- ejecutar SQL enviado por el navegador;
- exponer credenciales;
- modificar datos sin validación del Backend;
- permitir acciones sensibles sin autorización;
- reemplazar la lógica de negocio del servidor.

---

# 6.2 Principios Fundamentales

Toda implementación del Panel Administrativo deberá respetar los siguientes principios.

## 6.2.1 Seguridad por defecto

Ninguna pantalla administrativa deberá considerarse pública.

Toda ruta deberá verificar:

- sesión activa;
- usuario válido;
- estado de la cuenta;
- rol;
- permiso para la acción solicitada.

Ocultar un botón no constituye una medida de seguridad.

La autorización deberá comprobarse siempre en el Backend.

---

## 6.2.2 Administración dinámica

Toda información administrable deberá gestionarse mediante formularios y vistas del Panel.

Ejemplos:

- capillas;
- streams;
- emisora;
- programación;
- liturgia;
- santoral;
- biblioteca;
- usuarios;
- publicidad;
- mensajes;
- imágenes;
- configuraciones;
- estados;
- prioridades.

No deberán mantenerse valores modificables exclusivamente dentro del código.

---

## 6.2.3 Consistencia

Todos los módulos administrativos deberán conservar un patrón visual y funcional uniforme.

Los listados, formularios, filtros, mensajes y acciones deberán comportarse de forma predecible.

---

## 6.2.4 Cambios localizados

Una tarea sobre un módulo administrativo no deberá modificar:

- el menú completo;
- otros CRUD;
- estilos globales;
- rutas no relacionadas;
- permisos de otros módulos;
- estructura general del Panel;

salvo autorización expresa.

---

## 6.2.5 Trazabilidad

Las acciones administrativas importantes deberán poder auditarse.

El sistema deberá permitir conocer:

- quién realizó la acción;
- qué acción realizó;
- sobre qué registro;
- cuándo ocurrió;
- cuál fue el resultado;
- qué cambio relevante se produjo.

---

# 6.3 Arquitectura Oficial del Panel

El flujo de una operación administrativa deberá seguir esta estructura:

```text
Vista administrativa

↓

Formulario o acción

↓

Validación del Frontend

↓

Solicitud al Backend

↓

Autenticación

↓

Autorización

↓

Validación del servidor

↓

Regla de negocio

↓

Base de Datos

↓

Auditoría

↓

Respuesta

↓

Mensaje al administrador
```

Nunca:

```text
Formulario

↓

MySQL
```

Nunca:

```text
JavaScript

↓

Consulta SQL
```

---

# 6.4 Organización General del Panel

El Panel Administrativo deberá organizarse por módulos funcionales.

Estructura conceptual:

```text
Panel Administrativo

├── Inicio / Dashboard
├── Configuración
├── Radio
├── Capilla Virtual
├── Liturgia
├── Santoral
├── Biblia
├── Oraciones
├── Podcast
├── Biblioteca
├── Formación
├── Comunidad
├── Economía
├── Publicidad
├── FileServer
├── Usuarios
├── Roles
├── Logs
└── Sistema
```

La estructura real deberá corresponder con los módulos existentes.

Codex no deberá crear accesos a módulos aún no implementados salvo instrucción expresa.

---

# 6.5 Menú Administrativo

## 6.5.1 Menú lateral

El menú lateral deberá:

- mantener el diseño existente;
- agrupar opciones por módulo;
- mostrar únicamente opciones autorizadas;
- conservar iconos y etiquetas consistentes;
- permitir identificar la sección activa;
- funcionar correctamente en dispositivos pequeños.

---

## 6.5.2 Submenús

Los módulos complejos podrán organizarse mediante submenús.

Ejemplo:

```text
Capilla Virtual

├── Capillas
├── Streams
├── Configuración
├── Verificación
├── Intenciones
└── Logs
```

Otro ejemplo:

```text
Radio

├── Streams
├── Locutores
├── Programas
├── Programación
└── Configuración
```

---

## 6.5.3 Restricciones

No deberán existir:

- opciones duplicadas;
- enlaces rotos;
- rutas diferentes para la misma función;
- módulos sin autorización;
- opciones visibles que no estén implementadas;
- menús construidos con valores hardcodeados cuando exista configuración dinámica.

---

# 6.6 Dashboard Administrativo

## 6.6.1 Propósito

El Dashboard deberá presentar una visión general del estado del sistema.

Podrá incluir:

- estado de la emisora;
- estado de la Capilla Virtual;
- stream activo;
- programación actual;
- peticiones pendientes;
- testimonios pendientes;
- errores recientes;
- usuarios registrados;
- contenidos por publicar;
- uso de almacenamiento;
- campañas activas.

---

## 6.6.2 Reglas

El Dashboard deberá:

- mostrar información útil;
- evitar métricas decorativas sin valor;
- no ejecutar consultas pesadas en cada carga;
- respetar permisos;
- no exponer información sensible;
- enlazar con el módulo correspondiente.

---

# 6.7 Patrón Oficial de CRUD

Todos los módulos administrativos deberán seguir un patrón uniforme.

```text
Listado

↓

Crear

↓

Editar

↓

Cambiar estado

↓

Eliminar lógicamente

↓

Auditar
```

---

## 6.7.1 Listado

Todo listado deberá permitir, cuando corresponda:

- búsqueda;
- filtros;
- ordenamiento;
- paginación;
- estado;
- fecha;
- acciones;
- visualización clara de relaciones.

No deberán cargarse miles de registros sin paginación.

---

## 6.7.2 Crear

El formulario de creación deberá:

- mostrar campos necesarios;
- marcar obligatorios;
- validar datos;
- conservar valores ante error;
- impedir duplicados;
- confirmar creación;
- registrar auditoría cuando aplique.

---

## 6.7.3 Editar

El formulario de edición deberá:

- cargar el registro real;
- validar que exista;
- verificar permisos;
- conservar campos no modificados;
- impedir alteración de relaciones inválidas;
- registrar cambios relevantes.

---

## 6.7.4 Cambiar estado

Siempre que sea posible, deberá preferirse:

```text
activo

↓

inactivo
```

en lugar de eliminar.

Los cambios de estado deberán:

- validar relaciones;
- impedir estados incoherentes;
- registrar auditoría;
- mostrar confirmación.

---

## 6.7.5 Eliminar

Cuando exista `deleted_at`, la eliminación deberá ser lógica.

Ejemplo:

```sql
UPDATE tabla
SET deleted_at = CURRENT_TIMESTAMP
WHERE id = :id;
```

No utilizar borrado físico salvo autorización expresa.

---

# 6.8 Listados Administrativos

## 6.8.1 Columnas

Las columnas deberán mostrar información útil.

Ejemplo incorrecto:

```text
Capilla ID: 2
```

Ejemplo recomendado:

```text
Capilla: Convento de la Santísima Trinidad
```

El identificador puede mantenerse internamente, pero la interfaz deberá mostrar nombres comprensibles.

---

## 6.8.2 Relaciones

Cuando una tabla use claves foráneas, el listado deberá mostrar el dato relacionado mediante `JOIN`.

Ejemplo:

```text
lvj_capilla_streams.capilla_id

↓

lvj_capillas.nombre
```

---

## 6.8.3 Acciones

Acciones recomendadas:

- Ver;
- Editar;
- Activar;
- Inactivar;
- Duplicar, cuando esté autorizado;
- Verificar;
- Publicar;
- Aprobar;
- Rechazar;
- Eliminar lógicamente.

No mostrar acciones que el usuario no puede ejecutar.

---

## 6.8.4 Estados visuales

Los estados deberán representarse con etiquetas consistentes.

Ejemplos:

```text
Activo

Inactivo

Pendiente

Aprobado

Rechazado

Error

Mantenimiento

Principal

Respaldo
```

No depender únicamente del color.

---

# 6.9 Formularios Administrativos

## 6.9.1 Organización

Los formularios extensos deberán dividirse en:

- tarjetas;
- secciones;
- pestañas;
- grupos lógicos.

Ejemplo:

```text
Datos generales

Recursos

Configuración

Estado
```

---

## 6.9.2 Etiquetas

Todo campo deberá tener:

- etiqueta;
- ayuda cuando sea necesaria;
- mensaje de error;
- formato esperado;
- indicación de obligatoriedad.

---

## 6.9.3 Campos relacionados

Las claves foráneas deberán representarse mediante selectores comprensibles.

Ejemplo:

```text
Capilla

[ Convento de la Santísima Trinidad — Nitra, Eslovaquia ]
```

No mostrar únicamente:

```text
2
```

---

## 6.9.4 Campos condicionales

Los campos podrán mostrarse según otro valor.

Ejemplo en Streams:

```text
tipo_stream = hls
    → mostrar URL HLS

tipo_stream = youtube
    → mostrar URL YouTube

requiere_referer = 1
    → mostrar referer_url
```

La validación del Backend deberá mantenerse aunque el campo esté oculto.

---

## 6.9.5 Prevención de envíos duplicados

Durante el envío:

- desactivar el botón;
- mostrar progreso;
- impedir doble clic;
- conservar respuesta;
- evitar inserciones duplicadas.

---

# 6.10 Validación

## 6.10.1 Validación en dos capas

Toda información deberá validarse:

1. En el Frontend, para mejorar la experiencia.
2. En el Backend, para garantizar seguridad e integridad.

---

## 6.10.2 Validaciones comunes

- campos obligatorios;
- longitud;
- formato;
- correo;
- URL;
- número;
- fecha;
- hora;
- estado permitido;
- relación válida;
- archivo permitido;
- unicidad;
- permisos.

---

## 6.10.3 Errores

Los errores deberán mostrarse junto al campo correspondiente cuando sea posible.

No mostrar mensajes genéricos cuando se conoce el campo inválido.

---

# 6.11 Confirmaciones

Las acciones sensibles deberán solicitar confirmación.

Ejemplos:

- eliminar;
- desactivar;
- cambiar stream activo;
- cambiar capilla activa;
- aprobar testimonio;
- rechazar petición;
- cerrar campaña;
- modificar configuración global;
- restaurar un registro.

La confirmación deberá describir claramente la acción.

---

# 6.12 Mensajes del Sistema

Los mensajes deberán ser claros y consistentes.

## Éxito

```text
El registro fue actualizado correctamente.
```

## Validación

```text
Revisa los campos indicados.
```

## Error

```text
No fue posible completar la operación.
```

## Confirmación

```text
¿Deseas desactivar este stream?
```

No mostrar al administrador errores SQL completos en la interfaz.

---

# 6.13 Autenticación Administrativa

## 6.13.1 Inicio de sesión

El acceso deberá requerir:

- usuario válido;
- contraseña segura;
- estado activo;
- rol autorizado.

---

## 6.13.2 Sesión

La sesión deberá:

- regenerar su identificador;
- expirar por inactividad;
- cerrarse correctamente;
- usar cookies seguras;
- impedir acceso después del cierre.

---

## 6.13.3 Intentos fallidos

El sistema deberá considerar:

- límite de intentos;
- registro de fallos;
- bloqueo temporal;
- protección contra fuerza bruta.

No revelar si un correo específico existe.

---

# 6.14 Roles y Permisos

## 6.14.1 Regla principal

Cada acción deberá validarse contra el rol o permiso del usuario.

Ejemplos de perfiles posibles:

```text
Superadministrador

Administrador

Editor

Moderador

Gestor de contenidos

Gestor técnico

Consulta
```

La existencia real de estos perfiles deberá verificarse en la Base de Datos.

---

## 6.14.2 Permisos por módulo

Los permisos podrán dividirse en:

```text
ver

crear

editar

activar

eliminar

aprobar

configurar

auditar
```

---

## 6.14.3 Prohibición

No confiar únicamente en:

- el menú;
- el botón oculto;
- la ruta del navegador;
- una variable JavaScript.

La autorización siempre debe verificarse en el Backend.

---

# 6.15 Auditoría Administrativa

## 6.15.1 Acciones registrables

Registrar:

- creación;
- edición;
- eliminación lógica;
- activación;
- desactivación;
- aprobación;
- rechazo;
- cambio de configuración;
- cambio de stream;
- cambio de capilla;
- acceso a información sensible;
- cambios de roles.

---

## 6.15.2 Información mínima

Un log administrativo deberá incluir:

- usuario;
- acción;
- tabla;
- registro;
- detalle resumido;
- fecha;
- resultado.

---

## 6.15.3 Restricciones

No guardar:

- contraseñas;
- tokens;
- credenciales;
- datos bancarios;
- sesiones;
- contenido sensible innecesario.

---

# 6.16 Gestión del Módulo Capilla Virtual

El Panel deberá organizar el módulo de Capilla Virtual en secciones independientes.

```text
Capilla Virtual

├── Capillas
├── Streams
├── Configuración
├── Verificación
├── Intenciones
└── Logs
```

---

## 6.16.1 Capillas

Deberá permitir:

- listar;
- buscar;
- crear;
- editar;
- activar;
- inactivar;
- marcar principal;
- marcar respaldo;
- definir prioridad;
- registrar ubicación;
- subir imagen;
- registrar logo;
- registrar sitio web.

No deberá guardar URLs de reproducción en `lvj_capillas`.

---

## 6.16.2 Streams

Deberá permitir:

- seleccionar capilla;
- crear streams;
- editar;
- elegir tipo;
- registrar URL;
- registrar URL de origen;
- marcar principal;
- definir prioridad;
- indicar token o referer;
- activar;
- inactivar;
- probar.

El nombre de la capilla deberá mostrarse mediante relación, no solo el ID.

---

## 6.16.3 Configuración

Deberá permitir:

- seleccionar capilla activa;
- seleccionar stream activo;
- definir modo;
- definir calidad;
- mostrar u ocultar datos;
- editar mensajes;
- activar o desactivar el módulo.

El selector de stream deberá filtrar únicamente los streams de la capilla seleccionada.

---

## 6.16.4 Verificación

Deberá permitir:

- probar un stream;
- mostrar resultado;
- registrar fecha;
- actualizar error;
- mostrar tipo;
- no exponer tokens.

---

## 6.16.5 Intenciones

Deberá permitir:

- revisar;
- aprobar;
- rechazar;
- archivar;
- proteger identidad;
- filtrar;
- moderar.

No publicar automáticamente contenido pendiente.

---

# 6.17 Gestión de Radio

El Panel deberá permitir:

```text
Radio

├── Streams
├── Locutores
├── Programas
├── Programación
└── Configuración
```

Deberá mantener separadas:

- identidad del programa;
- locutor;
- horario;
- stream.

---

# 6.18 Gestión de Liturgia

El módulo deberá permitir administrar:

- fecha;
- tiempo litúrgico;
- tema;
- celebración;
- lecturas;
- salmo;
- Evangelio;
- reflexión;
- oración;
- recursos multimedia;
- estado.

No deberá alimentar varias tablas litúrgicas simultáneamente sin una decisión arquitectónica definida.

---

# 6.19 Gestión de Biblia

El Panel deberá permitir gestionar:

- versiones;
- libros;
- versículos;
- notas editoriales;
- temas;
- planes;
- días de plan.

Las operaciones masivas de importación deberán realizarse mediante procesos controlados.

---

# 6.20 Gestión de Comunidad

Deberá permitir gestionar:

- usuarios;
- grupos;
- membresías;
- peticiones;
- testimonios;
- moderación;
- estados.

Los datos privados deberán mostrarse únicamente a usuarios autorizados.

---

# 6.21 Gestión de Publicidad

Deberá permitir:

- crear campañas;
- definir ubicación;
- cargar imagen;
- registrar enlace;
- establecer vigencia;
- activar;
- inactivar;
- consultar métricas;
- administrar patrocinadores;
- configurar AdSense.

No incrustar IDs de anuncios en componentes si existe configuración administrable.

---

# 6.22 Gestión de FileServer

Deberá permitir:

- administrar carpetas;
- cargar archivos;
- mover archivos;
- cambiar estado;
- ver metadatos;
- registrar acciones;
- gestionar almacenamiento;
- controlar permisos.

No deberá permitir:

- rutas arbitrarias;
- traversal;
- carga sin validación;
- exposición de credenciales FTP;
- eliminación física sin autorización.

---

# 6.23 Gestión de Configuración General

El Panel deberá permitir administrar:

- identidad de la emisora;
- logos;
- iconos;
- datos de contacto;
- redes sociales;
- apariencia;
- módulos visibles;
- mantenimiento;
- versión de la aplicación;
- opciones PWA.

Los cambios deberán reflejarse mediante APIs y configuración dinámica.

---

# 6.24 Gestión de Recursos Multimedia

## 6.24.1 Archivos

Los archivos deberán cargarse mediante el sistema oficial.

---

## 6.24.2 Vista previa

Cuando corresponda, mostrar:

- imagen;
- audio;
- video;
- PDF;
- nombre;
- tamaño;
- tipo.

---

## 6.24.3 Reemplazo

Al reemplazar un archivo:

- validar el nuevo;
- conservar relación;
- evitar archivos huérfanos;
- documentar la acción.

---

# 6.25 Búsqueda y Filtros

Los listados deberán permitir filtros relevantes.

Ejemplos:

- estado;
- fecha;
- módulo;
- categoría;
- capilla;
- tipo de stream;
- usuario;
- aprobación;
- prioridad.

Los filtros deberán implementarse en el Backend.

No cargar todos los registros para filtrarlos únicamente en el navegador.

---

# 6.26 Paginación

Todo listado potencialmente grande deberá paginarse.

Ejemplos:

- usuarios;
- logs;
- archivos;
- peticiones;
- testimonios;
- anuncios;
- versículos;
- donaciones.

El Backend deberá controlar:

- página;
- límite;
- total;
- filtros;
- orden.

---

# 6.27 Diseño Responsive

El Panel deberá ser funcional en:

- escritorio;
- portátil;
- tableta;
- móvil.

Aunque la administración principal se realice en escritorio, no deberán existir pantallas inutilizables en teléfonos.

Los formularios deberán adaptarse sin perder campos ni acciones.

---

# 6.28 Accesibilidad

El Panel deberá incluir:

- etiquetas en formularios;
- botones comprensibles;
- contraste suficiente;
- foco visible;
- textos legibles;
- mensajes asociados;
- navegación coherente;
- tamaño táctil adecuado.

---

# 6.29 Seguridad del Panel

El Panel deberá protegerse contra:

- SQL Injection;
- XSS;
- CSRF;
- subida maliciosa;
- manipulación de IDs;
- escalamiento de privilegios;
- fuerza bruta;
- acceso directo a rutas;
- exposición de datos;
- acciones sin sesión.

---

# 6.30 Errores y Diagnóstico

En producción no deberán mostrarse:

- consultas SQL;
- rutas físicas;
- stack traces;
- contraseñas;
- variables de entorno;
- mensajes internos completos.

Los errores deberán registrarse internamente.

---

# 6.31 Rendimiento

El Panel deberá evitar:

- consultas N+1;
- listados completos;
- imágenes sin optimizar;
- archivos pesados innecesarios;
- recargas completas cuando no sean necesarias;
- llamadas repetidas;
- consultas sin índices.

---

# 6.32 Reglas para Codex

Antes de modificar el Panel Administrativo, Codex deberá:

1. Leer completamente `AGENTS.md`.
2. Localizar el módulo real.
3. Revisar el patrón CRUD existente.
4. Identificar rutas, vistas y controladores.
5. Verificar roles y permisos.
6. Verificar las tablas reales.
7. Revisar estilos compartidos.
8. Presentar un plan breve.
9. Modificar únicamente lo solicitado.
10. Probar crear, editar, listar y cambiar estado.
11. Informar archivos modificados.

Codex no deberá:

- rediseñar el Panel completo;
- modificar el menú global sin autorización;
- crear CRUD duplicados;
- inventar rutas;
- cambiar roles;
- eliminar datos;
- mostrar IDs en lugar de nombres cuando exista relación;
- hardcodear opciones administrables;
- exponer errores técnicos;
- modificar otros módulos;
- instalar librerías innecesarias;
- ejecutar acciones en producción;
- hacer `push` sin autorización.

---

# 6.33 Checklist antes de modificar el Panel

## Alcance

- [ ] Se leyó `AGENTS.md`.
- [ ] Se identificó el módulo correcto.
- [ ] Se localizó el CRUD existente.
- [ ] Se revisaron módulos similares.
- [ ] Se definieron archivos a modificar.
- [ ] No se afectarán otros módulos.

## Base de Datos

- [ ] Se verificaron tablas y columnas.
- [ ] Se revisaron relaciones.
- [ ] Se revisó borrado lógico.
- [ ] Se revisaron estados.
- [ ] Se revisaron índices.
- [ ] No se usarán tablas legacy.

## Seguridad

- [ ] Se verificará sesión.
- [ ] Se verificarán permisos.
- [ ] Se aplicará CSRF.
- [ ] Se validarán entradas.
- [ ] Se usarán consultas preparadas.
- [ ] No se expondrán secretos.

## Diseño

- [ ] Se conservará el patrón visual.
- [ ] Se reutilizarán componentes.
- [ ] Se mantendrá responsive.
- [ ] No se modificarán estilos globales.

---

# 6.34 Checklist después de modificar el Panel

## CRUD

- [ ] El listado funciona.
- [ ] La búsqueda funciona.
- [ ] Los filtros funcionan.
- [ ] La paginación funciona.
- [ ] La creación funciona.
- [ ] La edición funciona.
- [ ] El cambio de estado funciona.
- [ ] El borrado lógico funciona.

## Relaciones

- [ ] Los selectores muestran nombres.
- [ ] Las claves foráneas son válidas.
- [ ] No quedaron registros huérfanos.
- [ ] Las relaciones se muestran correctamente.

## Seguridad

- [ ] Los permisos se validan.
- [ ] Las rutas están protegidas.
- [ ] El CSRF funciona.
- [ ] No se muestran datos sensibles.
- [ ] No existen errores SQL visibles.

## Diseño

- [ ] La interfaz mantiene el estilo.
- [ ] Funciona en escritorio.
- [ ] Funciona en tableta.
- [ ] Funciona en móvil.
- [ ] No existen superposiciones.
- [ ] Los formularios son legibles.

## Auditoría

- [ ] Las acciones críticas se registran.
- [ ] El usuario responsable queda identificado.
- [ ] Los detalles no exponen secretos.

---

# 6.35 Formato de Entrega

Toda tarea del Panel Administrativo deberá informar:

## Resultado

Descripción breve de lo implementado.

## Archivos modificados

```text
ruta/vista.php
ruta/controlador.php
ruta/javascript.js
```

## Módulo

Indicar la sección afectada.

## Base de Datos

Indicar:

- tablas consultadas;
- tablas modificadas;
- SQL ejecutado;
- migraciones.

## Seguridad

Indicar:

- autenticación;
- permisos;
- validaciones;
- CSRF.

## Pruebas realizadas

Indicar:

- listado;
- búsqueda;
- creación;
- edición;
- estado;
- eliminación lógica;
- permisos;
- responsive.

## Pendientes

Documentar limitaciones o riesgos.

---

# 6.36 Regla Fundamental

El Panel Administrativo de **La Voz de Jesús** deberá ser una herramienta segura, coherente, modular y completamente integrada con la arquitectura oficial del proyecto.

Toda implementación deberá:

1. respetar roles y permisos;
2. reutilizar el patrón existente;
3. administrar datos dinámicamente;
4. validar todas las entradas;
5. proteger acciones sensibles;
6. conservar la trazabilidad;
7. mantener el diseño actual;
8. evitar duplicidad de CRUD;
9. respetar la Base de Datos oficial;
10. limitarse al alcance autorizado.

Cuando exista una diferencia entre el Panel, la Base de Datos y `AGENTS.md`, Codex deberá inspeccionar la implementación real, documentar la inconsistencia y evitar cambios amplios hasta resolverla.

---

**Fin del Capítulo 6 – Arquitectura y Reglas del Panel Administrativo**

# CAPÍTULO 7
# MÓDULO CAPILLA VIRTUAL

## 7.1 Objetivo

El módulo **Capilla Virtual** constituye el centro espiritual del proyecto **La Voz de Jesús (LVJ)**.

Su finalidad es permitir que cualquier persona pueda entrar, desde cualquier lugar del mundo, en un ambiente de oración y adoración al Santísimo Sacramento mediante transmisiones en vivo provenientes de capillas católicas de adoración perpetua.

Este módulo no debe entenderse únicamente como un reproductor de video, sino como un espacio digital de encuentro con Jesucristo Eucaristía, integrando transmisión en vivo, oración comunitaria e intenciones de los fieles.

Toda la configuración deberá administrarse desde la Base de Datos y el Panel Administrativo, evitando configuraciones escritas directamente en el código.

---

# 7.2 Filosofía del Módulo

El diseño del módulo Capilla Virtual se fundamenta en los siguientes principios:

- Cristo Eucaristía como centro de la experiencia.
- Configuración completamente dinámica.
- Arquitectura escalable.
- Soporte para múltiples capillas.
- Compatibilidad con diferentes tecnologías de streaming.
- Administración centralizada.
- Independencia entre la información de la capilla y sus transmisiones.
- Alta disponibilidad mediante múltiples streams.

La pantalla pública nunca deberá depender de valores escritos directamente en el código.

---

# 7.3 Objetivos Funcionales

El módulo permitirá administrar:

- Capillas de adoración.
- Transmisiones en vivo.
- Streams HLS.
- Streams YouTube.
- Streams MP4.
- Streams mediante Iframe.
- Configuración de la capilla activa.
- Historial técnico.
- Intenciones de oración.
- Información institucional de cada capilla.
- Recursos multimedia asociados.

En futuras versiones también podrá incorporar:

- Cambio automático de streams.
- Monitoreo de disponibilidad.
- Estadísticas.
- Notificaciones.
- Múltiples capillas simultáneas.

---

# 7.4 Arquitectura del Módulo

La arquitectura oficial del módulo es la siguiente.

```text
Panel Administrativo

        │

        ▼

Configuración

        │

        ▼

Capilla Activa

        │

        ▼

Streams

        │

        ▼

API Capilla

        │

        ▼

Pantalla Pública

        │

        ▼

Reproductor
```

Toda la lógica de selección de la transmisión deberá realizarse desde la Base de Datos.

---

# 7.5 Arquitectura de Base de Datos

El módulo utiliza cuatro tablas oficiales.

```text
lvj_capillas

↓

lvj_capilla_streams

↓

lvj_capilla_config

↓

lvj_capilla_logs
```

Cada una posee una responsabilidad específica.

Nunca deberán mezclarse responsabilidades entre tablas.

---

## lvj_capillas

Responsabilidad

Almacena la información institucional de cada capilla.

Ejemplos

- Nombre.
- Ciudad.
- País.
- Descripción.
- Imagen.
- Logo.
- Sitio web.

No almacena información del stream.

---

## lvj_capilla_streams

Responsabilidad

Almacena todas las fuentes de transmisión asociadas a una capilla.

Cada capilla podrá poseer múltiples streams.

Tipos soportados:

- HLS
- YouTube
- MP4
- Iframe

La URL de reproducción pertenece exclusivamente a esta tabla.

---

## lvj_capilla_config

Responsabilidad

Determina qué capilla y qué stream se mostrarán en la aplicación.

La pantalla pública nunca seleccionará una capilla por sí misma.

Toda selección proviene de esta tabla.

---

## lvj_capilla_logs

Responsabilidad

Registrar eventos técnicos.

Ejemplos:

- Cambios administrativos.
- Errores.
- Verificaciones.
- Eventos automáticos.
- Historial de reproducción.

---

# 7.6 Relaciones

```text
lvj_capillas

        │

        ├───────────────┐

        ▼               │

lvj_capilla_streams      │

        │               │

        └───────┐       │

                ▼       ▼

          lvj_capilla_config

                │

                ▼

         Pantalla Pública
```

Toda transmisión deberá pertenecer obligatoriamente a una capilla.

---

# 7.7 Flujo Oficial de la Pantalla Pública

La pantalla `/capilla` deberá seguir exactamente el siguiente flujo.

```text
1. Leer lvj_capilla_config

↓

2. Obtener capilla_activa_id

↓

3. Obtener stream_activo_id

↓

4. Consultar lvj_capillas

↓

5. Consultar lvj_capilla_streams

↓

6. Validar relaciones

↓

7. Construir JSON

↓

8. Renderizar la pantalla
```

La pantalla nunca deberá consultar directamente una capilla.

---

# 7.8 Streams

Una capilla puede poseer múltiples streams.

Ejemplo

```text
Capilla

│

├── HLS Oficial

├── YouTube

├── MP4

└── Iframe
```

Cada stream posee:

- prioridad
- estado
- tipo_stream
- url_stream

La prioridad define el orden de preferencia.

---

# 7.9 Tipos de Stream

Actualmente se soportan:

## HLS

Formato oficial del proyecto.

Debe reproducirse mediante soporte nativo del navegador o utilizando **hls.js** cuando sea necesario.

---

## YouTube

Se utilizará únicamente cuando exista una transmisión oficial mediante YouTube.

No deberá reemplazar un stream HLS disponible.

---

## MP4

Compatible con contenido bajo demanda o transmisiones específicas.

---

## Iframe

Utilizado únicamente cuando el proveedor no permita acceso directo al stream.

---

# 7.10 Reproductor

El reproductor deberá ser completamente independiente de la Base de Datos.

Su responsabilidad consiste únicamente en reproducir la fuente recibida desde la API.

Nunca deberá contener lógica de negocio.

Funciones principales:

- Play.
- Pause.
- Reconexión.
- Pantalla completa.
- Cambio dinámico de fuente.

---

# 7.11 Intenciones de Oración

La pantalla pública incluirá una sección destinada a las intenciones de oración de los fieles.

La experiencia buscada no es la de un chat convencional.

Deberá funcionar como un **muro comunitario de oración**, donde las personas publiquen sus intenciones y otros usuarios puedan unirse espiritualmente a ellas.

La implementación oficial utiliza:

```text
lvj_com_peticiones_oracion

↓

lvj_com_peticiones_apoyos

↓

API REST PHP

↓

Formulario y muro público de Capilla
```

Las intenciones nuevas se almacenarán con estado `pendiente` y no serán visibles públicamente hasta su aprobación desde el Panel Administrativo.

La tabla `lvj_com_peticiones_apoyos` registrará una única unión de oración por intención e identificador de sesión. El total público se mantendrá en `lvj_com_peticiones_oracion.total_oraciones` y deberá actualizarse dentro de una transacción.

Endpoints oficiales:

- `GET /api/peticiones`: lista únicamente intenciones aprobadas y no eliminadas.
- `POST /api/peticiones-crear`: valida y almacena una intención pendiente.
- `POST /api/peticiones-orar`: registra la unión de oración sin duplicarla por sesión.

El Panel Administrativo deberá permitir revisar, aprobar, rechazar, marcar como respondida y eliminar lógicamente cada intención.

En futuras versiones podrá incorporar:

- Moderación.
- Reacciones ("Estoy orando por ti").
- Respuestas pastorales.
- Filtrado de contenido.
- Historial.

---

# 7.12 Panel Administrativo

Desde el Panel Administrativo deberá ser posible:

- Crear capillas.
- Editar capillas.
- Desactivar capillas.
- Administrar streams.
- Seleccionar la capilla activa.
- Seleccionar el stream activo.
- Consultar logs.
- Configurar mensajes.

No deberán existir configuraciones equivalentes escritas en el código.

---

# 7.13 Seguridad

No exponer:

- URLs privadas.
- Tokens.
- Credenciales.
- Configuración interna.

Toda la información deberá obtenerse mediante APIs.

---

# 7.14 Buenas Prácticas

- No escribir URLs de streaming directamente en el código.
- No escribir IDs de capillas en el frontend.
- No duplicar información entre tablas.
- Reutilizar el reproductor existente.
- Centralizar la configuración.
- Validar siempre que el stream pertenezca a la capilla seleccionada.

---

# 7.15 Reglas para Codex

Antes de modificar este módulo, Codex deberá verificar:

1. Si la tabla ya existe.
2. Si el endpoint ya existe.
3. Si la pantalla ya existe.
4. Si el reproductor ya soporta el tipo de stream.
5. Si la modificación rompe relaciones existentes.
6. Si el cambio requiere actualizar AGENTS.md.

No está permitido:

- Crear nuevas tablas sin justificación.
- Duplicar la información de los streams.
- Escribir URLs HLS directamente en React o PHP.
- Cambiar el diseño de la pantalla sin autorización.
- Crear un nuevo reproductor cuando ya exista uno funcional.

---

# 7.16 Estado Actual

Estado del módulo:

🟢 En desarrollo avanzado.

Implementado:

- Arquitectura de Base de Datos.
- CRUD de Capillas.
- CRUD de Streams.
- Configuración dinámica.
- Soporte HLS.
- Integración con Panel Administrativo.
- Intenciones de oración conectadas a MySQL.
- Moderación de intenciones desde el Panel Administrativo.
- Acción comunitaria "Estoy orando" con protección contra duplicados por sesión.

Pendiente:

- Conexión completa de la pantalla pública.
- Health Check.
- Fallback automático.
- Estadísticas.

---

# 7.17 Roadmap

Las siguientes funcionalidades forman parte del crecimiento previsto del módulo:

- Múltiples capillas simultáneas.
- Cambio automático de stream.
- Verificación periódica de disponibilidad.
- Estadísticas de visualización.
- Integración con notificaciones.
- Agenda de adoración.
- Calendario de celebraciones.
- Muro comunitario de oración.
- Capillas favoritas.
- Historial de visitas.

---

# 7.18 Regla Fundamental

La **Capilla Virtual** representa el corazón espiritual de la aplicación.

Toda la información relacionada con las capillas, sus transmisiones, configuraciones y recursos deberá administrarse exclusivamente desde la Base de Datos y el Panel Administrativo.

Ninguna URL de transmisión, configuración o selección de capilla deberá permanecer escrita directamente en el código fuente.

La pantalla pública deberá limitarse a consumir la información proporcionada por la API y representar fielmente la configuración definida por el administrador del sistema.

# CAPÍTULO 8
# MÓDULO RADIO

## 8.1 Objetivo

El módulo **Radio** constituye uno de los pilares principales del proyecto **La Voz de Jesús (LVJ)**.

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

El módulo **Liturgia** constituye uno de los componentes doctrinales más importantes del proyecto **La Voz de Jesús (LVJ)**.

Su propósito es presentar diariamente la Liturgia de la Iglesia Católica de forma organizada, dinámica y completamente administrable desde la Base de Datos, permitiendo al usuario vivir el ritmo del Año Litúrgico en comunión con la Iglesia Universal.

El módulo deberá integrar en una única experiencia:

- Calendario litúrgico.
- Tiempo litúrgico.
- Lecturas del día.
- Evangelio.
- Salmo responsorial.
- Reflexión.
- Lectio Divina.
- Santoral.
- Recursos pastorales relacionados.

Toda la información deberá administrarse desde el Panel Administrativo y la Base de Datos, evitando contenido fijo escrito directamente en el código.

---

# 9.2 Filosofía del Módulo

La Liturgia constituye el centro de la vida de la Iglesia.

Por esta razón, el módulo deberá construirse respetando los siguientes principios:

- Fidelidad al Calendario Litúrgico de la Iglesia Católica.
- Configuración completamente dinámica.
- Separación entre contenido y presentación.
- Escalabilidad.
- Reutilización de contenidos.
- Integración con el resto de módulos del sistema.

La aplicación deberá presentar únicamente el contenido correspondiente a la fecha consultada.

---

# 9.3 Objetivos Funcionales

El módulo permitirá administrar:

- Calendario litúrgico.
- Tiempo litúrgico.
- Color litúrgico.
- Solemnidades.
- Fiestas.
- Memorias.
- Santos del día.
- Primera lectura.
- Salmo responsorial.
- Segunda lectura.
- Evangelio.
- Frase destacada.
- Reflexión.
- Lectio Divina.
- Pregunta para meditar.
- Oración.
- Compromiso.
- Recursos multimedia.

---

# 9.4 Arquitectura del Módulo

La arquitectura oficial será la siguiente.

```text
Panel Administrativo

        │

        ▼

Calendario Litúrgico

        │

        ▼

Tiempo Litúrgico

        │

        ▼

Lecturas del Día

        │

        ▼

API Liturgia

        │

        ▼

Pantalla Liturgia

        │

        ▼

Usuario
```

Todo el contenido deberá obtenerse desde la Base de Datos.

---

# 9.5 Arquitectura de Base de Datos

El módulo Liturgia utiliza un conjunto de tablas relacionadas que permiten administrar completamente el contenido diario.

Las tablas oficiales se documentan en el **Capítulo 3 – Diccionario Oficial de Base de Datos**.

Entre ellas se encuentran:

- lvj_liturgia
- lvj_tiempos_liturgicos
- lvj_temas_liturgicos
- lvj_santoral
- tablas auxiliares relacionadas

Cada tabla posee una responsabilidad específica.

No deberán duplicarse contenidos entre tablas.

---

# 9.6 Flujo Oficial

El flujo oficial del módulo será:

```text
Fecha actual

↓

Calendario Litúrgico

↓

Tiempo Litúrgico

↓

Lecturas

↓

Reflexión

↓

API

↓

Pantalla
```

La fecha determina automáticamente el contenido mostrado.

---

# 9.7 Calendario Litúrgico

El sistema deberá reconocer automáticamente:

- Adviento
- Navidad
- Cuaresma
- Semana Santa
- Pascua
- Tiempo Ordinario

Cada fecha pertenece únicamente a un tiempo litúrgico.

---

# 9.8 Contenido Diario

Cada día podrá contener:

- Celebración.
- Primera lectura.
- Salmo.
- Segunda lectura.
- Evangelio.
- Frase destacada.
- Reflexión.
- Pregunta para meditar.
- Oración final.
- Compromiso.
- Mensaje final.

Todos estos elementos deberán administrarse desde la Base de Datos.

---

# 9.9 Integración con Santoral

El módulo Liturgia se integra con el módulo Santoral.

Cada fecha podrá relacionarse con:

- Santo del día.
- Memoria.
- Fiesta.
- Solemnidad.

El Santoral mantiene su propia administración y no deberá duplicarse en las tablas de Liturgia.

---

# 9.10 Integración con la Biblia

Las citas bíblicas deberán almacenarse como referencias independientes.

Ejemplos:

- Génesis 1,1-5
- Salmo 22
- Mateo 5,1-12

El texto bíblico podrá obtenerse desde el módulo Biblia cuando exista integración completa.

De esta manera se evita almacenar repetidamente los mismos textos.

---

# 9.11 Lectio Divina

Cada día podrá disponer de una Lectio Divina completa.

La Lectio podrá incluir:

- Introducción.
- Lectura.
- Meditación.
- Oración.
- Contemplación.
- Acción.

Este contenido será administrado desde el Panel Administrativo.

---

# 9.12 Recursos Multimedia

Cada celebración podrá incorporar:

- Imagen principal.
- Imagen secundaria.
- Banner.
- Audio.
- Video.

Los archivos deberán almacenarse en el servidor.

La Base de Datos únicamente almacenará las rutas correspondientes.

---

# 9.13 Panel Administrativo

Desde el Panel Administrativo deberá ser posible:

- Crear celebraciones.
- Editar celebraciones.
- Publicar contenido.
- Programar fechas.
- Asociar tiempos litúrgicos.
- Asociar santos.
- Asociar recursos multimedia.

Todo el contenido deberá gestionarse desde esta interfaz.

---

# 9.14 Integraciones

El módulo Liturgia se integra con:

- Santoral.
- Biblia.
- Biblioteca.
- Radio.
- Podcast.
- Capilla Virtual.

Ejemplos:

- El Evangelio del día podrá enlazar con la Lectio Divina.
- El Rosario podrá mostrar el misterio correspondiente al tiempo litúrgico.
- La Radio podrá emitir automáticamente el Evangelio del día.

---

# 9.15 Seguridad

No deberán escribirse directamente en el código:

- Lecturas.
- Evangelios.
- Reflexiones.
- Fechas.
- Colores litúrgicos.

Todo deberá obtenerse desde la Base de Datos.

---

# 9.16 Buenas Prácticas

- Separar citas bíblicas del texto.
- Evitar duplicar contenidos.
- Mantener la independencia entre Liturgia y Santoral.
- Utilizar fechas como elemento principal de búsqueda.
- Centralizar toda la administración en el Panel Administrativo.

---

# 9.17 Reglas para Codex

Antes de modificar el módulo Liturgia deberá verificar:

1. Si la fecha ya posee contenido.
2. Si la celebración ya existe.
3. Si el tiempo litúrgico ya está definido.
4. Si la información pertenece realmente al módulo Liturgia o al módulo Santoral.
5. Si el cambio requiere actualizar AGENTS.md.

No está permitido:

- Duplicar textos bíblicos innecesariamente.
- Escribir lecturas directamente en el frontend.
- Duplicar información del Santoral.
- Crear nuevas tablas cuando una existente pueda ampliarse.

---

# 9.18 Estado Actual

Estado del módulo:

🟢 En desarrollo avanzado.

Implementado:

- Arquitectura general.
- Modelo de Base de Datos.
- Integración con el calendario.
- Administración del contenido diario.

Pendiente:

- Integración completa con el módulo Biblia.
- Lectio Divina automática.
- Recursos multimedia.
- Audio de las lecturas.
- Video del Evangelio.

---

# 9.19 Roadmap

El crecimiento previsto incluye:

- Calendario litúrgico perpetuo.
- Integración automática con el Santoral.
- Integración con la Biblia.
- Lectio Divina enriquecida.
- Comentarios patrísticos.
- Comentarios de los Padres de la Iglesia.
- Recursos audiovisuales.
- Audio del Evangelio.
- Sincronización con la programación de la Radio.

---

# 9.20 Regla Fundamental

El módulo Liturgia constituye la referencia oficial para el contenido litúrgico diario de la plataforma.

Toda celebración, lectura, reflexión, recurso multimedia y configuración deberá administrarse exclusivamente desde la Base de Datos y el Panel Administrativo.

La aplicación nunca deberá contener contenido litúrgico fijo escrito directamente en el código fuente.

El módulo deberá mantenerse fiel al calendario litúrgico de la Iglesia Católica y estar preparado para evolucionar sin alterar la arquitectura general del sistema.

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

**Versión:** 2.0

**Estado:** 🟢 Vigente

**Última actualización:** Julio de 2026

Este documento constituye la **especificación técnica oficial** del proyecto **La Voz de Jesús (LVJ)**.

La versión 2.0 establece la arquitectura base del sistema y define las normas, principios y lineamientos que deberán seguir todos los desarrollos futuros del proyecto.

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

**Fin del documento — AGENTS.md v2.0**
