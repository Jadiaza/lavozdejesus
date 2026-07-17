<?php
declare(strict_types=1);

interface BibleStudyAiProviderInterface
{
  /** @return array{study: array, input_tokens: ?int, output_tokens: ?int, model: string} */
  public function generateStudy(array $context): array;
}
