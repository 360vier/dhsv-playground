<?php

/*
 * The controller is for processing attributes before they are passed to the blade template.
 * If you leave out the controller, the block's attributes and $content will be passed directly to the template.
 *
 * Alternatively, you can define a $render function, if you don't want to use blade templates.
 */
$controller = function ($block_attributes, $content) {
    $texts = collect(explode(',', $block_attributes['texts']))->map(function ($text) {
        return trim($text);
    })->filter(function ($text) {
        return $text !== '';
    })->mapWithKeys(function ($text, $key) {
        return [$key => '<span class="swap" style="--anchor: --swap-pos-' . $key . '">' . $text . '</span>'];
    })->implode('');
    $swap_output = '<div class="swap-wrapper"><div class="swap-inner">' . $texts . '</div></div>';
    return array_merge(
        $block_attributes,
        [
            'content' => $content,
            'headline' => str_replace('{{SWAP}}', $swap_output, $block_attributes['headline']),
        ]
    );
};
