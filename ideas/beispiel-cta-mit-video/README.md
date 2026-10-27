# Beispiel: CTA mit Video

> Pilot-Idee: CTA-Modul bekommt optional ein Video statt Bild und einen zweiten Button.

## Ziel

Pilot für den Playground-Ablauf. Der CTA wirkt persönlicher, wenn statt des Porträts ein kurzes, stummes Video läuft. Ein zweiter Button bietet direkt einen Termin an.

## Beschreibung

Ein CTA-Modul am Ende der Agentur-Seite (Kopie der Live-Seite).

- Ist `video.url` gesetzt, läuft das Video in der runden Bildfläche (autoplay, muted, loop, playsinline). `video.poster` wird als Standbild gezeigt.
- Der zweite Button (`secondaryLink` + `secondaryLinkText`) erscheint vor dem Primär-Button als `dhsv-button secondary`.
- Mobil gilt dasselbe Verhalten wie beim Bild.

## Entscheidungen

- Das Video ersetzt das Bild, beide gleichzeitig gibt es nicht.

## Offene Fragen

- Video bei `prefers-reduced-motion` pausieren? (Vorschlag: ja, nur Poster zeigen)

## Umsetzung im Theme

Wird von Claude bei jeder Änderung gepflegt – das ist die Übergabe an die Entwicklung.

| Was | Wo im Theme | Hinweis |
| --- | --- | --- |
| Attribute `video` {url, poster}, `secondaryLink`, `secondaryLinkText` | `resources/assets/gutenberg/blocks/cta/block.json` | Defaults wie im Playground-Diff |
| `<video>` statt `<img>`, zweiter Button | `…/cta/index.blade.php` | Diff `template.njk` 1:1 übertragbar |
| `.image--video` | `…/cta/style.scss` | nur `object-fit` und Hintergrund-Token |
| Editor-Controls | `…/cta/controls/` | MediaUpload (Video, Poster), LinkControl für secondaryLink |
| WPML | `dhsv_wpml_block_link_attributes` | `secondaryLink` registrieren (Link-Attribut!) |
| LCP | – | nicht zutreffend (CTA ist nicht above the fold) |
