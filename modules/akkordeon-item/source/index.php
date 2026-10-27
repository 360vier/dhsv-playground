<?php

$controller = function ($block_attributes, $content) {
    return array_merge(
        $block_attributes,
        [
            'content' => $content,
            'attributes' => [
                'title' => $block_attributes['title'] ?? '',
                'initially_open' => $block_attributes['initiallyOpen'] ?? false,
                'item_id' => $block_attributes['itemId'] ?? '',
            ],
        ]
    );
};
