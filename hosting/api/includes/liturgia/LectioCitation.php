<?php

declare(strict_types=1);

final class LectioCitation
{
  /**
   * Devuelve una clave estable para las citas de los cuatro Evangelios.
   * Ejemplo: "Mt 8, 28-34" => "mt:8,28-34".
   */
  public static function key(string $citation): string
  {
    $value = self::plain($citation);
    if ($value === '') {
      return '';
    }

    $value = mb_strtolower($value, 'UTF-8');
    $value = strtr($value, [
      'á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u', 'ü' => 'u',
      '–' => '-', '—' => '-', '−' => '-',
    ]);
    $value = preg_replace('/\b(del\s+santo\s+evangelio\s+segun\s+san|lectura\s+del\s+santo\s+evangelio\s+segun\s+san)\b/u', '', $value) ?? $value;
    $value = trim($value, " \t\n\r\0\x0B.:;");

    $aliases = [
      'mt' => ['mateo', 'mt'],
      'mc' => ['marcos', 'mc'],
      'lc' => ['lucas', 'lc'],
      'jn' => ['juan', 'jn'],
    ];

    foreach ($aliases as $code => $names) {
      foreach ($names as $name) {
        if (preg_match('/\b' . preg_quote($name, '/') . '\b\s*(.+)$/u', $value, $matches) === 1) {
          $range = self::normalizeRange((string) $matches[1]);
          return $range !== '' ? $code . ':' . $range : '';
        }
      }
    }

    return '';
  }

  public static function clean(string $citation): string
  {
    return self::plain($citation);
  }

  private static function normalizeRange(string $range): string
  {
    $range = strtr($range, ['–' => '-', '—' => '-', '−' => '-']);
    $range = preg_replace('/\s+/u', '', $range) ?? $range;
    $range = preg_replace('/[^0-9,;\.\-]/u', '', $range) ?? '';
    $range = trim($range, '.;');

    return preg_match('/\d/u', $range) === 1 ? $range : '';
  }

  private static function plain(string $value): string
  {
    $value = html_entity_decode($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $value = strip_tags($value);
    $value = str_replace("\u{00A0}", ' ', $value);
    $value = preg_replace('/\s+/u', ' ', $value) ?? $value;

    return trim($value);
  }
}
