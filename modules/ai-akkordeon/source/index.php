<?php

$controller = function ($block_attributes, $content) {
    $page_url = '';
    if (is_singular()) {
        $permalink = get_permalink();
        if ($permalink && !is_wp_error($permalink)) {
            $page_url = (string) $permalink;
        }
    }

    $meta = \dhsv\AiView::normalizeBlockAttrs($block_attributes, $page_url);
    $meta_pairs = \dhsv\AiView::metadataPairs($meta);

    $data_attrs = [
        'data-ai-view' => 'true',
    ];

    if ($meta['pageType'] !== '') {
        $data_attrs['data-page-type'] = $meta['pageType'];
    }
    if ($meta['pagePillar'] !== '') {
        $data_attrs['data-page-pillar'] = $meta['pagePillar'];
    }
    if ($meta['pageUrl'] !== '') {
        $data_attrs['data-page-url'] = $meta['pageUrl'];
    }
    if ($meta['serves'] !== '') {
        $data_attrs['data-serves'] = $meta['serves'];
    }
    if ($meta['relation'] !== '') {
        $data_attrs['data-relation'] = $meta['relation'];
    }
    if ($meta['provides'] !== []) {
        $data_attrs['data-provides'] = implode('|', $meta['provides']);
    }

    return array_merge(
        $block_attributes,
        [
            'content' => $content,
            'attributes' => [
                'summary_lead' => $meta['summaryLead'],
                'summary_text' => $meta['summaryText'],
                'initially_open' => $block_attributes['initiallyOpen'] ?? false,
                'item_id' => $block_attributes['itemId'] ?? '',
                'align' => $block_attributes['align'] ?? '',
                'meta_pairs' => $meta_pairs,
                'data_attrs' => $data_attrs,
            ],
        ]
    );
};
