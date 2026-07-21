<?php
/**
 * Copia este archivo como config.local.php en el hosting.
 * No subas config.local.php al repositorio.
 */

return [
  'db_host' => 'localhost',
  'db_name' => 'lavozdej_Radio',
  'db_user' => 'lavozdej_lvjapp',
  'db_pass' => 'CAMBIA_ESTA_CLAVE',
  'supabase_url' => '',
  'supabase_anon_key' => '',
  'auth_allowed_email_domains' => 'gmail.com,googlemail.com,hotmail.com,hotmail.es,outlook.com,outlook.es,live.com,live.com.co,msn.com,yahoo.com,yahoo.es,icloud.com,me.com,proton.me,protonmail.com,aol.com',
  'bible_ai_provider' => 'openai',
  'bible_ai_model' => 'gpt-5.4-mini',
  'bible_ai_api_key' => '',
  'bible_ai_timeout' => 90,
  'bible_ai_max_tokens' => 8000,
  'bible_ai_free_requests_per_month' => 3,
  'bible_ai_unlimited_emails' => 'lavozdejesusco@gmail.com,lavozdejesus.co@gmail.com',
  'bible_version_platense' => 'SPAPLATENSE',
  'bible_version_torres_amat' => 'TORRESAMAT',
];

/*
Variables de entorno requeridas para Estudio Bíblico con IA:
SUPABASE_URL, SUPABASE_ANON_KEY, AUTH_ALLOWED_EMAIL_DOMAINS,
BIBLE_AI_PROVIDER (openai|gemini), BIBLE_AI_MODEL, BIBLE_AI_API_KEY,
BIBLE_AI_TIMEOUT, BIBLE_AI_MAX_TOKENS, BIBLE_AI_FREE_REQUESTS_PER_MONTH,
BIBLE_AI_UNLIMITED_EMAILS,
BIBLE_VERSION_PLATENSE, BIBLE_VERSION_TORRES_AMAT.
Nunca almacenes claves reales en este archivo de ejemplo.
*/
