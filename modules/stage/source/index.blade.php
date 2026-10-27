@php
  $theme = (($theme ?? 'dark') === 'light') ? 'light' : 'dark';
  $height = (($height ?? '100svh') === 'content') ? 'content' : '100svh';
  $contentWidth = (($contentWidth ?? '60') === '100') ? '100' : '60';
  $bgStack = $theme === 'light' ? 'with-bg bg-light-gradient' : 'with-bg bg-dark-gradient';
  $wrapperClasses = trim(sprintf(
      'dhsv-stage is-root-container is-theme-%s is-height-%s is-content-width-%s %s',
      $theme,
      $height === '100svh' ? '100svh' : 'content',
      $contentWidth,
      $bgStack
  ));
@endphp
<section {!! get_block_wrapper_attributes(['class' => $wrapperClasses], $block ?? null) !!}>
  @include('partials.blur-bubbles', ['class' => 'dhsv-stage__bubbles', 'theme' => $theme])
  <div class="dhsv-stage__inner alignwide">
    <div class="dhsv-stage__main">
      <div class="dhsv-stage__content">
        @include('partials.breadcrumb')
        {!! $content !!}
      </div>
      @if (!empty($image['url']))
        <div class="dhsv-stage__media">
          @if (!empty($image['id']))
            {!! wp_get_attachment_image(
                (int) $image['id'],
                'large',
                false,
                [
                    'class' => 'dhsv-stage__image dhsv-lcp-image',
                    'alt' => esc_attr($image['alt'] ?? ''),
                    'sizes' => '(max-width: 991.98px) 100vw, 42vw',
                    'fetchpriority' => 'high',
                    'loading' => 'eager',
                    'decoding' => 'async',
                ]
            ) !!}
          @else
            <img
              class="dhsv-stage__image dhsv-lcp-image"
              src="{{ esc_url($image['url']) }}"
              alt="{{ esc_attr($image['alt'] ?? '') }}"
              @if (!empty($image['width'])) width="{{ (int) $image['width'] }}" @endif
              @if (!empty($image['height'])) height="{{ (int) $image['height'] }}" @endif
              fetchpriority="high"
              loading="eager"
              decoding="async"
            >
          @endif
        </div>
      @endif
    </div>
    @if (!empty(trim($footer_content ?? '')))
      <div class="dhsv-stage__footer">
        {!! $footer_content !!}
      </div>
    @endif
  </div>
</section>
