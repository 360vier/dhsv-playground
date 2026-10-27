<?php

/*
 * The controller is for processing attributes before they are passed to the blade template.
 */
$controller = function ($block_attributes, $content, $block) {
    $block_attributes = dhsv\Media::withMediaLibraryImageData($block_attributes, ['image']);
    $footer_content = '';
    $stage_content = '';
    $inner_blocks = $block->parsed_block['innerBlocks'] ?? [];

    foreach ($inner_blocks as $inner_block) {
        $block_name = $inner_block['blockName'] ?? '';

        if ($block_name === 'dhsv/logoslider') {
            $footer_content .= render_block($inner_block);
            continue;
        }

        $stage_content .= render_block($inner_block);
    }

    if (!$inner_blocks && !$stage_content) {
        $stage_content = $content;
    }

    return array_merge(
        $block_attributes,
        [
            'content' => $stage_content,
            'footer_content' => $footer_content,
            'block' => $block,
        ]
    );
};

add_filter(
    'dhsv_block_lcp_image_id',
    function ($id, $block_name, $attrs) {
        if ($id || $block_name !== 'dhsv/stage') {
            return $id;
        }
        $image_id = $attrs['image']['id'] ?? null;
        if (!$image_id && !empty($attrs['image']['url'])) {
            $image_id = attachment_url_to_postid($attrs['image']['url']);
        }
        return $image_id ? (int) $image_id : $id;
    },
    10,
    3
);
