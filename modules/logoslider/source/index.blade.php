<div class="dhsv-logoslider-block-wrapper{{ ($hasBackground ?? false) ? ' dhsv-logoslider-block-wrapper-has-bg' : '' }}{{ (($hasBorder ?? true) === false) ? ' dhsv-logoslider-block-wrapper-no-border' : '' }}{{ ($invertLogos ?? false) ? ' dhsv-logoslider-block-wrapper-invert' : '' }}{{ (($hasOverflow ?? true) !== false) ? ' dhsv-logoslider-block-wrapper-has-overflow' : '' }} dhsv-logoslider-block-wrapper-logo-align-{{ $logo_alignment ?? 'center' }} align{{ $align }}" style="--_logo-opacity: {{ $logo_opacity ?? 1 }};">
    <div
        class="dhsv-logoslider splide"
        aria-label="{{ __('Logo carousel', 'dhsv_theme') }}"
        data-splide="{{ $splide_options }}"
    >
        <div class="splide__track">
            <div class="splide__list">
                @foreach($logos as $logoItem)
                    <div class="splide__slide">
                        <div class="logoslider__card">
                            @if($logoItem['logo'])
                                <div class="logoslider__logo">
                                    <img
                                        src="{{ $logoItem['logo']['url'] }}"
                                        alt="{{ $logoItem['logo']['alt'] ?? $logoItem['title'] }}"
                                    />
                                </div>
                            @endif
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
    </div>
</div>

