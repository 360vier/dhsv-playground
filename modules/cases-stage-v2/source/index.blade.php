<div class="dhsv-cases-stage-v2-block-wrapper alignfull is-root-container">
    <div class="dhsv-cases-stage-v2-block alignwide">
        <div class="dhsv-cases-stage-v2-block__inner">
            <div class="dhsv-cases-stage-v2-block__viewport">
                <div class="dhsv-cases-stage-v2-block__container">
                    @foreach ($cases as $loopIndex => $case)
                        <div class="dhsv-cases-stage-v2-block__slide">
                            <div class="dhsv-cases-stage-v2-block__slide-content">
                                <div class="case__image">
                                    {{-- See cases-stage/index.blade.php for the rationale:
                                         fetchpriority=auto on the first image keeps WP's
                                         auto-attribute logic from claiming the LCP slot
                                         here, so it can promote the real mobile LCP image
                                         elsewhere on the page. --}}
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
                                        @if (!empty($case['client_name']))
                                            <p class="case__index">{{ $case['client_name'] }}</p>
                                        @endif
                                        <p class="case__title">{{ $case['title'] }}</p>
                                        <a href="{{ $case['url'] }}" class="dhsv-button primary has-icon-right">
                                            <span class="text">{{ $buttonText }}</span>
                                            <span class="icon">
                                                @svg('icons.arrow-right')
                                            </span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
            @if (count($cases) > 1)
                @include('blocks::slider.custom-navigation', ['use_draggable_pagination' => true])
            @endif
        </div>
    </div>
</div>