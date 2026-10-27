<?php

/*
 * The controller is for processing attributes before they are passed to the blade template.
 * If you leave out the controller, the block's attributes and $content will be passed directly to the template.
 *
 * Alternatively, you can define a $render function, if you don't want to use blade templates.
 */
$controller = function ($block_attributes, $content) {
    $show_all = !empty($block_attributes['showAllFaqs']);
    $max_faqs = $show_all ? 0 : (int) ($block_attributes['maxFaqs'] ?? 60);
    $categories = !empty($block_attributes['categories']) && is_array($block_attributes['categories'])
        ? $block_attributes['categories']
        : [];
    $columns = isset($block_attributes['columns']) ? (int) $block_attributes['columns'] : 1;
    $columns = max(1, min(3, $columns));

    $faq_ids = \dhsv\Faq::getIds($categories, $max_faqs, $show_all);
    $total_count = \dhsv\Faq::countIds($categories);
    $has_more = !$show_all && count($faq_ids) < $total_count;

    $show_all_button = !empty($block_attributes['showAllFaqsButton'])
        && !$show_all
        && $has_more;
    $all_faqs_url = $show_all_button ? \dhsv\Faq::getOverviewUrl($categories) : '';

    $faqs = array_map('get_post', $faq_ids);
    $faqs = array_filter($faqs);
    $faqs = collect($faqs)->map(function ($faq) {
        return [
            'id' => $faq->ID,
            'title' => $faq->post_title,
            'content' => apply_filters('the_content', $faq->post_content),
            'categories' => get_the_terms($faq->ID, 'faq_kategorie'),
        ];
    })->values()->all();

    $faq_columns = \dhsv\Faq::splitIntoColumns($faqs, $columns);

    return array_merge(
        $block_attributes,
        [
            'content' => $content,
            'faqs' => $faqs,
            'faq_columns' => $faq_columns,
            'columns' => $columns,
            'show_all_button' => $show_all_button,
            'all_faqs_url' => $all_faqs_url,
            'has_more' => $has_more,
        ]
    );
};
