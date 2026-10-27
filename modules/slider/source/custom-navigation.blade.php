
@if ($use_draggable_pagination)
    <div class="splide__dragable-pagination"></div>
@else
  <div class="splide__arrows splide__pagination-container">
    <button type="button" class="splide__arrow splide__arrow--prev" aria-label="{{ __('Vorherige Folie', 'dhsv_theme') }}">
        <span class="splide__arrow-icon" aria-hidden="true">@svg('icons.control-arrow-right')</span>
    </button>
    <ul class="splide__pagination"></ul>
    <div class="splide__pagination__numbers">
        <span class="current"></span>
        <span class="total"></span>
    </div>
    <button type="button" class="splide__arrow splide__arrow--next" aria-label="{{ __('Nächste Folie', 'dhsv_theme') }}">
        <span class="splide__arrow-icon" aria-hidden="true">@svg('icons.control-arrow-right')</span>
    </button>
</div>
@endif
