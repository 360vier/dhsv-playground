<?php

/*
 * The controller is for processing attributes before they are passed to the blade template.
 * If you leave out the controller, the block's attributes and $content will be passed directly to the template.
 *
 * Alternatively, you can define a $render function, if you don't want to use blade templates.
 */
$controller = function ($block_attributes, $content) {
    $maxLogos = isset($block_attributes['maxLogos']) ? intval($block_attributes['maxLogos']) : 10;

    $args = [
        'post_type' => 'client',
        'suppress_filters' => false,
        'posts_per_page' => $maxLogos,
        'orderby' => 'date',
        'order' => 'ASC',
    ];

    if (!empty($block_attributes['categories']) && is_array($block_attributes['categories'])) {
        $args['tax_query'] = [
            [
                'taxonomy' => 'client_kategorie',
                'field' => 'term_id',
                'terms' => \dhsv\Wpml::objectIds($block_attributes['categories'], 'client_kategorie'),
            ],
        ];
    }

    $posts = get_posts($args);
    $logos = collect($posts)
        ->map(function ($post) {
            $id = $post->ID;
            $featured_image_id = get_post_thumbnail_id($id);
            $logo = null;

            if ($featured_image_id) {
                $image_data = wp_get_attachment_image_src($featured_image_id, 'full');
                $alt_text = get_post_meta($featured_image_id, '_wp_attachment_image_alt', true);
                if ($image_data) {
                    $logo = [
                        'url' => $image_data[0],
                        'alt' => $alt_text ?: get_the_title($id),
                        'width' => $image_data[1],
                        'height' => $image_data[2],
                    ];
                }
            }

            return [
                'id' => $id,
                'title' => get_the_title($id),
                'url' => get_the_permalink($id),
                'logo' => $logo,
            ];
        })
        ->filter(function ($item) {
            return !empty($item['logo']);
        })
        ->values();

    $desktopPerPage = isset($block_attributes['desktopPerPage']) ? floatval($block_attributes['desktopPerPage']) : 5;
    $mobilePerPage = isset($block_attributes['mobilePerPage']) ? floatval($block_attributes['mobilePerPage']) : 1.5;
    $autoscroll = isset($block_attributes['autoscroll']) ? (bool) $block_attributes['autoscroll'] : true;
    $pauseOnHover = isset($block_attributes['pauseOnHover']) ? (bool) $block_attributes['pauseOnHover'] : true;
    $logoOpacity = isset($block_attributes['logoOpacity'])
        ? max(0, min(1, floatval($block_attributes['logoOpacity'])))
        : 1;
    $logoAlignment = isset($block_attributes['logoAlignment'])
        && in_array($block_attributes['logoAlignment'], ['left', 'center', 'right'], true)
        ? $block_attributes['logoAlignment']
        : 'center';

    $splideOptions = [
        'type' => 'loop',
        'perPage' => $desktopPerPage,
        'gap' => '1rem',
        'arrows' => false,
        'pagination' => false,
        'drag' => true,
        'breakpoints' => [
            '768' => [
                'perPage' => $mobilePerPage,
            ],
        ],
    ];

    if ($autoscroll) {
        $splideOptions['autoScroll'] = [
            'speed' => 1,
            'pauseOnHover' => $pauseOnHover,
        ];
    }

    return array_merge(
        $block_attributes,
        [
            'content' => $content,
            'logos' => $logos,
            'logo_alignment' => $logoAlignment,
            'logo_opacity' => $logoOpacity,
            'splide_options' => wp_json_encode($splideOptions),
        ]
    );
};
