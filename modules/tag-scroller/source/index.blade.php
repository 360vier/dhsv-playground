@php
$tag_count = is_array($tags) ? count($tags) : 0;

$splide_options = [
    'type' => 'loop',
    'drag' => 'free',
    'focus' => 'center',
    'autoWidth' => true,
    'clones' => max($tag_count * 4, 48),
    'start' => $direction == 'right-to-left' ? max($tag_count - 1, 0) : 0,
    'autoScroll' => [
        'speed' => $direction == 'left-to-right' ? 0.5 : -0.5,
        'pauseOnHover' => false,
    ],
];
@endphp
<div {!! get_block_wrapper_attributes([
    'direction' => $direction,
]) !!}>
    <div class="dhsv-slider splide" data-splide="{{ wp_json_encode($splide_options) }}">
        <div class="splide__track">
            <div class="splide__list">
                @foreach($tags as $tag)
                    <div class="splide__slide">{{$tag}}</div>
                @endforeach
            </div>
        </div>
    </div>
</div>
