-- Subcategorías pastorales de Oraciones del cristiano.
ALTER TABLE lvj_ora_oraciones
  ADD COLUMN IF NOT EXISTS subcategoria VARCHAR(100) NULL AFTER categoria;

UPDATE lvj_ora_oraciones SET subcategoria='Oraciones fundamentales'
WHERE titulo IN ('Señal de la Cruz','Gloria al Padre','Yo confieso','Señor, ten piedad','Gloria a Dios en el cielo','Credo niceno-constantinopolitano','Credo de los Apóstoles','Santo','Padre nuestro','Acto de contrición');

UPDATE lvj_ora_oraciones SET subcategoria='Mañana y ofrecimiento'
WHERE titulo IN ('Ofrecimiento del día','Oración antes de la meditación');

UPDATE lvj_ora_oraciones SET subcategoria='Noche y descanso'
WHERE titulo IN ('Himno antes de terminar el día','Invocación para la noche','Oración para el examen de conciencia');

UPDATE lvj_ora_oraciones SET subcategoria='Fe, confianza y discernimiento'
WHERE titulo='Oración de abandono';

UPDATE lvj_ora_oraciones SET subcategoria='Intercesión'
WHERE titulo IN ('Oración por los sacerdotes','Letanía por los sacerdotes');

UPDATE lvj_ora_oraciones SET subcategoria='Momentos y necesidades'
WHERE titulo IN ('Acción de gracias','Oración para los viajes');

CREATE INDEX IF NOT EXISTS idx_ora_oraciones_subcategoria ON lvj_ora_oraciones (subcategoria);

-- Primera clasificación disponible para Sanación y protección.
UPDATE lvj_ora_oraciones SET subcategoria='Protección personal y familiar'
WHERE titulo IN ('Oración para proteger la habitación','Oración para los viajes');

-- Las oraciones asociadas a una colección devocional se muestran en Devociones.
UPDATE lvj_ora_oraciones SET categoria='Devociones'
WHERE devocion_id IS NOT NULL;
