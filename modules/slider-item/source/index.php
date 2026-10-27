<?php

$controller = function ($block_attributes, $content) {
    return array_merge(
        $block_attributes,
        [
            'content' => $content,
        ]
    );
};
