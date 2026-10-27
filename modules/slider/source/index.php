<?php

namespace dhsv;

// phpcs:disable
$controller = function ($block_attributes, $content) {
    // Check if it's a roadmap slider
    $is_roadmap = strpos($content, 'dhsv-roadmap') !== false;

    // Hotfix for roadmap slider on mobile
    if ($is_roadmap) {
        $block_attributes['responsiveSettings']['mobile']['perPage'] = 1;
    }

    $responsive_settings = collect($block_attributes['responsiveSettings'])
        ->map(
            function ($s) use ($block_attributes) {
                return array_merge(
                    $s,
                    [
                        'destroy' => $s['perPage'] >= $block_attributes['slidesCount'],
                    ]
                );
            }
        );

    if ($block_attributes['currentType'] != 'teaserCarousel' && $block_attributes['currentType'] != 'imageTextCarousel') {
        $splide_options = array_merge(
            [
                'type'     => 'slide',
                'autoplay' => $block_attributes['autoplay'],
                'autoWidth' => $block_attributes['currentType'] == 'imageCarousel' ? true : false,
            ],
            $responsive_settings['desktop-xl'],
            [
                'breakpoints' => [
                    '768'  => $responsive_settings['mobile'],
                    '1024' => $responsive_settings['tablet'],
                    '1500' => $responsive_settings['desktop'],
                ],
            ]
        );
    }

    if ($is_roadmap) {
        $splide_options['adjustableHeight'] = ['maximizeHeight' => true];
    }

    return array_merge(
        $block_attributes,
        [
            'content'        => $content,
            'splide_options' => wp_json_encode($splide_options),
            'use_draggable_pagination' => $block_attributes['useDraggablePagination'],
        ]
    );
};
// phpcs:enable
