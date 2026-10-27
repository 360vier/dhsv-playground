<div {!! get_block_wrapper_attributes([
    'id' => $id,
]) !!}>
    <span class="wp-block-dhsv-tab-item--title">
        @if ($logo['url'])
            <img class="wp-block-dhsv-tab-item--logo" src="{{$logo['url']}}" alt="{{$logo['alt'] ?? ''}}">
        @endif
         <span class="wp-block-dhsv-tab-item--title-text">{!! $title !!}</span>
   </span>
    <div class="wp-block-dhsv-tab-item--content">
        {!! $content !!}
    </div>
</div>
