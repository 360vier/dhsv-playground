<?php

/*
 * The controller is for processing attributes before they are passed to the blade template.
 */
$controller = function ($block_attributes, $content) {
    $block_attributes = dhsv\Media::withMediaLibraryImageData($block_attributes, ['image']);

    return array_merge(
        $block_attributes,
        [
            'content' => $content,
        ]
    );
};
