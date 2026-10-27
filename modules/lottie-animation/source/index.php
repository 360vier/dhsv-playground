<?php

/*
 * The controller is for processing attributes before they are passed to the blade template.
 * If you leave out the controller, the block's attributes and $content will be passed directly to the template.
 *
 * Alternatively, you can define a $render function, if you don't want to use blade templates.
 */
$controller = function ($block_attributes, $content) {
    $animation_path = get_theme_file_uri() . '/resources/assets/gutenberg/blocks/lottie-animation/anim.json';

    return array_merge(
        $block_attributes,
        [
            'content' => $content,
            'animation_path' => $animation_path,
        ]
    );
};
