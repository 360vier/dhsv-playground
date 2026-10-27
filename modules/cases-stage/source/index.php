<?php

use dhsv\Cases;

/*
 * The controller is for processing attributes before they are passed to the blade template.
 * If you leave out the controller, the block's attributes and $content will be passed directly to the template.
 *
 * Alternatively, you can define a $render function, if you don't want to use blade templates.
 */

$controller = function ($block_attributes, $content) {
    $cases = collect(Cases::resolveSelected($block_attributes))->map(
        fn ($case) => [
            'id' => $case->ID,
            'title' => $case->post_title,
            'url' => get_the_permalink($case->ID),
            'image' => get_the_post_thumbnail_url($case->ID, 'large'),
            'thumbnail_id' => (int) get_post_thumbnail_id($case->ID),
        ]
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
        if ($id || $block_name !== 'dhsv/cases-stage') {
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
