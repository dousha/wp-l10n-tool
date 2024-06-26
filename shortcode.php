<?php

/**
 * @wordpress-plugin
 * Plugin Name: Daniel's Localization Tool
 * Plugin URI: https://git.dsstudio.com/dousha/wp-l10n-tool
 * Description: A Simple Localization Tool
 * Version: 1.0.2
 * Author: dousha
 * Author URI: https://dsstudio.tech/
 * License: MIT
 */

if (!defined("ABSPATH")) {
    exit;
}

function d_l10n_add_shortcodes(): void
{
    add_shortcode('tr', 'd_l10n_translate_shortcode');
    add_shortcode('cl', 'd_l10n_color_shortcode');
}

function d_l10n_enque_assets(): void
{
    wp_enqueue_style('d-l10n-translate-style', plugins_url('/assets/css/style.css', __FILE__), [], '0.1.1');
    wp_enqueue_script('d-l10n-translate-script', plugins_url('/assets/js/work.js', __FILE__), [], '0.1.2');
}

function d_l10n_evaluate_truthiness($val): bool
{
    if (is_bool($val)) {
        return $val;
    }

    if (is_string($val)) {
        return $val === 'true' || $val === '1';
    }

    if (is_numeric($val)) {
        return $val > 0;
    }

    return false;
}

function d_l10n_compile_attributes($attr, $content): string
{
    if (empty($attr)) {
        return 'data-ref="' . $content . '"';
    }

    $original = $attr['o'];
    $translated = $attr['p'];
    if (empty($translated)) {
        $translated = $content;
    }

    $isEntity = $attr['e'];
    if (empty($isEntity)) {
        $isEntity = $attr['ent'];
    }
    $isEntity = d_l10n_evaluate_truthiness($isEntity);

    $isManuscript = $attr['m'];
    if (empty($isManuscript)) {
        $isManuscript = $attr['man'];
    }
    $isManuscript = d_l10n_evaluate_truthiness($isManuscript);

    $canonicalName = $attr['cn'];

    $fullForm = $attr['a'];
    $ruby = $attr['r'];
    if (empty($ruby)) {
        $ruby = $attr['ruby'];
    }
    if (empty($ruby)) {
        $ruby = $attr['pro'];
    }

    $isUntranslatable = $attr['u'];
    if (empty($isUntranslatable)) {
        $isUntranslatable = $attr['un'];
    }
    $isUntranslatable = d_l10n_evaluate_truthiness($isUntranslatable);

    // ok, now compile stuff
    $compiled = '';
    if (!empty($original)) {
        $compiled .= "data-original=\"" . $original . "\" ";
    }

    if (!empty($translated)) {
        $compiled .= "data-translated=\"" . $translated . "\" ";
    }

    if ($isEntity) {
        $compiled .= "data-entity=\"true\" ";
    }

    if ($isManuscript) {
        $compiled .= "data-manuscript=\"true\" ";
    }

    if (!empty($canonicalName)) {
        $compiled .= "data-canonical-name=\"" . $canonicalName . "\" ";
    }

    if ($fullForm) {
        $compiled .= "data-full-form=\"" . $fullForm . "\" ";
    }

    if ($ruby) {
        $compiled .= "data-ruby=\"" . $ruby . "\" ";
    }

    if ($isUntranslatable) {
        $compiled .= "data-untranslatable=\"true\" ";
    }

    return $compiled;
}

function d_l10n_translate_shortcode($attr = array(), $content = null, $tag = ''): ?string
{
    if (is_null($content)) {
        return "";
    }

    $compiledAttributes = d_l10n_compile_attributes($attr, $content);

    return "<span class=\"d-l10n-translate-template\" " . $compiledAttributes . ">" . $content . "</span>";
}

function d_l10n_color_shortcode($attr = array(), $content = null, $tag = ''): ?string
{
    $color = $attr['v'];
    if (empty($color)) {
        return '<span class="d-l10n-color">' . $content . '</span>';
    }

    return '<span class="d-l10n-color" data-color="' . $color . '">' . $content . '</span>';
}

add_action('init', 'd_l10n_add_shortcodes');
add_action('init', 'd_l10n_enque_assets');
