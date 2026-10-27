<?php

/*
 * The controller is for processing attributes before they are passed to the blade template.
 */
$controller = function ($block_attributes, $content, $block) {
    return array_merge(
        $block_attributes,
        [
            'block' => $block,
            'items' => \dhsv\Breadcrumb::items($block_attributes['currentLabel'] ?? null),
        ]
    );
};
