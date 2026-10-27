<?php

/*
 * The controller is for processing attributes before they are passed to the blade template.
 * If you leave out the controller, the block's attributes and $content will be passed directly to the template.
 *
 * Alternatively, you can define a $render function, if you don't want to use blade templates.
 */
$controller = function ($block_attributes, $content) {
    $resolve_team_member = function (int $team_id): ?array {
        if ($team_id <= 0) {
            return null;
        }

        $post = \get_post($team_id);
        if (!$post || $post->post_type !== 'mitarbeiter' || $post->post_status !== 'publish') {
            return null;
        }

        $image_data = null;
        $featured_image_id = (int) \get_post_thumbnail_id($team_id);
        if ($featured_image_id > 0) {
            $image_src = \wp_get_attachment_image_src($featured_image_id, 'medium_large');
            $alt_text = (string) \get_post_meta($featured_image_id, '_wp_attachment_image_alt', true);

            if ($image_src) {
                $image_data = [
                    'url' => $image_src[0],
                    'alt' => $alt_text ?: \get_the_title($team_id),
                    'width' => $image_src[1],
                    'height' => $image_src[2],
                ];
            }
        }

        $first_name = \function_exists('get_field') ? (string) \get_field('vorname', $team_id) : '';
        $last_name = \function_exists('get_field') ? (string) \get_field('nachname', $team_id) : '';
        $name = \trim($first_name . ' ' . $last_name) ?: \get_the_title($team_id);

        return [
            'id' => $team_id,
            'name' => $name,
            'firstName' => $first_name,
            'position' => \function_exists('get_field') ? (string) \get_field('funktion', $team_id) : '',
            'email' => \function_exists('get_field') ? (string) \get_field('e-mail-adresse', $team_id) : '',
            'image' => $image_data,
        ];
    };

    $block_attributes = dhsv\Media::withMediaLibraryImageData($block_attributes, ['image']);
    $block_attributes['teamMember'] = $resolve_team_member((int) ($block_attributes['teamId'] ?? 0));
    $block_attributes['imagePosition'] = $block_attributes['imagePosition'] ?? 'left';

    return array_merge(
        $block_attributes,
        [
            'content' => $content,
        ]
    );
};
