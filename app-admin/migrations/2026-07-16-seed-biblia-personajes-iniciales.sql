-- Colección editorial inicial de Personajes Bíblicos.
-- Ejecutar después de 2026-07-16-add-biblia-personajes.sql.
-- La inserción es idempotente por nombre: no duplica personajes existentes no eliminados.

INSERT INTO lvj_bib_personajes
  (nombre, nombre_alternativo, testamento, categoria, resumen, pasajes_principales, ensenanza,
   imagen_url, fuente, fuente_url, licencia, orden, estado)
SELECT semilla.nombre, semilla.nombre_alternativo, semilla.testamento, semilla.categoria,
       semilla.resumen, semilla.pasajes_principales, semilla.ensenanza, semilla.imagen_url,
       semilla.fuente, semilla.fuente_url, semilla.licencia, semilla.orden, 1
FROM (
  SELECT
    'Adán' AS nombre,
    'El primer hombre' AS nombre_alternativo,
    'AT' AS testamento,
    'Patriarca' AS categoria,
    'Adán aparece en el Génesis como el primer hombre, creado por Dios a su imagen y semejanza y llamado a vivir en comunión con Él. Junto con Eva recibió el cuidado de la creación. Su desobediencia introdujo el pecado en la historia humana, pero también abrió el horizonte de la promesa de salvación.' AS resumen,
    'Génesis 1,26–31; Génesis 2,7–25; Génesis 3; Romanos 5,12–21; 1 Corintios 15,45–49' AS pasajes_principales,
    'Su historia recuerda la dignidad de toda persona creada por Dios, la gravedad del pecado y la necesidad de la gracia. El Nuevo Testamento presenta a Cristo como el nuevo Adán, principio de una humanidad reconciliada.' AS ensenanza,
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/ADAM_AND_EVE.jpg?width=1200' AS imagen_url,
    'Wikimedia Commons — Rembrandt van Rijn' AS fuente,
    'https://commons.wikimedia.org/wiki/File:ADAM_AND_EVE.jpg' AS fuente_url,
    'Dominio público' AS licencia,
    10 AS orden
  UNION ALL SELECT
    'Eva', 'Madre de todos los vivientes', 'AT', 'Mujer bíblica',
    'Eva es presentada en el Génesis como la primera mujer, creada con la misma dignidad que Adán y destinada a una relación de comunión. Participó en la desobediencia original y recibió el nombre de madre de todos los vivientes. La tradición cristiana contempla en María, por su obediencia, el contrapunto de la desobediencia de Eva.',
    'Génesis 2,18–25; Génesis 3; Génesis 4,1–2; 2 Corintios 11,3; 1 Timoteo 2,13–15',
    'Eva invita a contemplar la igual dignidad del hombre y la mujer, la responsabilidad de la libertad humana y la esperanza de restauración anunciada por Dios después de la caída.',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/ADAM_AND_EVE.jpg?width=1200',
    'Wikimedia Commons — Rembrandt van Rijn',
    'https://commons.wikimedia.org/wiki/File:ADAM_AND_EVE.jpg', 'Dominio público', 20
  UNION ALL SELECT
    'Noé', 'Noaj', 'AT', 'Patriarca',
    'Noé fue un hombre justo que confió en Dios en medio de una generación corrompida. Obedeció el mandato de construir el arca, atravesó el diluvio con su familia y recibió la alianza simbolizada por el arco iris, signo de la fidelidad de Dios hacia la creación.',
    'Génesis 6–9; Eclesiástico 44,17–18; Mateo 24,37–39; Hebreos 11,7; 1 Pedro 3,18–22',
    'Noé enseña una obediencia perseverante aun cuando la palabra de Dios parezca incomprensible. La alianza posterior al diluvio manifiesta la misericordia divina y el compromiso humano de custodiar la vida.',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Noahs_Ark.jpg?width=1200',
    'Wikimedia Commons — Edward Hicks',
    'https://commons.wikimedia.org/wiki/File:Noahs_Ark.jpg', 'Dominio público', 30
  UNION ALL SELECT
    'Abraham', 'Abrán; padre de una multitud', 'AT', 'Patriarca',
    'Abraham respondió a la llamada de Dios dejando su tierra y caminando hacia la promesa. Dios estableció con él una alianza y le prometió descendencia y bendición para todas las naciones. Su confianza fue probada especialmente en la espera de Isaac y en el monte Moria.',
    'Génesis 12–22; Eclesiástico 44,19–23; Romanos 4; Gálatas 3,6–18; Hebreos 11,8–19',
    'Abraham es modelo de fe porque se apoyó en la promesa antes de ver su cumplimiento. Su camino muestra que creer implica ponerse en marcha, aprender a esperar y confiar la propia vida a Dios.',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Sarah_Abraham.jpg?width=1000',
    'Wikimedia Commons — Providence Lithograph Company',
    'https://commons.wikimedia.org/wiki/File:Sarah_Abraham.jpg', 'Dominio público', 40
  UNION ALL SELECT
    'Sara', 'Saray; princesa', 'AT', 'Matriarca',
    'Sara fue esposa de Abraham y madre de Isaac. Compartió la peregrinación de la promesa y experimentó la dificultad de esperar cuando humanamente parecía imposible tener un hijo. Dios transformó su risa incrédula en alegría al cumplir su palabra.',
    'Génesis 11,29–30; Génesis 12; Génesis 16–18; Génesis 21,1–7; Hebreos 11,11–12; 1 Pedro 3,5–6',
    'Sara recuerda que la promesa de Dios no depende únicamente de las posibilidades humanas. Su vida invita a pasar de la impaciencia a una esperanza capaz de recibir el don con gratitud.',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Sarah_Abraham.jpg?width=1000',
    'Wikimedia Commons — Providence Lithograph Company',
    'https://commons.wikimedia.org/wiki/File:Sarah_Abraham.jpg', 'Dominio público', 50
  UNION ALL SELECT
    'José', 'José, hijo de Jacob', 'AT', 'Patriarca',
    'José, hijo de Jacob y Raquel, fue vendido por sus hermanos y llevado a Egipto. Después de sufrir esclavitud y prisión, interpretó los sueños del faraón y recibió autoridad para preparar al país ante el hambre. Más tarde perdonó a sus hermanos y reconoció que Dios había convertido el mal en instrumento de vida.',
    'Génesis 30,22–24; Génesis 37–50; Salmo 105,16–22; Hechos 7,9–16; Hebreos 11,22',
    'José enseña castidad, integridad, paciencia y perdón. Su historia muestra que la providencia puede obrar incluso dentro de situaciones injustas sin justificar el mal realizado por las personas.',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Joseph_arrives_in_Egypt.JPG?width=1200',
    'Wikimedia Commons — Owen Jones',
    'https://commons.wikimedia.org/wiki/File:Joseph_arrives_in_Egypt.JPG', 'Dominio público', 60
  UNION ALL SELECT
    'Moisés', 'Liberador y mediador de la alianza', 'AT', 'Profeta',
    'Moisés fue llamado por Dios desde la zarza ardiente para liberar a Israel de la esclavitud en Egipto. Condujo al pueblo a través del mar, recibió la Ley en el Sinaí e intercedió repetidamente por la comunidad durante la marcha por el desierto.',
    'Éxodo 2–34; Números 12; Deuteronomio 5–6; Deuteronomio 34; Mateo 17,1–8; Hebreos 11,23–29',
    'Moisés muestra que la vocación nace de la iniciativa de Dios y se sostiene mediante una relación profunda con Él. Su intercesión y servicio preparan la comprensión de Cristo como mediador de la nueva alianza.',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Moses_Michelangelo_2014_02.jpg?width=1000',
    'Wikimedia Commons — Perituss; escultura de Miguel Ángel',
    'https://commons.wikimedia.org/wiki/File:Moses_Michelangelo_2014_02.jpg', 'CC0 1.0', 70
  UNION ALL SELECT
    'David', 'Rey de Israel y salmista', 'AT', 'Rey',
    'David fue pastor, vencedor de Goliat y rey de Israel. Recibió la promesa de una dinastía duradera y ocupó un lugar central en la esperanza mesiánica. También cometió pecados graves, pero reconoció su culpa y buscó la misericordia de Dios.',
    '1 Samuel 16–31; 2 Samuel 1–24; 1 Crónicas 11–29; Salmo 51; Mateo 1,1; Hechos 13,22–23',
    'David enseña que la elección divina no elimina la fragilidad humana. Su arrepentimiento muestra el camino de volver a Dios con un corazón contrito, mientras la promesa davídica conduce hacia Jesucristo.',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Rembrandt_-_King_David.jpg?width=1000',
    'Wikimedia Commons — Rembrandt van Rijn',
    'https://commons.wikimedia.org/wiki/File:Rembrandt_-_King_David.jpg', 'Dominio público', 80
  UNION ALL SELECT
    'Elías', 'El profeta del Carmelo', 'AT', 'Profeta',
    'Elías defendió la fidelidad al Señor durante el reinado de Ajab y Jezabel. En el monte Carmelo confrontó el culto a Baal, huyó al desierto y encontró a Dios no en la violencia de los fenómenos, sino en el susurro de una brisa suave. Fue arrebatado en un carro de fuego.',
    '1 Reyes 17–19; 1 Reyes 21; 2 Reyes 1–2; Eclesiástico 48,1–11; Mateo 17,1–13; Santiago 5,17–18',
    'Elías invita a una fe valiente, a defender la alianza y a reconocer que Dios también se manifiesta en el silencio. Su cansancio muestra que incluso los servidores fieles necesitan descanso, alimento y consuelo.',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Berendt_Elijah.jpg?width=1200',
    'Wikimedia Commons — Moritz Berendt',
    'https://commons.wikimedia.org/wiki/File:Berendt_Elijah.jpg', 'Dominio público', 90
  UNION ALL SELECT
    'Jesucristo', 'Jesús de Nazaret; el Mesías y el Hijo de Dios', 'NT', 'Mesías',
    'Jesucristo es el centro de la Sagrada Escritura y de la fe cristiana. Verdadero Dios y verdadero hombre, anunció el Reino, llamó a la conversión, sanó, perdonó y reveló el amor del Padre. Entregó libremente su vida en la cruz, resucitó y envió a sus discípulos a anunciar el Evangelio.',
    'Mateo 1–28; Marcos 1–16; Lucas 1–24; Juan 1–21; Filipenses 2,5–11; Colosenses 1,15–20; Hebreos 1',
    'En Jesús se cumple la historia de la salvación. Conocerlo, seguirlo y permanecer en su amor es el corazón de la vida cristiana; su muerte y resurrección abren a la humanidad la comunión con Dios.',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Christ_Icon_Sinai_6th_century_-_crop.jpg?width=1000',
    'Wikimedia Commons — icono del monasterio de Santa Catalina del Sinaí',
    'https://commons.wikimedia.org/wiki/File:Christ_Icon_Sinai_6th_century_-_crop.jpg', 'Dominio público', 100
  UNION ALL SELECT
    'María', 'Virgen María; Madre de Jesús', 'NT', 'Mujer bíblica',
    'María de Nazaret recibió el anuncio del ángel y respondió libremente con fe. Concibió por obra del Espíritu Santo, acompañó a Jesús desde su nacimiento y permaneció junto a la cruz. Reunida con los discípulos, perseveró en oración a la espera de Pentecostés.',
    'Mateo 1–2; Lucas 1–2; Juan 2,1–12; Juan 19,25–27; Hechos 1,12–14; Gálatas 4,4–7',
    'María es modelo de escucha, disponibilidad, humildad y perseverancia. Su respuesta enseña a acoger la palabra de Dios, custodiarla en el corazón y orientar siempre a los demás hacia Cristo.',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Virgin_Mary_by_Borovikovsky.jpg?width=1000',
    'Wikimedia Commons — Vladímir Borovikovski',
    'https://commons.wikimedia.org/wiki/File:Virgin_Mary_by_Borovikovsky.jpg', 'Dominio público', 110
  UNION ALL SELECT
    'José de Nazaret', 'San José; esposo de María', 'NT', 'Otro',
    'José fue el esposo de María y padre legal de Jesús. Hombre justo y atento a la voz de Dios, acogió a María, dio nombre al niño, protegió a la familia durante la huida a Egipto y trabajó para sostener el hogar de Nazaret.',
    'Mateo 1,18–25; Mateo 2,13–23; Lucas 1,26–27; Lucas 2,1–52; Mateo 13,55',
    'José enseña una obediencia silenciosa, concreta y valiente. Su paternidad muestra que cuidar, proteger y trabajar fielmente también forman parte esencial de la misión recibida de Dios.',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/St._Joseph_and_Child_Jesus.jpg?width=1000',
    'Wikimedia Commons — Giambattista Pittoni',
    'https://commons.wikimedia.org/wiki/File:St._Joseph_and_Child_Jesus.jpg', 'Dominio público', 120
  UNION ALL SELECT
    'Juan el Bautista', 'El precursor', 'NT', 'Profeta',
    'Juan el Bautista fue enviado para preparar el camino del Señor. Predicó la conversión, bautizó en el Jordán y señaló a Jesús como el Cordero de Dios. Dio testimonio de la verdad ante Herodes y murió mártir.',
    'Mateo 3; Mateo 11,2–19; Mateo 14,1–12; Marcos 1,1–11; Lucas 1; Juan 1,19–36; Juan 3,22–30',
    'Juan enseña humildad, valentía y coherencia. Su misión no consiste en atraer la atención hacia sí mismo, sino en preparar a otros para encontrarse con Cristo: “Él debe crecer y yo disminuir”.',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Titian-John_the_Baptist.jpg?width=1000',
    'Wikimedia Commons — Tiziano',
    'https://commons.wikimedia.org/wiki/File:Titian-John_the_Baptist.jpg', 'Dominio público', 130
  UNION ALL SELECT
    'Pedro', 'Simón Pedro; Cefas', 'NT', 'Apóstol',
    'Pedro fue pescador de Galilea y uno de los primeros llamados por Jesús. Confesó que Jesús es el Mesías, presenció momentos centrales de su ministerio y, después de negarlo durante la pasión, recibió el perdón y la misión de confirmar y apacentar a los discípulos.',
    'Mateo 4,18–20; Mateo 16,13–20; Mateo 26,69–75; Lucas 22,31–34; Juan 21,15–19; Hechos 1–12; 1 Pedro 1–5',
    'Pedro muestra que el discipulado no se apoya en la autosuficiencia, sino en la gracia que perdona y transforma. Su vida une fragilidad, arrepentimiento, misión y servicio a la unidad de la Iglesia.',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Saint_Peter_A26043.jpg?width=1000',
    'Wikimedia Commons — taller de Peter Paul Rubens',
    'https://commons.wikimedia.org/wiki/File:Saint_Peter_A26043.jpg', 'Dominio público', 140
  UNION ALL SELECT
    'Pablo', 'Saulo de Tarso; apóstol de los gentiles', 'NT', 'Apóstol',
    'Pablo persiguió inicialmente a la Iglesia, pero el encuentro con Cristo resucitado transformó radicalmente su vida. Anunció el Evangelio en numerosas ciudades, fundó comunidades y escribió cartas que ocupan un lugar fundamental en el Nuevo Testamento.',
    'Hechos 7,58–8,3; Hechos 9; Hechos 13–28; Romanos 1–16; 1 Corintios 1–16; Gálatas 1–6; Filipenses 1–4',
    'Pablo testimonia que ninguna historia está fuera del alcance de la gracia. Su entrega misionera enseña a poner los dones personales al servicio del Evangelio y a vivir en Cristo como una criatura nueva.',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Saint_Paul%2C_by_Peter_Paul_Rubens_%28Museo_del_Prado%29.jpg?width=1000',
    'Wikimedia Commons — Peter Paul Rubens; Museo del Prado',
    'https://commons.wikimedia.org/wiki/File:Saint_Paul%2C_by_Peter_Paul_Rubens_%28Museo_del_Prado%29.jpg', 'Dominio público', 150
  UNION ALL SELECT
    'María Magdalena', 'Apóstol de los apóstoles', 'NT', 'Discípulo',
    'María Magdalena fue discípula de Jesús, quien la liberó de siete demonios. Lo acompañó y colaboró con sus bienes, permaneció cerca durante la crucifixión y fue testigo del sepulcro vacío. El Resucitado se manifestó a ella y la envió a anunciar la noticia a los discípulos.',
    'Lucas 8,1–3; Mateo 27,55–61; Marcos 16,1–11; Lucas 24,1–12; Juan 19,25; Juan 20,1–18',
    'María Magdalena enseña fidelidad, gratitud y amor perseverante. Su encuentro con el Resucitado muestra que la experiencia pascual se convierte necesariamente en anuncio y testimonio.',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Pietro_Perugino_-_Maria_Magdalena.jpg?width=1000',
    'Wikimedia Commons — Pietro Perugino',
    'https://commons.wikimedia.org/wiki/File:Pietro_Perugino_-_Maria_Magdalena.jpg', 'Dominio público', 160
) AS semilla
LEFT JOIN lvj_bib_personajes existente
  ON existente.nombre = semilla.nombre AND existente.deleted_at IS NULL
WHERE existente.id IS NULL;
