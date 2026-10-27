@php
    $align = $attributes['align'] ?? '';
    $alignClass = $align ? ' align' . $align : '';
    $dataAttrs = $attributes['data_attrs'] ?? [];
    $metaPairs = $attributes['meta_pairs'] ?? [];
@endphp
<details
    class="wp-block-dhsv-ai-akkordeon{{ $alignClass }}"
    @if($attributes['item_id']) id="{{ $attributes['item_id'] }}" @endif
    @if($attributes['initially_open']) open @endif
    @foreach($dataAttrs as $attrName => $attrValue)
        {{ $attrName }}="{{ esc_attr($attrValue) }}"
    @endforeach
>
    <summary>
        <span class="ai-akkordeon__stars" aria-hidden="true">
            <span class="ai-akkordeon__stars-badge">
                <svg class="ai-akkordeon__stars-icon" width="25" height="23" viewBox="0 0 25 23" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                    <path d="M16 16.1429C12.2129 16.1429 9.14282 19.2129 9.14282 23L6.85711 23C6.85712 19.2129 3.78707 16.1429 5.9947e-07 16.1429L7.99294e-07 13.8571C3.78707 13.8571 6.85712 10.7871 6.85712 7L9.14282 7C9.14282 10.7871 12.2129 13.8571 16 13.8571L16 16.1429Z" fill="currentColor"/>
                    <path d="M21.75 14C21.75 12.2065 23.2051 10.7526 25 10.7526L25 9.25383C23.2051 9.25383 21.75 7.79993 21.75 6.00645L20.25 6.00645C20.25 7.79993 18.7949 9.25383 17 9.25383L17 10.7526C18.7949 10.7526 20.25 12.2065 20.25 14L21.75 14Z" fill="currentColor"/>
                    <path d="M14.5625 6C14.5625 4.65381 15.6538 3.5625 17 3.5625L17 2.4375C15.6538 2.4375 14.5625 1.34619 14.5625 2.44931e-06L13.4375 2.35096e-06C13.4375 1.34619 12.3462 2.4375 11 2.4375L11 3.5625C12.3462 3.5625 13.4375 4.65381 13.4375 6L14.5625 6Z" fill="currentColor"/>
                </svg>
            </span>
        </span>
        <span class="ai-akkordeon__chevron" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <polyline points="6 9 12 15 18 9" />
            </svg>
        </span>
        <span class="ai-akkordeon__summary-content">
            @if(!empty($attributes['summary_lead']))
                <div class="ai-akkordeon__summary-lead">{!! $attributes['summary_lead'] !!}</div>
            @endif
            @if(!empty($attributes['summary_text']))
                <div class="ai-akkordeon__summary-text">{!! $attributes['summary_text'] !!}</div>
            @endif
            @if(!empty($metaPairs))
                <dl class="ai-akkordeon__meta">
                    @foreach($metaPairs as $pair)
                        <div class="ai-akkordeon__meta-row">
                            <dt class="ai-akkordeon__meta-key">{{ $pair['key'] }}</dt>
                            <dd class="ai-akkordeon__meta-value">{{ $pair['value'] }}</dd>
                        </div>
                    @endforeach
                </dl>
            @endif
        </span>
        @include('blocks::ai-akkordeon._ai-icons')
    </summary>
    <div class="ai-akkordeon__separator" aria-hidden="true">
        <span class="ai-akkordeon__separator-label">ai-view</span>
    </div>
    <div class="ai-akkordeon__body">
        {!! $content !!}
    </div>
</details>
