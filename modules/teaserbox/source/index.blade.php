@php
  $imageId = (int) ($image['id'] ?? 0);
  $href = isset($link['url']) ? (string) $link['url'] : '';
  $permalink = $href !== '' ? $href : '#';
@endphp

<div {!! get_block_wrapper_attributes() !!}>
  @include('partials.archive-showcase-card', [
    'manualCard' => true,
    'titleLevel' => $titleLevel ?? 'h3',
    'cardSize' => $cardSize ?? 'medium',
    'title' => $title ?? '',
    'subtitle' => $subtitle ?? '',
    'eyebrow' => $eyebrow ?? '',
    'meta' => $meta ?? '',
    'permalink' => $permalink,
    'imageId' => $imageId,
    'enableTilt' => true,
    'enableTransition' => false,
    'enableViewTransition' => false,
    'transitionPrefix' => 'teaserbox',
  ])
</div>
