<?php

namespace dhsv;

$controller = function ($block_attributes, $content, $block) {
    $attributes = wp_parse_args(
        $block_attributes,
        [
            'departmentIds'      => [],
            'locationIds'        => [],
            'employmentTypes'    => [],
            'itemsToShow'        => 10,
            'showAll'            => false,
            'orderBy'            => 'date',
            'order'              => 'desc',
            'surface'            => 'glass',
            'showApplyButton'        => false,
            'showRecruitingCategory' => true,
            'showEmploymentType'     => false,
            'showDepartment'         => false,
            'showLocation'           => false,
        ]
    );

    $allowed_orderby = ['date', 'title', 'menu_order'];
    $orderby = in_array($attributes['orderBy'], $allowed_orderby, true) ? $attributes['orderBy'] : 'date';
    $order = strtolower($attributes['order']) === 'asc' ? 'ASC' : 'DESC';
    $tax_query = [];
    $meta_query = [];

    $department_ids = Wpml::objectIds(
        array_filter(array_map('intval', (array) ($attributes['departmentIds'] ?? []))),
        'personio_department'
    );
    if (!empty($department_ids)) {
        $tax_query[] = [
            'taxonomy' => 'personio_department',
            'field'    => 'term_id',
            'terms'    => $department_ids,
        ];
    }

    $location_ids = Wpml::objectIds(
        array_filter(array_map('intval', (array) ($attributes['locationIds'] ?? []))),
        'personio_location'
    );
    if (!empty($location_ids)) {
        $tax_query[] = [
            'taxonomy' => 'personio_location',
            'field'    => 'term_id',
            'terms'    => $location_ids,
        ];
    }

    $employment_types = array_filter(array_map('sanitize_text_field', (array) ($attributes['employmentTypes'] ?? [])));
    if (!empty($employment_types)) {
        $meta_query[] = [
            'key'     => 'employment_type',
            'value'   => $employment_types,
            'compare' => 'IN',
        ];
    }

    $current_language = Wpml::currentLanguage();
    if ($current_language) {
        $meta_query[] = [
            'key'     => 'personio_language',
            'value'   => $current_language,
            'compare' => '=',
        ];
    }

    $query_args = [
        'post_type'           => 'personio_job',
        'post_status'         => 'publish',
        'posts_per_page'      => $attributes['showAll'] ? -1 : max(1, (int) $attributes['itemsToShow']),
        'orderby'             => $orderby,
        'order'               => $order,
        'no_found_rows'       => true,
        'ignore_sticky_posts' => true,
    ];

    if (!empty($tax_query)) {
        $query_args['tax_query'] = count($tax_query) > 1
            ? array_merge(['relation' => 'AND'], $tax_query)
            : $tax_query;
    }

    if (!empty($meta_query)) {
        $query_args['meta_query'] = $meta_query;
    }

    $jobs_query = new \WP_Query($query_args);
    $items = [];

    if ($jobs_query->have_posts()) {
        while ($jobs_query->have_posts()) {
            $jobs_query->the_post();
            $post_id = get_the_ID();

            $items[] = [
                'id'              => $post_id,
                'title'           => get_the_title(),
                'permalink'       => get_permalink(),
                'excerpt'         => get_the_excerpt(),
                'department'      => get_the_terms($post_id, 'personio_department') ?: [],
                'location'        => get_the_terms($post_id, 'personio_location') ?: [],
                'employment_type' => function_exists('get_field')
                    ? get_field('employment_type', $post_id)
                    : get_post_meta($post_id, 'employment_type', true),
            ];
        }
    }

    wp_reset_postdata();

    $surface = in_array($attributes['surface'] ?? 'glass', ['solid', 'glass'], true)
        ? $attributes['surface']
        : 'glass';

    return [
        'attributes' => $attributes,
        'items'      => $items,
        'surface'    => $surface,
    ];
};
