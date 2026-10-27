<a
    href="{{ $link['url'] }}"
    class="dhsv-button {{ $type }} {{ $iconBefore ? 'icon-before' : '' }} {{ $fullWidth ? 'full-width' : '' }} {{ $link['class'] ?? '' }} {{ $className ?? '' }}"
    {!! $link['linkTarget'] ? 'target="' . esc_attr($link['linkTarget']) . '"' : '' !!}
    {!! $link['rel'] ? 'rel="' . esc_attr($link['rel']) . '"' : '' !!}
>
  <span class="text">{{$title}}</span>
  <span class="icon">
    @svg($icon)
  </span>
</a>
