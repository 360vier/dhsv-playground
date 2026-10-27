<?php

/*
 * The controller is for processing attributes before they are passed to the blade template.
 * If you leave out the controller, the block's attributes and $content will be passed directly to the template.
 *
 * Alternatively, you can define a $render function, if you don't want to use blade templates.
 */
$controller = function ($block_attributes, $content) {
    $source = $block_attributes['source'] ?? 'manual';
    $tags = $block_attributes['tags'] ?? [];

    if ($source === 'techstack') {
        $args = [
            'post_type'      => 'techstack',
            'suppress_filters' => false,
            'posts_per_page' => isset($block_attributes['maxItems']) ? intval($block_attributes['maxItems']) : 20,
            'orderby'        => 'title',
            'order'          => 'ASC',
        ];

        if (!empty($block_attributes['categories']) && is_array($block_attributes['categories'])) {
            $args['tax_query'] = [
                [
                    'taxonomy' => 'techstack_kategorie',
                    'field'    => 'term_id',
                    'terms'    => array_map('intval', $block_attributes['categories']),
                ],
            ];
        }

        $posts = get_posts($args);
        $tags = array_map(function ($post) {
            return get_the_title($post);
        }, $posts);
    }

    return array_merge(
        $block_attributes,
        [
            'content' => $content,
            'tags'    => $tags,
        ]
    );
};
