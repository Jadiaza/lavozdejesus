-- Biblia Scío de San Miguel: actualización editorial de Génesis 3:1-24.
-- Alcance exclusivo: versión SCIO, libro GEN, capítulo 3.
-- Compatible con MySQL 8.x y MariaDB 10.6.
-- Revisar el SELECT final antes de utilizar este archivo en producción.

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

DROP TEMPORARY TABLE IF EXISTS tmp_scio_gen_3;
CREATE TEMPORARY TABLE tmp_scio_gen_3 (
  versiculo INT UNSIGNED NOT NULL PRIMARY KEY,
  texto LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB;

INSERT INTO tmp_scio_gen_3 (versiculo, texto) VALUES
(1, 'Pero la serpiente era mas astuta que todos los animales de la tierra que habia hecho el Señor Dios. La qual dixo á la muger: ¿Por qué os mandó Dios, que no comieseis de todo árbol del Paraíso?'),
(2, 'A la qual respondió la muger: De la fruta de los árboles, que hay en el Paraíso, comemos:'),
(3, 'Mas de la fruta del árbol, que está en medio del Paraíso, nos mandó Dios que no comiéramos, y que no lo tocáramos, porque no muramos.'),
(4, 'Y dixo la serpiente á la muger: De ninguna manera morir moriréis.'),
(5, 'Porque sabe Dios, que en qualquier dia que comiereis de él, serán abiertos vuestros ojos: y seréis como dioses, sabiendo el bien y el mal.'),
(6, 'Vió pues la muger, que el árbol era bueno para comer, y hermoso á los ojos, y agradable á la vista: y tomó de su fruto, y comió: y dió á su marido, el qual comió.'),
(7, 'Y fuéron abiertos los ojos de entrambos: y habiendo ellos echado de ver que estaban desnudos, cosiéron unas hojas de higuera, y se hiciéron delantales.'),
(8, 'Y habiendo oido la voz del Señor Dios que se paseaba en el Paraíso al ayre despues del mediodia, escondióse Adam y su muger de la presencia del Señor Dios en medio del árbol del Paraíso.'),
(9, 'Y llamó el Señor Dios á Adam, y díxole: ¿En dónde estás?'),
(10, 'El respondió: Oí tu voz en el Paraíso: y tuve temor, porque estaba desnudo, y escondíme.'),
(11, 'Y díxole: ¿Y quién te ha dicho que estabas desnudo, sino el haber comido del árbol, de que te mandé, que no comieras?'),
(12, 'Y dixo Adam: La muger, que me diste por compañera, me dió del árbol, y comí.'),
(13, 'Y dixo el Señor Dios á la muger: ¿Por qué has hecho esto? Ella respondió: La serpiente me engañó, y comí.'),
(14, 'Y dixo el Señor Dios á la serpiente: Por quanto has hecho esto, maldita eres entre todos los animales, y bestias de la tierra: sobre tu pecho andarás, y tierra comerás todos los dias de tu vida.'),
(15, 'Enemistades pondré entre tí y la muger, y entre tu linage y su linage: ella quebrantará tu cabeza, y tú pondrás asechanzas á su calcañar.'),
(16, 'Dixo asimismo á la muger: Multiplicaré tus dolores, y tus preñeces: con dolor parirás los hijos, y estarás baxo la potestad de tu marido, y él tendrá dominio sobre tí.'),
(17, 'Y á Adam dixo: Por quanto oiste la voz de tu muger, y comiste del árbol, de que te habia mandado, que no comieras, maldita será la tierra en tu obra: con afanes comerás de ella todos los dias de tu vida.'),
(18, 'Espinas y abrojos te producirá, y comerás la yerba de la tierra.'),
(19, 'Con el sudor de tu rostro comerás el pan, hasta que vuelvas á la tierra, de la que fuiste tomado: porque polvo eres, y en polvo te convertirás.'),
(20, 'Y llamó Adam el nombre de su muger, Eva: por quanto era madre de todos los vivientes.'),
(21, 'Hizo tambien el Señor Dios á Adam y á su muger unas túnicas de pieles, y vistiólos:'),
(22, 'Y dixo: He aquí Adam, como se ha hecho uno de nos, sabiendo el bien y el mal: ahora pues, porque no alargue quizá su mano, y tome tambien del árbol de la vida, y coma, y viva para siempre.'),
(23, 'Y echóle el Señor Dios del Paraíso del deleyte, para que labrase la tierra, de la que fué tomado.'),
(24, 'Y echó fuera á Adam, y delante del Paraíso puso Cherubines, y espada que arrojaba llamas, y andaba al rededor para guardar el camino del árbol de la vida.');

DELIMITER $$

DROP PROCEDURE IF EXISTS lvj_update_scio_genesis_3$$
CREATE PROCEDURE lvj_update_scio_genesis_3()
BEGIN
  DECLARE v_version_id BIGINT UNSIGNED DEFAULT NULL;
  DECLARE v_book_id BIGINT UNSIGNED DEFAULT NULL;
  DECLARE v_expected_count INT DEFAULT 0;
  DECLARE v_database_count INT DEFAULT 0;

  SELECT id INTO v_version_id
  FROM lvj_bib_versiones
  WHERE UPPER(codigo) = 'SCIO' AND deleted_at IS NULL
  LIMIT 1;

  IF v_version_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No existe la versión SCIO activa o en revisión.';
  END IF;

  SELECT id INTO v_book_id
  FROM lvj_bib_libros
  WHERE version_id = v_version_id
    AND UPPER(codigo) = 'GEN'
    AND deleted_at IS NULL
  LIMIT 1;

  IF v_book_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No existe el libro GEN para la versión SCIO.';
  END IF;

  SELECT COUNT(*) INTO v_expected_count FROM tmp_scio_gen_3;
  IF v_expected_count <> 24 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El lote temporal no contiene exactamente 24 versículos.';
  END IF;

  SELECT COUNT(*) INTO v_database_count
  FROM lvj_bib_versiculos
  WHERE version_id = v_version_id
    AND libro_id = v_book_id
    AND capitulo = 3
    AND versiculo BETWEEN 1 AND 24
    AND deleted_at IS NULL;

  IF v_database_count <> 24 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'SCIO Génesis 3 no contiene exactamente los versículos 1-24 esperados.';
  END IF;

  START TRANSACTION;

  UPDATE lvj_bib_versiculos AS destino
  INNER JOIN tmp_scio_gen_3 AS origen
    ON origen.versiculo = destino.versiculo
  SET destino.texto = origen.texto,
      destino.updated_at = CURRENT_TIMESTAMP
  WHERE destino.version_id = v_version_id
    AND destino.libro_id = v_book_id
    AND destino.capitulo = 3
    AND destino.deleted_at IS NULL;

  COMMIT;
END$$

CALL lvj_update_scio_genesis_3()$$
DROP PROCEDURE lvj_update_scio_genesis_3$$

DELIMITER ;

-- Verificación posterior: debe devolver 24 filas, ordenadas del 1 al 24.
SELECT v.capitulo, v.versiculo, v.texto
FROM lvj_bib_versiculos AS v
INNER JOIN lvj_bib_versiones AS version
  ON version.id = v.version_id
 AND UPPER(version.codigo) = 'SCIO'
 AND version.deleted_at IS NULL
INNER JOIN lvj_bib_libros AS libro
  ON libro.id = v.libro_id
 AND libro.version_id = version.id
 AND UPPER(libro.codigo) = 'GEN'
 AND libro.deleted_at IS NULL
WHERE v.capitulo = 3
  AND v.versiculo BETWEEN 1 AND 24
  AND v.deleted_at IS NULL
ORDER BY v.versiculo;

DROP TEMPORARY TABLE IF EXISTS tmp_scio_gen_3;
