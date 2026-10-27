<?php

$controller = function ($block_attributes, $content) {
    return array_merge(
        $block_attributes,
        [
            'content' => $content,
            'attributes' => [
                'allow_multiple' => $block_attributes['allowMultiple'] ?? false,
                'allow_url_update' => $block_attributes['allowUrlUpdate'] ?? false,
                'disable_scroll' => $block_attributes['disableScroll'] ?? false,
                'group_name' => $block_attributes['groupName'] ?? '',
                'active_background' => $block_attributes['activeBackground'] ?? 'solid',
            ],
        ]
    );
};
