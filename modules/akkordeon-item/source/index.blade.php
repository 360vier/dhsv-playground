   <details class="wp-block-dhsv-akkordeon-item" id="{{ $attributes['item_id'] }}" @if($attributes['initially_open']) open @endif>
        <summary>
            <span class="accordion-group__summary-icon"></span>
            <span class="accordion-group__summary-title">{!! wp_kses_post($attributes['title']) !!}</span>
        </summary>
        <div>
            {!! $content !!}
        </div>
    </details>