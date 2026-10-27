<div class="dhsv-testimonials-block-wrapper align{{ $align }} {{ $is_carousel ? 'is-carousel' : '' }}">
   @if($is_carousel)
      <div class="dhsv-testimonials-block__viewport">
         <div class="dhsv-testimonials-block__container">
            @foreach($testimonials as $loopIndex => $item)
               <div class="dhsv-testimonials-block__slide">
                  @include('blocks::testimonials._card', ['item' => $item, 'loopIndex' => $loopIndex, 'extra' => 'dhsv-testimonials-block__slide-card'])
               </div>
            @endforeach
         </div>
      </div>
      <div class="dhsv-testimonials-block__controls-dots"></div>
   @else
      <div class="dhsv-testimonials-block__inner">
         @foreach($testimonials as $loopIndex => $item)
            @include('blocks::testimonials._card', ['item' => $item, 'loopIndex' => $loopIndex])
         @endforeach
      </div>
   @endif
</div>
