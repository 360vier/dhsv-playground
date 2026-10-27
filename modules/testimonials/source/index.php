<?php

$get_client_logo = function ($client_id) {
    $thumb_id = $client_id ? get_post_thumbnail_id($client_id) : 0;
    if (!$thumb_id) {
        return null;
    }
    $image = wp_get_attachment_image_src($thumb_id, 'full');
    if (!$image) {
        return null;
    }
    return [
        'url' => $image[0],
        'alt' => get_post_meta($thumb_id, '_wp_attachment_image_alt', true) ?: get_the_title($client_id),
        'width' => $image[1],
        'height' => $image[2],
    ];
};

// Build a uniform testimonial item from a testimonial post + its client logo.
$build_testimonial = function ($t, $client_id, $logo) {
    $name_position = (string) get_field('name_position', $t->ID);
    return [
        'id' => $t->ID,
        'title' => get_the_title($t->ID),
        'url' => get_the_permalink($t->ID),
        'logo' => $logo,
        'testimonial' => $t->post_content,
        'testimonial_person' => $name_position !== '' ? $name_position : get_the_title($client_id),
        'link' => (string) get_field('link', $t->ID),
        'has_testimonial' => true,
    ];
};

$controller = function ($block_attributes, $content) use ($get_client_logo, $build_testimonial) {
    $selection_by = $block_attributes['selectionBy'] ?? 'category';
    $testimonials = [];

    if ($selection_by === 'curated') {
        $curated_ids = \dhsv\Wpml::objectIds(
            array_values(array_filter(array_map('intval', (array) ($block_attributes['curatedIds'] ?? [])))),
            'testimonial'
        );
        $posts = $curated_ids ? get_posts([
            'post_type' => 'testimonial',
            'suppress_filters' => false,
            'post_status' => 'publish',
            'posts_per_page' => -1,
            'include' => $curated_ids,
            'orderby' => 'post__in',
            'no_found_rows' => true,
        ]) : [];

        foreach ($posts as $t) {
            $client_id = \dhsv\Wpml::objectId((int) get_field('related_client', $t->ID), 'client');
            $logo = $get_client_logo($client_id);
            if (!$logo) {
                continue;
            }
            $testimonials[] = $build_testimonial($t, $client_id, $logo);
        }
    } else {
        $limit = (int) ($block_attributes['limitWhenCategory'] ?? 10);
        $limit = $limit > 0 ? $limit : 10;

        $args = [
            'post_type' => 'client',
            'suppress_filters' => false,
            'post_status' => 'publish',
            'posts_per_page' => $limit,
            'orderby' => 'date',
            'order' => 'ASC',
            'no_found_rows' => true,
        ];
        if (!empty($block_attributes['categories']) && is_array($block_attributes['categories'])) {
            $args['tax_query'] = [[
                'taxonomy' => 'client_kategorie',
                'field' => 'term_id',
                'terms' => \dhsv\Wpml::objectIds($block_attributes['categories'], 'client_kategorie'),
            ]];
        }

        $clients = get_posts($args);
        $client_ids = array_map(fn ($c) => (int) $c->ID, $clients);

        $testimonial_map = [];
        if ($client_ids) {
            $testimonial_posts = get_posts([
                'post_type' => 'testimonial',
                'suppress_filters' => false,
                'post_status' => 'publish',
                'posts_per_page' => -1,
                'no_found_rows' => true,
                'meta_query' => [[
                    'key' => 'related_client',
                    'value' => $client_ids,
                    'compare' => 'IN',
                    'type' => 'NUMERIC',
                ]],
            ]);
            foreach ($testimonial_posts as $t) {
                $related = \dhsv\Wpml::objectId((int) get_field('related_client', $t->ID), 'client');
                if ($related > 0 && !isset($testimonial_map[$related])) {
                    $testimonial_map[$related] = $t;
                }
            }
        }

        foreach ($clients as $client) {
            $logo = $get_client_logo($client->ID);
            if (!$logo) {
                continue;
            }
            $t = $testimonial_map[$client->ID] ?? null;
            if ($t instanceof \WP_Post) {
                $testimonials[] = $build_testimonial($t, $client->ID, $logo);
            } else {
                // Client without a testimonial post -> logo-only card.
                $testimonials[] = [
                    'id' => $client->ID,
                    'title' => get_the_title($client->ID),
                    'url' => get_the_permalink($client->ID),
                    'logo' => $logo,
                    'testimonial' => '',
                    'testimonial_person' => '',
                    'link' => '',
                    'has_testimonial' => false,
                ];
            }
        }
    }

    return array_merge($block_attributes, [
        'content' => $content,
        'testimonials' => $testimonials,
        'is_carousel' => count($testimonials) >= 2,
    ]);
};
