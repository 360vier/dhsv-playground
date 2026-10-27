<div {!! get_block_wrapper_attributes(['class' => 'team-slider']) !!}>
    @if(empty($members))
        <p class="team-slider__empty">{{ __('Keine Mitarbeiter gefunden.', 'dhsv_theme') }}</p>
    @else
        <div class="team-slider__rows">
            @if(!empty($member_rows[0]))
                <div class="team-slider__row team-slider__row--forward">
                    <div class="dhsv-slider splide team-slider__splide" data-splide="{{ wp_json_encode($splide_forward) }}">
                        <div class="splide__track">
                            <div class="splide__list">
                                @foreach($member_rows[0] as $member)
                                    <div class="splide__slide">
                                        @include('partials.team-slider-card', ['member' => $member])
                                    </div>
                                @endforeach
                            </div>
                        </div>
                    </div>
                </div>
            @endif
            @if(!empty($member_rows[1]))
                <div class="team-slider__row team-slider__row--reverse">
                    <div class="dhsv-slider splide team-slider__splide" data-splide="{{ wp_json_encode($splide_reverse) }}">
                        <div class="splide__track">
                            <div class="splide__list">
                                @foreach($member_rows[1] as $member)
                                    <div class="splide__slide">
                                        @include('partials.team-slider-card', ['member' => $member])
                                    </div>
                                @endforeach
                            </div>
                        </div>
                    </div>
                </div>
            @endif
        </div>
    @endif
</div>
