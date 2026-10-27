<div class="dhsv-cases-stage-block-wrapper align{{ $align }} is-root-container">
   <div class="dhsv-cases-stage-block alignwide">
      <div class="dhsv-cases-stage-block__inner">
         @foreach($cases as $loopIndex => $case)
            <div
            class="case {{ $loopIndex == 0 ? 'is-active' : '' }}"
            style="--index: {{ $loopIndex }};--transition-delay: {{ $loopIndex * 0.05 }}s;"
            >
               <div class="case__image">
                  {{-- First case: loading=eager so it's not lazy-loaded, and we
                       explicitly set fetchpriority=auto so WP core's auto-attribute logic
                       (which would otherwise claim "first eager image" → fetchpriority=high
                       for the LCP slot) stays out of the way. The cases-stage block is
                       only the desktop LCP; on mobile the LCP is a different image
                       elsewhere on the page, and we want WP to be free to apply
                       fetchpriority=high to *that* image instead. Desktop preload is
                       handled by app/customizations/preload.php (media-gated to
                       min-width: 768px). --}}
                  @if (!empty($case['thumbnail_id']))
                     {!! wp_get_attachment_image(
                        (int) $case['thumbnail_id'],
                        'large',
                        false,
                        $loopIndex === 0
                           ? ['class' => 'dhsv-lcp-image', 'fetchpriority' => 'auto', 'loading' => 'eager', 'decoding' => 'async', 'alt' => esc_attr($case['title'])]
                           : ['loading' => 'lazy', 'decoding' => 'async', 'alt' => esc_attr($case['title'])]
                     ) !!}
                  @else
                     <img src="{{ $case['image'] }}" alt="{{ $case['title'] }}" {!! $loopIndex === 0 ? 'class="dhsv-lcp-image" fetchpriority="auto" loading="eager"' : 'loading="lazy"' !!} decoding="async">
                  @endif
               </div>
               <div class="case__hover-zone">
                  <div class="case__cta">
                     <a href="{{ $case['url'] }}" class="dhsv-button primary" data-icon="false">
                        <span class="text">{{ $buttonText }}</span>
                     </a>
                  </div>
               </div>
            </div>
         @endforeach
      </div>
      <div class="range-slider"></div>
   </div>
</div>
