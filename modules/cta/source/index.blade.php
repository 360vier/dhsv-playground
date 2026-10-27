@php
    $person = $teamMember ?? null;
    $displayImage = !empty($person['image']['url']) ? $person['image'] : ($image ?? []);
    $personName = !empty($person['name']) ? $person['name'] : ($description ?? '');
    $personRole = !empty($person['position']) ? $person['position'] : ($role ?? '');
    $email = !empty($person['email']) ? $person['email'] : '';
    $emailName = !empty($person['firstName']) ? $person['firstName'] : strtok((string) $personName, ' ');
    $primaryLabel = $linkText ?: ($link['title'] ?? __('Mehr erfahren', 'dhsv_theme'));
    $emailLabel = $emailLinkText ?: trim(__('E-Mail an', 'dhsv_theme') . ' ' . $emailName);
    $wrapperClasses = trim(
        (($imagePosition ?? 'left') === 'right' ? 'is-image-right' : 'is-image-left') .
        (!empty($subline) ? ' has-subline' : '') .
        (!empty($displayImage['url']) ? ' has-image' : ' is-without-image')
    );
@endphp

<div {!! get_block_wrapper_attributes(['class' => $wrapperClasses]) !!}>
    @if (!empty($displayImage['url']))
        <img
            class="image"
            src="{{ $displayImage['url'] }}"
            alt="{{ $displayImage['alt'] ?? '' }}"
            @if (!empty($displayImage['width'])) width="{{ $displayImage['width'] }}" @endif
            @if (!empty($displayImage['height'])) height="{{ $displayImage['height'] }}" @endif
        >
    @endif
    <div class="content with-bg bg-dark-gradient">
        <div class="content--body">
            @if ($title)
                <h2 class="content--title">{!! $title !!}</h2>
            @endif
            @if (!empty($subline))
                <p class="content--subline">{!! $subline !!}</p>
            @endif
        </div>
        <div class="content--footer">
            <div class="content--person">
                @if ($personName)
                    <p class="content--description">{!! $personName !!}</p>
                @endif
                @if ($personRole)
                    <p class="content--role">{!! $personRole !!}</p>
                @endif
            </div>
            <div class="content--actions">
                @if ($email)
                    <a href="mailto:{{ $email }}" class="dhsv-button tertiary cta-email-button">
                        <span class="email-label">{!! $emailLabel !!}</span>
                        <span class="icon email-icon" aria-hidden="true">@svg('button.mail-plane')</span>
                    </a>
                @endif
                @if (!empty($link['url']))
                    <a href="{{ $link['url'] }}"
                        @if (!empty($link['linkTarget'])) target="{{ $link['linkTarget'] }}" @endif
                        @if (!empty($link['rel'])) rel="{{ $link['rel'] }}" @endif
                        class="dhsv-button primary">
                        <span>{!! $primaryLabel !!}</span>
                        <span class="icon" aria-hidden="true">
                            @svg('icons.arrow-right')
                        </span>
                    </a>
                @endif
            </div>
        </div>
    </div>
</div>
