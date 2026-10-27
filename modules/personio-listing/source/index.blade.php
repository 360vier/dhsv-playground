@php
  $items = $items ?? [];
  $attributes = $attributes ?? [];
  $surface = in_array($attributes['surface'] ?? 'glass', ['solid', 'glass'], true)
    ? $attributes['surface']
    : 'glass';
@endphp

<div
  class="wp-block-dhsv-personio-listing personio-kit personio-kit--block personio-kit--list personio-kit--surface-{{ esc_attr($surface) }}"
>
  @if(!empty($items))
    <div class="personio-kit__listing">
      @foreach($items as $item)
        @include('partials.personio.card', [
          'postId' => $item['id'],
          'showRecruitingCategory' => $attributes['showRecruitingCategory'] ?? true,
          'showEmploymentType' => $attributes['showEmploymentType'] ?? false,
          'showDepartment' => $attributes['showDepartment'] ?? false,
          'showLocation' => $attributes['showLocation'] ?? false,
        ])
      @endforeach
    </div>
  @else
    @include('partials.personio.empty')
  @endif
</div>
