<?php

/*
 * The controller is for processing attributes before they are passed to the blade template.
 * If you leave out the controller, the block's attributes and $content will be passed directly to the template.
 *
 * Alternatively, you can define a $render function, if you don't want to use blade templates.
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
