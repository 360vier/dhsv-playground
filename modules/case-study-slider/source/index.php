<?php

use dhsv\Client;

$controller = function ($block_attributes, $content) {
    $maxItems = isset($block_attributes['maxItems']) ? (int) $block_attributes['maxItems'] : 10;
    $maxItems = max(1, min(50, $maxItems));
    $postType = isset($block_attributes['postType']) ? sanitize_key($block_attributes['postType']) : 'case_study';
    $postType = in_array($postType, ['case_study', 'post'], true) ? $postType : 'case_study';

    $selectedPostIds = isset($block_attributes['caseStudyIds']) && is_array($block_attributes['caseStudyIds'])
        ? \dhsv\Wpml::objectIds(array_filter(array_map('intval', $block_attributes['caseStudyIds'])), $postType)
        : [];

    // On a single page of the same type the shown case/post is not suggested again.
    $currentPostId = is_singular($postType) ? (int) get_queried_object_id() : 0;
    $hadSelection = !empty($selectedPostIds);
    if ($currentPostId > 0) {
        $selectedPostIds = array_values(array_diff($selectedPostIds, [$currentPostId]));
    }

    $args = [
        'post_type' => $postType,
        'suppress_filters' => false,
        'posts_per_page' => $maxItems,
        'orderby' => 'date',
        'order' => $postType === 'post' ? 'DESC' : 'ASC',
        'post_status' => 'publish',
        'post__not_in' => $currentPostId > 0 ? [$currentPostId] : [],
    ];

    if (!empty($selectedPostIds)) {
        $args['post__in'] = $selectedPostIds;
        $args['orderby'] = 'post__in';
        $args['posts_per_page'] = count($selectedPostIds);
    } elseif (!empty($block_attributes['categories']) && is_array($block_attributes['categories'])) {
        $categoryIds = \dhsv\Wpml::objectIds(
            array_filter(array_map('intval', $block_attributes['categories'])),
            $postType === 'case_study' ? 'client_kategorie' : 'category'
        );
        if (!empty($categoryIds)) {
            if ($postType === 'case_study') {
                $args = Client::filterCaseStudiesByClientCategories($args, $categoryIds);
            } else {
                $args['category__in'] = $categoryIds;
            }
        }
        $args['posts_per_page'] = $maxItems;
    }

    // A manual selection that only contained the current post leaves nothing to show.
    $sliderPosts = $hadSelection && empty($selectedPostIds) ? [] : get_posts($args);

    return array_merge(
        $block_attributes,
        [
            'content' => $content,
            'posts' => $sliderPosts,
            'postType' => $postType,
        ]
    );
};
