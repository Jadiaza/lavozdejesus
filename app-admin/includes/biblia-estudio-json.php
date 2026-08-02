<?php
declare(strict_types=1);

/** @return array{schema_version:string,prompt_version:?string,nivel:string} */
function bib_study_validate_content(array $content, string $selectedLevel): array
{
    $levels = ['pastoral','teologico','doctrinal','formador'];
    if (!in_array($selectedLevel, $levels, true)) throw new RuntimeException('El nivel seleccionado no es válido.');

    $schema = trim((string)($content['schema_version'] ?? $content['schemaVersion'] ?? 'salmo8-1.0'));
    $contentLevel = trim((string)($content['nivel'] ?? $content['level'] ?? $selectedLevel));
    if (!in_array($contentLevel, $levels, true)) throw new RuntimeException('El nivel declarado dentro del JSON no es válido.');
    if ($contentLevel !== $selectedLevel) throw new RuntimeException('El nivel del JSON no coincide con el nivel seleccionado en el formulario.');

    foreach (['referencia','titulo','resumen','textos'] as $key) {
        if (!array_key_exists($key, $content)) throw new RuntimeException("El JSON no contiene {$key}.");
    }
    foreach (['referencia','titulo','resumen'] as $key) {
        if (!is_string($content[$key]) || trim($content[$key]) === '') throw new RuntimeException("{$key} debe contener texto.");
    }
    bib_study_validate_texts($content['textos']);

    if (str_starts_with($schema, '2.')) {
        bib_study_validate_doctrinal_v2($content, $contentLevel);
    } else {
        bib_study_validate_legacy($content);
    }

    return [
        'schema_version'=>$schema,
        'prompt_version'=>isset($content['prompt_version']) ? trim((string)$content['prompt_version']) : null,
        'nivel'=>$contentLevel,
    ];
}

function bib_study_validate_texts($texts): void
{
    if (!is_array($texts)) throw new RuntimeException('textos debe ser un objeto JSON.');
    foreach (['platense','torres_amat'] as $version) {
        if (!isset($texts[$version]) || !is_array($texts[$version])) throw new RuntimeException("Falta textos.{$version}.");
        if (!array_key_exists('disponible',$texts[$version]) || !is_bool($texts[$version]['disponible'])) throw new RuntimeException("textos.{$version}.disponible debe ser booleano.");
        if (!array_key_exists('texto',$texts[$version]) || !is_string($texts[$version]['texto'])) throw new RuntimeException("textos.{$version}.texto debe ser texto.");
    }
    if (isset($texts['scio'])) {
        if (!is_array($texts['scio'])) throw new RuntimeException('textos.scio debe ser un objeto JSON.');
        if (!array_key_exists('disponible',$texts['scio']) || !is_bool($texts['scio']['disponible'])) throw new RuntimeException('textos.scio.disponible debe ser booleano.');
        if (!array_key_exists('texto',$texts['scio']) || !is_string($texts['scio']['texto'])) throw new RuntimeException('textos.scio.texto debe ser texto.');
    }
    $unexpected=array_diff(array_keys($texts),['platense','torres_amat','scio']);
    if ($unexpected) throw new RuntimeException('Solo Platense/Straubinger, Torres Amat y Scío están habilitadas en textos.');
}

function bib_study_validate_doctrinal_v2(array $content, string $level): void
{
    if ($level !== 'doctrinal') throw new RuntimeException('El esquema doctrinal 2.0 solo puede guardarse con nivel doctrinal.');
    foreach (['referencia_normalizada','fundamentacion_straubinger','comprension_global','contexto_biblico','mensaje_teologico','mensaje_cristologico','referencias_cruzadas','doctrina_catolica','aplicacion_espiritual','preguntas_para_meditar','advertencias','metadata'] as $key) {
        if (!array_key_exists($key,$content)) throw new RuntimeException("El esquema doctrinal 2.0 no contiene {$key}.");
    }
    foreach (['referencia_normalizada','fundamentacion_straubinger','contexto_biblico','mensaje_teologico','mensaje_cristologico','doctrina_catolica','metadata'] as $key) {
        if (!is_array($content[$key])) throw new RuntimeException("{$key} debe ser un objeto JSON.");
    }
    foreach (['referencias_cruzadas','preguntas_para_meditar','advertencias'] as $key) {
        if (!is_array($content[$key])) throw new RuntimeException("{$key} debe ser una colección.");
    }
    foreach (['doctrina_central','catecismo','magisterio','padres_iglesia','moral_cristiana','errores_interpretacion'] as $key) {
        if (!array_key_exists($key,$content['doctrina_catolica'])) throw new RuntimeException("doctrina_catolica no contiene {$key}.");
    }
    $foundation=$content['fundamentacion_straubinger'];
    if (!isset($foundation['notas_utilizadas']) || !is_array($foundation['notas_utilizadas'])) throw new RuntimeException('fundamentacion_straubinger.notas_utilizadas debe ser una colección.');
    foreach ($foundation['notas_utilizadas'] as $note) {
        if (!is_array($note) || !isset($note['nota_id'])) throw new RuntimeException('Cada nota Straubinger utilizada debe conservar su nota_id real.');
    }
}

function bib_study_validate_legacy(array $content): void
{
    foreach (['comprension_global','mensaje_teologico','mensaje_cristologico','referencias_cruzadas','aplicacion_espiritual','preguntas_para_meditar','advertencias'] as $key) {
        if (!array_key_exists($key,$content)) throw new RuntimeException("El estudio anterior no contiene {$key}.");
    }
    foreach (['referencias_cruzadas','preguntas_para_meditar','advertencias'] as $key) {
        if (!is_array($content[$key])) throw new RuntimeException("{$key} debe ser una colección.");
    }
}
