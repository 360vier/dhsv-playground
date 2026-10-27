<div {!! get_block_wrapper_attributes([]) !!}>
    @php
        $accId = 'faq-accordion-' . uniqid();
        $columnClass = 'faq-accordion--columns-' . ($columns ?? 1);
        $faq_columns = $faq_columns ?? [$faqs ?? []];
    @endphp
    <div class="faq-accordion faq-slider--accordion {{ $columnClass }}">
        <div class="faq-accordion__columns">
            @foreach ($faq_columns as $columnIndex => $columnFaqs)
                <div class="faq-accordion__column">
                    <accordion-group
                        name="{{ $accId }}-col-{{ $columnIndex }}"
                        class="faq-accordion__group"
                    >
                        @foreach ($columnFaqs as $faq)
                            @php
                                $itemId = 'accordion-' . $faq['id'];
                            @endphp
                            <details id="{{ $itemId }}">
                                <summary>
                                    <span class="accordion-group__summary-icon"></span>
                                    <span class="accordion-group__summary-title">{{ $faq['title'] }}</span>
                                </summary>
                                <div>{!! $faq['content'] !!}</div>
                            </details>
                        @endforeach
                    </accordion-group>
                </div>
            @endforeach
        </div>
    </div>
    @if(!empty($show_all_button) && !empty($all_faqs_url))
        <div class="faq-accordion__footer dhsv-buttons horizontal" data-align="left">
            <a href="{{ esc_url($all_faqs_url) }}" class="dhsv-button tertiary">
                <span class="text">{{ __('Alle FAQs anzeigen', 'dhsv_theme') }}</span>
                <span class="icon">
                    @svg('button.arrow-right')
                </span>
            </a>
        </div>
    @endif
</div>
