@php
    $team = $team_member ?? null;
    $show_ranks = $showRanks ?? true;
    $name_tag = in_array($nameLevel ?? 'h3', ['h2', 'h3', 'h4', 'p'], true) ? $nameLevel : 'h3';
    $ranks = [
        'ranks.360vier-german-web-awards',
        'ranks.360vier-google-rate',
        'ranks.360vier-proven-expert',
        'ranks.360vier-ranked-digitalagentur-2024',
    ];
@endphp

<div {!! get_block_wrapper_attributes() !!}>
    @if ($team)
        <article class="team-contact" aria-labelledby="team-contact-name-{{ $team['id'] }}">
            <div class="team-contact__image-wrapper">
                @if (!empty($team['image']['url']))
                    <div class="team-contact__image">
                        <img
                            src="{{ $team['image']['url'] }}"
                            alt="{{ $team['image']['alt'] }}"
                            width="{{ $team['image']['width'] ?? '' }}"
                            height="{{ $team['image']['height'] ?? '' }}"
                        >
                    </div>
                @else
                    <div class="team-contact__image team-contact__image--placeholder" aria-hidden="true"></div>
                @endif
            </div>
            <div class="team-contact__content">
                <{{ $name_tag }} id="team-contact-name-{{ $team['id'] }}" class="team-contact__name">
                    {{ $team['title'] }}
                </{{ $name_tag }}>
                @if ($team['funktion'])
                    <p class="team-contact__position">{{ $team['funktion'] }}</p>
                @endif
                @if ($team['telefonnummer'])
                    <a href="tel:{{ preg_replace('/\s+/', '', $team['telefonnummer']) }}" class="team-contact__telefon">
                        {{ $team['telefonnummer'] }}
                    </a>
                @endif
                @if ($team['e_mail_adresse'])
                    <a href="mailto:{{ $team['e_mail_adresse'] }}" class="team-contact__email">
                        {{ $team['e_mail_adresse'] }}
                    </a>
                @endif
            </div>
            @if ($show_ranks)
                <div class="team-contact__ranks" aria-hidden="true">
                    @foreach ($ranks as $rank)
                        <div class="team-contact__ranks-item">
                            @svg($rank)
                        </div>
                    @endforeach
                </div>
            @endif
        </article>
    @endif
</div>
