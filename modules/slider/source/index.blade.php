<section class="slider-container {{$currentType}} text-{{(key_exists('id', $backImage) ? $backImage['id'] : '') || $whiteText ? 'white' : 'default'}} align{{$align}}">
    <div
        class="dhsv-slider splide align{{$widthType}} {{$currentType}} {{$withSpace ? 'with-space' : ''}}"
        aria-label="{{isset($aria_label) ? $aria_label : ''}}"
        data-splide="{{$splide_options}}"
    >
        <div class="splide__track">
            <div class="splide__list">
                {!! $content !!}
            </div>
        </div>
{{--        @include('blocks::slider.navigation')--}}
        @include('blocks::slider.custom-navigation', ['use_draggable_pagination' => $use_draggable_pagination])
    </div>
</section>

