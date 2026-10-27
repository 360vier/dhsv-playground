<div class="wp-block-dhsv-akkordeon">
    @php($activeBackground = $attributes['active_background'] ?? 'solid')
    <accordion-group
        class="has-active-bg-{{ $activeBackground }}"
        @if($attributes['allow_multiple']) allow-multiple @endif
        @if($attributes['allow_url_update']) allow-url-update @endif
        @if($attributes['disable_scroll']) disable-scroll-into-view @endif
        @if($attributes['group_name']) name="{{ $attributes['group_name'] }}" @endif
    >
        {!! $content !!}
    </accordion-group>
</div> 