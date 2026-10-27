<?php

/*
 * Controller for team-contact block.
 * Resolves team member: URL parameter (if enabled) or fallback from block attributes.
 */
$controller = function ($block_attributes, $content) {
    $fallback_team_id = \dhsv\Wpml::objectId(
        isset($block_attributes['teamId']) ? intval($block_attributes['teamId']) : 0,
        'mitarbeiter'
    );
    $allow_url_override = !empty($block_attributes['allowUrlOverride']);

    $team_id = $fallback_team_id;

    if ($allow_url_override) {
        $url_team_id = isset($_GET['team_id']) ? intval($_GET['team_id']) : 0;
        if ($url_team_id > 0) {
            $team_id = \dhsv\Wpml::objectId($url_team_id, 'mitarbeiter');
        }
    }

    $team_member = null;

    if ($team_id > 0) {
        $post = get_post($team_id);
        if ($post && $post->post_type === 'mitarbeiter' && $post->post_status === 'publish') {
            $featured_image_id = get_post_thumbnail_id($team_id);
            $image_data = null;
            if ($featured_image_id) {
                $img_src = wp_get_attachment_image_src($featured_image_id, 'medium');
                $alt_text = get_post_meta($featured_image_id, '_wp_attachment_image_alt', true);
                if ($img_src) {
                    $image_data = [
                        'url' => $img_src[0],
                        'alt' => $alt_text ?: get_the_title($team_id),
                        'width' => $img_src[1],
                        'height' => $img_src[2],
                    ];
                }
            }

            $vorname = get_field('vorname', $team_id);
            $nachname = get_field('nachname', $team_id);
            $title = trim(($vorname ?? '') . ' ' . ($nachname ?? '')) ?: get_the_title($team_id);

            $team_member = [
                'id' => $team_id,
                'title' => $title,
                'funktion' => get_field('funktion', $team_id) ?: null,
                'telefonnummer' => get_field('telefonnummer', $team_id) ?: null,
                'e_mail_adresse' => get_field('e-mail-adresse', $team_id) ?: null,
                'image' => $image_data,
            ];
        }
    }

    return array_merge(
        $block_attributes,
        [
            'content' => $content,
            'team_member' => $team_member,
        ]
    );
};
