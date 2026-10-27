<?php

/*
 * The controller is for processing attributes before they are passed to the blade template.
 * If you leave out the controller, the block's attributes and $content will be passed directly to the template.
 *
 * Alternatively, you can define a $render function, if you don't want to use blade templates.
 */
$allowed_inline_html = [
    'a' => ['href' => true, 'target' => true, 'rel' => true],
    'strong' => [],
    'em' => [],
    'br' => [],
];

$controller = function ($block_attributes, $content) use ($allowed_inline_html) {
    $items = array_map(function ($item) use ($allowed_inline_html) {
        // Inline links/bold/italic are allowed in the text; everything else is stripped.
        foreach (['headline', 'content'] as $field) {
            if (isset($item[$field]) && is_string($item[$field])) {
                $item[$field] = wp_kses($item[$field], $allowed_inline_html);
            }
        }

        if (empty($item['useCustomIcon']) || empty($item['customIconImage'])) {
            return $item;
        }

        $resolved = dhsv\Media::withMediaLibraryImageData(
            ['customIconImage' => $item['customIconImage']],
            ['customIconImage']
        );

        $item['customIconImage'] = $resolved['customIconImage'];

        return $item;
    }, $block_attributes['items'] ?? []);

    $props = array_merge($block_attributes, [
        'items' => $items,
    ]);

    return array_merge(
        $block_attributes,
        [
            'props' => wp_json_encode($props),
            'content' => $content,
        ]
    );
};
