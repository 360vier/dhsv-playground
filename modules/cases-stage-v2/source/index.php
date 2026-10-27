<?php

use dhsv\Cases;

/*
 * The controller is for processing attributes before they are passed to the blade template.
 */

$controller = function ($block_attributes, $content) {
    $cases = collect(Cases::resolveSelected($block_attributes))->map(
        function ($case) {
            $client_id = function_exists('get_field')
                ? get_field('related_client', $case->ID)
                : null;
            $client_name = $client_id ? get_the_title((int) $client_id) : '';

            return [
                'id' => $case->ID,
                'title' => $case->post_title,
                'client_name' => $client_name,
                'url' => get_the_permalink($case->ID),
                'image' => get_the_post_thumbnail_url($case->ID, 'large'),
                'thumbnail_id' => (int) get_post_thumbnail_id($case->ID),
            ];
        }
    );

    return array_merge(
        $block_attributes,
        [
            'content' => $content,
            'cases' => $cases,
            'buttonText' => __('Zum Case', 'dhsv_theme'),
        ]
    );
};

add_filter(
    'dhsv_block_lcp_image_id',
    function ($id, $block_name, $attrs) {
        if ($id || $block_name !== 'dhsv/cases-stage-v2') {
            return $id;
        }
        $cases = Cases::resolveSelected($attrs);
        if (empty($cases)) {
            return $id;
        }
        $thumb = (int) get_post_thumbnail_id($cases[0]->ID);
        return $thumb ?: $id;
    },
    10,
    3
);
