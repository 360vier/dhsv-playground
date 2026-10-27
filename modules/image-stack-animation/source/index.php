<?php

/*
 * The controller prepares attributes for the blade template.
 * Ensures composition layers are ordered and default image is set for frontend.
 */
$controller = function ($block_attributes, $content) {
    $images = $block_attributes['images'] ?? [];
    $composition_layers = $block_attributes['compositionLayers'] ?? [];

    $layers = [];
    if (!empty($composition_layers)) {
        foreach ($composition_layers as $layer) {
            if (isset($layer['isOnCanvas']) && $layer['isOnCanvas'] === false) {
                continue;
            }
            $layers[] = [
                'id' => $layer['id'] ?? '',
                'url' => $layer['url'] ?? '',
                'alt' => $layer['alt'] ?? '',
                'isDefault' => !empty($layer['isDefault']),
                'top' => isset($layer['top']) ? (float) $layer['top'] : 50,
                'left' => isset($layer['left']) ? (float) $layer['left'] : 50,
                'width' => isset($layer['width']) ? (float) $layer['width'] : 20,
                'height' => isset($layer['height']) ? (float) $layer['height'] : 20,
            ];
        }
    } else {
        foreach ($images as $index => $img) {
            $id = isset($img['id']) ? (string) $img['id'] : '';
            $url = $img['url'] ?? '';
            if ($url === '' && $id !== '') {
                $media = get_post($id);
                if ($media && $media->post_type === 'attachment') {
                    $url = wp_get_attachment_image_url((int) $id, 'full');
                }
            }
            $layers[] = [
                'id' => $id,
                'url' => $url,
                'alt' => $img['alt'] ?? '',
                'isDefault' => $index === 0,
                'top' => 50,
                'left' => 50,
                'width' => 20,
                'height' => 20,
            ];
        }
    }

    $default_index = 0;
    foreach (array_keys($layers) as $i) {
        if (!empty($layers[$i]['isDefault'])) {
            $default_index = $i;
            break;
        }
    }

    return array_merge(
        $block_attributes,
        [
            'content' => $content,
            'layers' => $layers,
            'defaultIndex' => $default_index,
        ]
    );
};
