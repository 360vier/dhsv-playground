@php($level = in_array($level ?? 'h2', ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'], true) ? $level : 'h2')
<div class="dhsv-swap-headline-block align{{ $align }}">
    <{{$level}}>
    {!! $headline !!}
    </{{$level}}>
</div>