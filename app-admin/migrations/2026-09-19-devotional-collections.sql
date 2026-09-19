-- Colecciones devocionales de LVJPRAYER.
-- Conserva la tabla existente y enlaza únicamente las oraciones relacionadas.

ALTER TABLE lvj_ora_devociones
  ADD COLUMN IF NOT EXISTS slug VARCHAR(100) NULL AFTER id,
  ADD COLUMN IF NOT EXISTS subtitulo VARCHAR(255) NULL AFTER titulo,
  ADD COLUMN IF NOT EXISTS orden INT NOT NULL DEFAULT 0 AFTER categoria;

CREATE UNIQUE INDEX IF NOT EXISTS uq_ora_devociones_slug ON lvj_ora_devociones (slug);

INSERT INTO lvj_ora_devociones (slug, titulo, subtitulo, descripcion, categoria, orden, estado)
VALUES
('san-jose','San José','Custodio de Jesús y protector de las familias','Rosarios, letanías, novenas y oraciones a san José.','Santos',1,'activo'),
('sangre-de-cristo','Sangre de Cristo','Redención, entrega y protección en Cristo','Oraciones centradas en la Preciosísima Sangre de Jesucristo.','Jesucristo',2,'activo'),
('san-miguel-arcangel','San Miguel Arcángel','Fidelidad a Dios y protección espiritual','Coronilla, letanías, consagraciones y oraciones a san Miguel.','Ángeles',3,'activo'),
('maria-santisima','María Santísima','Madre de Jesús y Madre de la Iglesia','Rosario, letanías, consagraciones y oraciones marianas.','Virgen María',4,'activo'),
('espiritu-santo','Espíritu Santo','Luz, consuelo y renovación interior','Novena, consagración y oraciones al Espíritu Santo.','Santísima Trinidad',5,'activo'),
('sagrado-corazon-de-jesus','Sagrado Corazón de Jesús','Amor, reparación y consagración','Letanías, novena y consagraciones al Corazón de Jesús.','Jesucristo',6,'activo'),
('santisimo-sacramento','Santísimo Sacramento','Adoración y encuentro con Jesús Eucaristía','Adoración, visitas y oraciones a Jesús Sacramentado.','Jesucristo',7,'activo'),
('divina-misericordia','Divina Misericordia','Confianza en el amor misericordioso de Jesús','Coronilla, novena y oraciones a la Divina Misericordia.','Jesucristo',8,'activo')
ON DUPLICATE KEY UPDATE titulo=VALUES(titulo), subtitulo=VALUES(subtitulo), descripcion=VALUES(descripcion), categoria=VALUES(categoria), orden=VALUES(orden), estado=VALUES(estado);

UPDATE lvj_ora_oraciones o JOIN lvj_ora_devociones d ON d.slug='san-jose' SET o.devocion_id=d.id, o.tipo='devocion' WHERE o.titulo IN ('Oración a san José','Letanías de san José');
UPDATE lvj_ora_oraciones o JOIN lvj_ora_devociones d ON d.slug='maria-santisima' SET o.devocion_id=d.id, o.tipo='devocion' WHERE o.titulo IN ('Consagración cotidiana a la Virgen María','Tres Ave Marías para la noche','Ángelus','Reina del Cielo','Letanías de la Santísima Virgen','Salve','Oración de los misterios del Rosario');
UPDATE lvj_ora_oraciones o JOIN lvj_ora_devociones d ON d.slug='espiritu-santo' SET o.devocion_id=d.id, o.tipo='devocion' WHERE o.titulo='Ven, Espíritu Santo';
UPDATE lvj_ora_oraciones o JOIN lvj_ora_devociones d ON d.slug='sagrado-corazon-de-jesus' SET o.devocion_id=d.id, o.tipo='devocion' WHERE o.titulo='Jesús, manso y humilde de corazón';
UPDATE lvj_ora_oraciones o JOIN lvj_ora_devociones d ON d.slug='santisimo-sacramento' SET o.devocion_id=d.id, o.tipo='devocion' WHERE o.titulo IN ('Alma de Cristo','Me haces falta Tú','Como un pobre ante quien lo tiene todo','Señor, no soy digno','El gozo de estar junto a Ti','Adoremos reverentes','Divinas alabanzas');
UPDATE lvj_ora_oraciones o JOIN lvj_ora_devociones d ON d.slug='sangre-de-cristo' SET o.devocion_id=d.id, o.tipo='devocion' WHERE o.titulo IN ('Oración a Jesús crucificado','Oración al Señor crucificado');
