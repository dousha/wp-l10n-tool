function isCjkContext(str) {
    // since js regex does not support 5-digit hex unicode
    // we will have to check for the range ourselves

    // CJK Unified Ideographs
    const cjkRange1 = [0x4E00, 0x9FFF]
    // CJK Unified Ideographs Extension A
    const cjkRange2 = [0x3400, 0x4DBF]
    // CJK Unified Ideographs Extension B
    const cjkRange3 = [0x20000, 0x2A6DF]
    // CJK Unified Ideographs Extension C
    const cjkRange4 = [0x2A700, 0x2B73F]
    // CJK Unified Ideographs Extension D
    const cjkRange5 = [0x2B740, 0x2B81F]
    // CJK Unified Ideographs Extension E
    const cjkRange6 = [0x2B820, 0x2CEAF]
    // CJK Unified Ideographs Extension F
    const cjkRange7 = [0x2CEB0, 0x2EBEF]
    // CJK Unified Ideographs Extension G
    const cjkRange8 = [0x30000, 0x3134F]

    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        if ((char >= cjkRange1[0] && char <= cjkRange1[1]) ||
            (char >= cjkRange2[0] && char <= cjkRange2[1]) ||
            (char >= cjkRange3[0] && char <= cjkRange3[1]) ||
            (char >= cjkRange4[0] && char <= cjkRange4[1]) ||
            (char >= cjkRange5[0] && char <= cjkRange5[1]) ||
            (char >= cjkRange6[0] && char <= cjkRange6[1]) ||
            (char >= cjkRange7[0] && char <= cjkRange7[1]) ||
            (char >= cjkRange8[0] && char <= cjkRange8[1])) {
            return true
        }
    }

    return false
}

function setupControls() {
    const translationModeBox = document.getElementById('d-l10n-translation-mode')
    const annotationModeBox = document.getElementById('d-l10n-annotation-mode')

    if (translationModeBox == null) {
        console.error('d-l10n-translation-mode not found')
        return
    }

    if (annotationModeBox == null) {
        console.error('d-l10n-annotation-mode not found')
        return
    }

    const currentPreferredTranslation = getPreferredTranslation()
    translationModeBox.value = currentPreferredTranslation

    const currentPreferredAnnotation = getPreferredAnnotation()
    annotationModeBox.value = currentPreferredAnnotation

    translationModeBox.addEventListener('change', (event) => {
        changePreferredTranslation(event.target.value)
        processTranslationBoxes()
    })

    annotationModeBox.addEventListener('change', (event) => {
        changePreferredAnnotation(event.target.value)
        processTranslationBoxes()
    })
}

function processColorBoxes() {
    const allColorBoxes = document.querySelectorAll(".d-l10n-color");

    const knownColors = {}

    // first pass: collect all colors
    allColorBoxes.forEach((colorBox) => {
        const key = colorBox.innerHTML
        const value = colorBox.getAttribute('data-color')
        if (value == null || value.length < 1) {
            return;
        }

        knownColors[key] = value
    });

    // second pass: add a little box with the color
    allColorBoxes.forEach((colorBox) => {
        const key = colorBox.innerHTML
        const value = knownColors[key]
        if (value == null || value.length < 1) {
            return;
        }

        colorBox.innerHTML = `<span class="d-l10n-color-box" style="background-color: ${value}" title="${value}"></span> ${key}`
    });
}

function getPreferredTranslation() {
    if (localStorage) {
        return localStorage.getItem("d-l10n-preferred-translation") || 'writer'
    }

    return 'writer';
}

function changePreferredTranslation(mode) {
    // can be 'writer', 'canonical', 'original'
    if (mode !== 'writer' && mode !== 'canonical' && mode !== 'original') {
        mode = 'writer'
    }

    if (localStorage) {
        localStorage.setItem("d-l10n-preferred-translation", mode)
    }
}

function getPreferredAnnotation() {
    if (localStorage) {
        return localStorage.getItem("d-l10n-preferred-annotation") || 'none'
    }

    return 'none';
}

function changePreferredAnnotation(mode) {
    // can be 'none', 'parenthesis', 'ruby'
    if (mode !== 'none' && mode !== 'parenthesis' && mode !== 'ruby') {
        mode = 'none'
    }

    if (localStorage) {
        localStorage.setItem("d-l10n-preferred-annotation", mode)
    }
}

function processTranslationBoxes() {
    const boxes = document.querySelectorAll(".d-l10n-translate-template");

    const knownTranslations = {}

    // first pass: collect all translations
    boxes.forEach((box) => {
        const key = box.innerHTML
        const originalValue = box.getAttribute('data-original')
        const value = box.getAttribute('data-translated')
        const canonicalValue = box.getAttribute('data-canonical-name')
        const fullFormValue = box.getAttribute('data-full-form')
        const rubyValue = box.getAttribute('data-ruby')

        const isEntity = box.getAttribute('data-entity') === 'true'
        const isManuscript = box.getAttribute('data-manuscript') === 'true'
        const isUntranslatable = box.getAttribute('data-untranslatable') === 'true'

        if (originalValue == null || originalValue.length < 1) {
            return;
        }

        knownTranslations[key] = {
            original: originalValue,
            translated: value,
            canonical: canonicalValue,
            fullForm: fullFormValue,
            ruby: rubyValue,
            isEntity: isEntity,
            isManuscript: isManuscript,
            isUntranslatable: isUntranslatable
        }
    });

    const currentPreferredTranslation = getPreferredTranslation()

    // remove already generated boxes
    const generatedBoxes = document.querySelectorAll(".d-l10n-generated")
    generatedBoxes.forEach((box) => {
        box.remove()
    })

    // second pass: generate the preferred translation
    boxes.forEach((box) => {
        const key = box.innerHTML
        const translation = knownTranslations[key]
        if (translation == null) {
            return;
        }

        if (translation.isUntranslatable) {
            box.innerHTML = `<em>${translation.original}</em>`
            return;
        }

        let preferredTranslation

        if (currentPreferredTranslation === 'writer') {
            preferredTranslation = translation.translated
        } else if (currentPreferredTranslation === 'canonical') {
            preferredTranslation = translation.canonical || translation.translated
        } else if (currentPreferredTranslation === 'original') {
            preferredTranslation = translation.original
        }

        if (translation.isEntity) {
            if (isCjkContext(preferredTranslation)) {
                preferredTranslation = `<span class="d-l10n-translated-entity-name-cjk">${preferredTranslation}</span>`
            } else {
                preferredTranslation = `<span class="d-l10n-translated-entity-name">${preferredTranslation}</span>`
            }
        }

        if (translation.isManuscript) {
            if (isCjkContext(preferredTranslation)) {
                preferredTranslation = `<span class="d-l10n-translated-manuscript-name-cjk">${preferredTranslation}</span>`
            } else {
                preferredTranslation = `<span class="d-l10n-translated-manuscript-name">${preferredTranslation}</span>`
            }
        }

        if (translation.ruby) {
            preferredTranslation = `<ruby>${preferredTranslation}<rt>${translation.ruby}</rt></ruby>`
        }

        if (currentPreferredTranslation === 'original') {
            box.insertAdjacentHTML('afterend', `<span class="d-l10n-generated d-l10n-translated-original">${translation.original}</span>`)
        } else {
            box.insertAdjacentHTML('afterend', `<span class="d-l10n-generated d-l10n-translated" title="${translation.original}">${preferredTranslation}</span>`)
        }
    })
}

window.addEventListener("load", () => {
    setupControls()
    processColorBoxes()
    processTranslationBoxes()
});
