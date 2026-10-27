@php
  $layers = $layers ?? [];
  $default_index = $defaultIndex ?? 0;
  $align = $align ?? '';
@endphp
<div class="wp-block-dhsv-image-stack-animation dhsv-image-stack-animation-block align{{ $align }}" data-image-stack-animation>
  <div class="dhsv-image-stack-animation__stage" role="presentation">
    @foreach ($layers as $i => $layer)
      <div
        class="dhsv-image-stack-animation__layer"
        data-layer
        style="
          --top: {{ $layer['top'] ?? 50 }}%;
          --left: {{ $layer['left'] ?? 50 }}%;
          --width: {{ $layer['width'] ?? 20 }}%;
          --height: {{ $layer['height'] ?? 20 }}%;
          --layer-index: {{ $i }};
          --transition-delay: {{ $i * 0.1 }}s;
        "
        data-default="{{ $i === (int) $default_index ? '1' : '0' }}"
      >
        @if (!empty($layer['url']))
          <img src="{{ esc_url($layer['url']) }}" alt="{{ esc_attr($layer['alt'] ?? '') }}" loading="lazy" />
        @endif
      </div>
    @endforeach
  </div>
</div>
