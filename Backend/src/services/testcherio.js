/**
 * generic-visible-content-extractor.js
 *
 * A general-purpose "visible webpage content extractor" built on Cheerio.
 *
 * Goal: approximate what a normal user visually reads on a page,
 * without depending on any single website's class names or structure.
 *
 * Pipeline:
 *   1. fetchHTML()       -> raw HTML string (with realistic browser headers)
 *   2. loadAndClean()    -> cheerio instance with non-content nodes stripped
 *   3. findMainContent() -> best-guess container for the "real" content
 *   4. extractStructured() -> heading/paragraph/list-aware DOM walk
 *   5. normalizeText()   -> whitespace + noise cleanup
 *   6. scoreContent()    -> confidence score + diagnostics
 *
 * Dependencies: npm install axios cheerio
 */

const axios = require('axios');
const cheerio = require('cheerio');

// ---------------------------------------------------------------------------
// 1. FETCH
// ---------------------------------------------------------------------------

async function fetchHTML(url) {
    const { data } = await axios.get(url, {
        headers: {
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
                '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            Accept:
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 15000,
        maxRedirects: 5,
        validateStatus: (s) => s < 400,
    });
    return data;
}

// ---------------------------------------------------------------------------
// 2. STRIP NON-VISIBLE / NON-CONTENT NODES
// ---------------------------------------------------------------------------

// Tags that can NEVER contain user-visible page text, on any website.
const HARD_REMOVE_TAGS = [
    'script', 'style', 'noscript', 'svg', 'iframe', 'link', 'meta',
    'head', 'template', 'canvas', 'object', 'embed', 'form',
    'input', 'button', 'select', 'textarea', 'audio', 'video',
    'picture', 'source', 'map', 'area',
];

// Framework/hydration payload containers — these hold JSON or serialized
// data, not visible text, regardless of which framework or site produced them.
const FRAMEWORK_NOISE_SELECTORS = [
    'script#__NEXT_DATA__',
    '[type="application/json"]',
    '[type="application/ld+json"]',
    '[aria-hidden="true"]',
];

// Generic (NOT site-specific) keyword patterns that tend to mark UI chrome
// across unrelated sites: navigation, cookie banners, ads, popups, etc.
// This is pattern-based heuristics, not a selector list tied to one site.
const NOISE_PATTERN = new RegExp(
    [
        'nav', 'navbar', 'menu', 'breadcrumb',
        'footer', 'header', 'topbar',
        'cookie', 'consent', 'gdpr',
        'subscribe', 'newsletter',
        'advert', '\\bad\\b', 'sponsor', 'promo',
        'popup', 'modal', 'overlay', 'lightbox',
        'sidebar', 'widget',
        'social', 'share',
        'related', 'recommend',
        'comment',
        'skeleton', 'shimmer', 'placeholder',
        'toast', 'tooltip',
    ].join('|'),
    'i'
);

function isNoiseElement($, el) {
    const tag = el.tagName ? el.tagName.toLowerCase() : '';
    if (tag === 'nav' || tag === 'footer' || tag === 'header' || tag === 'aside') {
        return true; // generic HTML5 semantic chrome tags — not site-specific
    }
    const cls = $(el).attr('class') || '';
    const id = $(el).attr('id') || '';
    const role = $(el).attr('role') || '';
    if (role === 'navigation' || role === 'banner' || role === 'complementary') {
        return true;
    }
    return NOISE_PATTERN.test(cls) || NOISE_PATTERN.test(id);
}

function loadAndClean(html) {
    const $ = cheerio.load(html);

    HARD_REMOVE_TAGS.forEach((tag) => $(tag).remove());
    FRAMEWORK_NOISE_SELECTORS.forEach((sel) => {
        try {
            $(sel).remove();
        } catch (_) {
            /* ignore invalid selector combos on odd markup */
        }
    });

    // Remove obvious chrome/noise blocks via generic pattern match.
    $('*').each((_, el) => {
        if (isNoiseElement($, el)) $(el).remove();
    });

    // Strip HTML comments.
    $('*')
        .contents()
        .filter((_, node) => node.type === 'comment')
        .remove();

    return $;
}

// ---------------------------------------------------------------------------
// 3. FIND THE MAIN CONTENT CONTAINER (readability-style density scoring)
// ---------------------------------------------------------------------------

function textLength($, el) {
    return $(el).text().replace(/\s+/g, ' ').trim().length;
}

function linkDensity($, el) {
    const totalText = textLength($, el);
    if (totalText === 0) return 1;
    const linkText = $(el)
        .find('a')
        .toArray()
        .reduce((sum, a) => sum + textLength($, a), 0);
    return linkText / totalText;
}

/**
 * Scores every container-like element by how much substantial,
 * low-link-density text it holds, then returns the best candidate.
 * This mirrors the core idea behind Mozilla's Readability algorithm,
 * simplified for this use case.
 */
function findMainContent($) {
    const candidates = [];

    $('div, section, article, main').each((_, el) => {
        const text = textLength($, el);
        if (text < 200) return; // too small to be "the" content

        const density = linkDensity($, el);
        if (density > 0.5) return; // mostly links -> likely nav/listing chrome

        const paragraphish = $(el).find('p, li, h1, h2, h3, h4, h5, h6').length;
        const score = text * (1 - density) + paragraphish * 20;

        candidates.push({ el, score });
    });

    if (candidates.length === 0) return $('body'); // fallback: whole page

    candidates.sort((a, b) => b.score - a.score);
    return $(candidates[0].el);
}

// ---------------------------------------------------------------------------
// 4. STRUCTURE-PRESERVING TEXT EXTRACTION
// ---------------------------------------------------------------------------

function extractStructured($, root) {
    const lines = [];

    function walk(elWrapped) {
        const node = elWrapped[0] || elWrapped;
        if (!node) return;

        if (node.type === 'text') {
            const t = (node.data || '').replace(/\s+/g, ' ').trim();
            if (t) lines.push({ type: 'text', value: t });
            return;
        }

        const tag = node.tagName ? node.tagName.toLowerCase() : '';

        if (/^h[1-6]$/.test(tag)) {
            const t = $(node).text().replace(/\s+/g, ' ').trim();
            if (t) lines.push({ type: 'heading', level: Number(tag[1]), value: t });
            return; // don't descend into heading internals
        }

        if (tag === 'li') {
            const t = $(node).text().replace(/\s+/g, ' ').trim();
            if (t) lines.push({ type: 'listitem', value: t });
            return;
        }

        if (tag === 'p' || tag === 'blockquote') {
            const t = $(node).text().replace(/\s+/g, ' ').trim();
            if (t) lines.push({ type: 'paragraph', value: t });
            return;
        }

        if (tag === 'br') {
            lines.push({ type: 'break' });
            return;
        }

        // Generic container: recurse into children.
        $(node)
            .contents()
            .each((_, child) => walk($(child)));
    }

    walk(root);
    return lines;
}

function renderStructured(lines) {
    const out = [];
    for (const line of lines) {
        if (line.type === 'heading') {
            out.push('\n' + line.value.toUpperCase() + '\n');
        } else if (line.type === 'paragraph') {
            out.push(line.value);
        } else if (line.type === 'listitem') {
            out.push('- ' + line.value);
        } else if (line.type === 'text') {
            out.push(line.value);
        }
    }
    return out.join('\n');
}

// ---------------------------------------------------------------------------
// 5. WHITESPACE / NOISE NORMALIZATION
// ---------------------------------------------------------------------------

function normalizeText(text) {
    return text
        .replace(/\u00A0/g, ' ')     // non-breaking spaces
        .replace(/[ \t]+/g, ' ')     // collapse runs of spaces/tabs
        .replace(/\n{3,}/g, '\n\n')  // collapse 3+ blank lines to 1
        .split('\n')
        .map((l) => l.trim())
        .filter((l, i, arr) => !(l === '' && arr[i - 1] === ''))
        .join('\n')
        .trim();
}

// ---------------------------------------------------------------------------
// 6. VALIDATION / SCORING
// ---------------------------------------------------------------------------

function scoreContent(text) {
    const words = text.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const lines = text.split('\n').filter(Boolean);
    const avgLineLen = lines.length ? text.length / lines.length : 0;

    // Crude leftover-junk indicators.
    const junkPatterns = [
        /function\s*\(/, /\bvar\s+\w+\s*=/, /px;/, /#[0-9a-f]{3,6}\b/i,
        /\\u00[0-9a-f]{2}/i, /static\/chunks/, /self\.__next/,
    ];
    const junkHits = junkPatterns.reduce((n, re) => n + (re.test(text) ? 1 : 0), 0);

    let confidence = 0;
    if (wordCount > 50) confidence += 0.4;
    if (wordCount > 150) confidence += 0.2;
    if (avgLineLen > 20 && avgLineLen < 400) confidence += 0.2;
    if (junkHits === 0) confidence += 0.2;
    confidence -= junkHits * 0.15;
    confidence = Math.max(0, Math.min(1, confidence));

    return {
        wordCount,
        lineCount: lines.length,
        avgLineLen: Math.round(avgLineLen),
        junkHits,
        confidence: Number(confidence.toFixed(2)),
        isLikelyUsable: confidence >= 0.5 && wordCount >= 50,
    };
}

// ---------------------------------------------------------------------------
// PUBLIC API
// ---------------------------------------------------------------------------

async function extractVisibleContent(url) {
    const html = await fetchHTML(url);
    const $ = loadAndClean(html);
    const main = findMainContent($);
    const structured = extractStructured($, main);
    const rendered = renderStructured(structured);
    const clean = normalizeText(rendered);
    const diagnostics = scoreContent(clean);

    return { url, text: clean, diagnostics };
}

module.exports = {
    extractVisibleContent,
    loadAndClean,
    findMainContent,
    scoreContent,
};

// ---------------------------------------------------------------------------
// CLI usage: node generic-visible-content-extractor.js <url>
// ---------------------------------------------------------------------------
if (require.main === module) {
    const url = process.argv[2];
    if (!url) {
        console.error('Usage: node generic-visible-content-extractor.js <url>');
        process.exit(1);
    }
    extractVisibleContent(url)
        .then(({ text, diagnostics }) => {
            console.log('--- DIAGNOSTICS ---');
            console.log(diagnostics);
            console.log('\n--- EXTRACTED CONTENT ---\n');
            console.log(text);
        })
        .catch((err) => {
            console.error('Extraction failed:', err.message);
            process.exit(1);
        });
}