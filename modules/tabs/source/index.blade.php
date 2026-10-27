@php
    $tabsWrapperAttrs = [
        'id' => $uniqueId,
        'data-default-selected' => $defaultSelectedTab,
        'data-tabs-nav-direction' => $tabsNavDirection,
    ];
    if (! empty($theme ?? '')) {
        $tabsWrapperAttrs['data-tabs-theme'] = $theme;
    }
@endphp
<div {!! get_block_wrapper_attributes($tabsWrapperAttrs) !!}>
    <div class="wp-block-dhsv-tabs--container">
        <div class="wp-block-dhsv-tabs--navigation">
            {!! $content !!}
        </div>
        <div class="wp-block-dhsv-tabs--content"></div>
    </div>
</div>
