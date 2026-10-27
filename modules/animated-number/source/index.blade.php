<div class="dhsv-animated-number-block align{{$align}}" data-animation-duration="{{$animationDuration}}">
    <div class="dhsv-animated-number-block__content">
        <div
            class="dhsv-animated-number-block__number"
            data-number="{{$number}}"
            data-suffix="{{$suffix}}"
            data-thousands-separator-mode="{{$thousandsSeparatorMode ?? 'auto'}}"
            style="color: {{$numberColor}}"
        >
            {{$number}}{{$suffix}}
        </div>
        <div
            class="dhsv-animated-number-block__text"
            style="color: {{$textColor}}"
        >
            {!! $text !!}
        </div>
    </div>
</div>
