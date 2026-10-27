@php
  $sliderPosts = $posts ?? $cases ?? [];
  $slideCount = count($sliderPosts);
  $wrapperStyle = $slideCount > 0 ? '--_slide-count: ' . $slideCount . ';' : '';
  $singleClass = $slideCount === 1 ? ' dhsv-case-study-slider--single' : '';
  $hasIntroContent = !empty(trim($content ?? ''));
  $postType = $postType ?? 'case_study';
  $emptyMessage = $postType === 'post'
      ? __('Keine Blog-Beiträge ausgewählt oder gefunden.', 'dhsv_theme')
      : __('Keine Case Studies ausgewählt oder gefunden.', 'dhsv_theme');
@endphp

@if ($slideCount === 0)
  <div
    {!! get_block_wrapper_attributes([
        'class' => 'dhsv-case-study-slider dhsv-case-study-slider--' . $postType . ' dhsv-case-study-slider--empty align' . ($align ?? 'full'),
    ]) !!}
  >
    @if ($hasIntroContent)
      <div class="dhsv-case-study-slider__intro alignwide">
        {!! $content !!}
      </div>
    @endif
    <p class="dhsv-case-study-slider__empty-message">
      {{ $emptyMessage }}
    </p>
  </div>
@else
  <div
    {!! get_block_wrapper_attributes([
        'class' => 'dhsv-case-study-slider dhsv-case-study-slider--' . $postType . $singleClass . ' align' . ($align ?? 'full'),
        'style' => $wrapperStyle,
    ]) !!}
  >
    <div class="is-root-container dhsv-case-study-slider__sticky">
      @if ($hasIntroContent)
        <div class="dhsv-case-study-slider__intro alignwide">
          {!! $content !!}
        </div>
      @endif
      <div class="slider-wrapper alignwide">
        <div class="dhsv-case-study-slider__track">
          @foreach ($sliderPosts as $sliderPost)
            <div class="dhsv-case-study-slider__slide">
              @if ($postType === 'post')
                @include('partials.blog-post-card', ['post' => $sliderPost, 'cardSize' => 'slider'])
              @else
                @include('partials.case-study-card', ['post' => $sliderPost, 'cardSize' => 'slider'])
              @endif
            </div>
          @endforeach
        </div>
      </div>
    </div>
  </div>
@endif
