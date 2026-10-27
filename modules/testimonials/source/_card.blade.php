@php
   $hasLink = !empty($item['link']);
   $tag = $hasLink ? 'a' : 'div';
   $href = $hasLink ? ' href="' . esc_url($item['link']) . '"' : '';
   $extra = $extra ?? '';
@endphp
<{!! $tag !!}
   class="testimonial {{ $item['has_testimonial'] ? 'has-testimonial' : 'logo-only' }}{{ $hasLink ? ' has-link' : '' }}{{ $extra ? ' ' . $extra : '' }}"
   {!! $href !!}
>
   <div class="testimonial__content">
      @if($item['has_testimonial'] && $item['testimonial'])
         <div class="testimonial__text">{!! $item['testimonial'] !!}</div>
         <div class="testimonial__author">
            <span class="testimonial__person">{{ $item['testimonial_person'] }}</span>
            @if($hasLink)
               <span class="testimonial__cta" aria-hidden="true">
                  <svg width="23" height="21" viewBox="0 0 23 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <path d="M10.9375 1.0625L20.0018 10.1229L10.9375 19.1867" stroke="currentColor" stroke-width="3"/>
                     <path d="M0 10.1289L18.8408 10.1289" stroke="currentColor" stroke-width="3"/>
                  </svg>
                  {{ __('Mehr erfahren', 'dhsv_theme') }}
               </span>
            @endif
            @if($item['logo'])
               <img src="{{ $item['logo']['url'] }}" alt="{{ $item['logo']['alt'] }}">
            @endif
         </div>
      @elseif($item['logo'])
         <div class="testimonial__logo">
            <img src="{{ $item['logo']['url'] }}" alt="{{ $item['logo']['alt'] }}">
         </div>
      @endif
   </div>
</{!! $tag !!}>
