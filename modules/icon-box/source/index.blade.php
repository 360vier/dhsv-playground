<div class="dhsv-icon-box-block {{ $alignment }} align{{ $align }} icon-size-{{ $iconSize }} background-{{ $background }}">
    @if($image)
        <div class="icon-box__image">
            <img src="{{$image['url']}}" alt="{{$image['alt']}}">
        </div>
    @endif
    <div class="icon-box__text">
    @php
        $allowedLevels = ['h2', 'h3', 'h4', 'h5', 'h6', 'p'];
        $level = $headlineLevel ?? 'h3';
        $tag = in_array($level, $allowedLevels, true) ? $level : 'h3';
    @endphp
    @if($headline)
        <{{ $tag }} class="title">{!! $headline !!}</{{ $tag }}>
    @endif
    @if($text)
        <span>{!! $text !!}</span>
    @endif
    </div>
</div>