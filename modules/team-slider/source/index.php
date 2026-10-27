<?php

/*
 * Team Slider: published Mitarbeiter, optional mitarbeiter_cat filter.
 */

$controller = function ($block_attributes, $content) {
    $max_items = isset($block_attributes['maxItems']) ? max(1, (int) $block_attributes['maxItems']) : 50;
    $filter_by_categories = !empty($block_attributes['filterByCategories']);
    $categories = [];

    if ($filter_by_categories && !empty($block_attributes['categories']) && is_array($block_attributes['categories'])) {
        $categories = array_map('intval', $block_attributes['categories']);
        $categories = \dhsv\Wpml::objectIds($categories, 'mitarbeiter_cat');
    }

    $splide_forward = [
        'type' => 'loop',
        'drag' => 'free',
        'focus' => 'center',
        'autoWidth' => true,
        'arrows' => false,
        'pagination' => false,
        'autoScroll' => [
            'speed' => 0.5,
            'pauseOnHover' => false,
        ],
    ];

    $splide_reverse = [
        'type' => 'loop',
        'drag' => 'free',
        'focus' => 'center',
        'autoWidth' => true,
        'arrows' => false,
        'pagination' => false,
        'autoScroll' => [
            'speed' => -0.5,
            'pauseOnHover' => false,
        ],
    ];

    if ($filter_by_categories && empty($categories)) {
        return array_merge(
            $block_attributes,
            [
                'content' => $content,
                'members' => [],
                'splide_forward' => $splide_forward,
                'splide_reverse' => $splide_reverse,
            ]
        );
    }

    $args = [
        'post_type' => 'mitarbeiter',
        'suppress_filters' => false,
        'post_status' => 'publish',
        'posts_per_page' => $max_items,
        'orderby' => 'title',
        'order' => 'ASC',
        'no_found_rows' => true,
    ];

    if (!empty($categories)) {
        $args['tax_query'] = [
            [
                'taxonomy' => 'mitarbeiter_cat',
                'field' => 'term_id',
                'terms' => $categories,
            ],
        ];
    }

    $posts = \get_posts($args);
    $members = [];

    foreach ($posts as $post) {
        $id = (int) $post->ID;
        $thumb_id = (int) \get_post_thumbnail_id($id);
        $featured = $thumb_id > 0
            ? \App\customization\mitarbeiter_rest_image_from_attachment($thumb_id)
            : null;

        $hover_id = \function_exists('get_field') ? (int) \get_field('hover_portrait', $id) : 0;
        $hover = $hover_id > 0
            ? \App\customization\mitarbeiter_rest_image_from_attachment($hover_id)
            : null;

        $vorname = \get_field('vorname', $id);
        $nachname = \get_field('nachname', $id);
        $name = trim(($vorname ?? '') . ' ' . ($nachname ?? '')) ?: \get_the_title($id);
        $funktion = \get_field('funktion', $id) ?: '';

        $members[] = [
            'id' => $id,
            'name' => $name,
            'funktion' => $funktion,
            'link' => \get_permalink($id),
            'featured_image' => $featured,
            'hover_portrait' => $hover,
        ];
    }

    $member_rows = [[], []];

    foreach ($members as $index => $member) {
        $member_rows[$index % 2][] = $member;
    }

    return array_merge(
        $block_attributes,
        [
            'content' => $content,
            'members' => $members,
            'member_rows' => $member_rows,
            'splide_forward' => $splide_forward,
            'splide_reverse' => $splide_reverse,
        ]
    );
};
