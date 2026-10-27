<?php

$get_align_items = function ($justify_content) {
    switch ($justify_content) {
        case 'left':
            return 'flex-start';
        case 'right':
            return 'flex-end';
        default:
            return $justify_content;
    }
};

$controller = function ($block_attributes, $content) use ($get_align_items) {
    $layout    = $block_attributes['layout'];
    $button_width = $block_attributes['isSame'] ?
        $block_attributes['maxWidth'] . 'px' : 'unset';
    $add_tyles = 'horizontal' === $layout['orientation'] ? [
        'flex-direction: row',
        'justify-content: ' . $layout['justifyContent'],
    ] : [
        'flex-direction: column',
        'align-items: ' . $get_align_items($layout['justifyContent']),
    ];
    $styles    = array_merge(
        [
            'display: ' . $layout['type'],
            'flex-wrap: ' . $layout['flexWrap'],
            '--button-width: ' . $button_width,
        ],
        $add_tyles
    );
    return array_merge(
        $block_attributes,
        [
            'attsJson' => wp_json_encode($block_attributes, JSON_PRETTY_PRINT),
            'content'  => $content,
            'layout'   => $block_attributes['layout'],
            'styles'   => $styles,
        ]
    );
};
