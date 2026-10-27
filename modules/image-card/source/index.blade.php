<div {!! get_block_wrapper_attributes(['class' => trim('dhsv-image-card-block overlay-' . $overlayColor . ' format-' . ($format ?? 'default') . ' ' . ($isLargeBox ? 'is-large-box' : ''))]) !!}>
    @if ($image['url'])
        <div class="image-card__image">
            <img src="{{$image['url']}}" alt="{{$image['alt'] ?? ''}}">
            <div class="image-card__overlay"></div>
        </div>
    @endif
    <div class="image-card__content {{ $isLargeBox ? 'is-side' : 'is-bottom' }}">
        @if ($title)
            @php($titleTag = in_array($titleLevel ?? 'h2', ['h2', 'h3', 'h4', 'p'], true) ? $titleLevel : 'h2')
            <{{ $titleTag }} class="image-card__title">{!! $title !!}</{{ $titleTag }}>
        @endif
        @if ($description)
            <p class="image-card__description">{!! $description !!}</p>
        @endif
        @if ($isLargeBox && !empty($link['url']) && $buttonText)
            <a href="{{$link['url']}}" 
                @if (!empty($link['linkTarget'])) target="{{$link['linkTarget']}}" @endif
                @if (!empty($link['rel'])) rel="{{$link['rel']}}" @endif
                class="dhsv-button primary image-card__button">
                <span>{!! $buttonText !!}</span>
                <span class="icon">
                    @svg('icons.arrow-right')
                </span>
            </a>
        @endif
    </div>
</div>

