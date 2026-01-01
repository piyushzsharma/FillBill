chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'autofill') {
        fillForm(request.data);
    }
});


// Listen for custom event from popup (supports all_frames triggering via scripting)
window.addEventListener('SMART_BILLING_AUTOFILL_TRIGGER', (event) => {
    if (event.detail) {
        fillForm(event.detail);
    }
});


async function fillForm(data) {
    console.log("------- SMART BILLING AUTOFILL STARTED -------");
    let inputs = Array.from(document.querySelectorAll('input, select, textarea'));
    let filledCount = 0;

    // 1. Separate Project Code, Bill Owner, Delayed Fields, and Others
    const projectKeys = Object.keys(data).filter(k => /(user)?project\s*code/i.test(k));
    const billOwnerKeys = Object.keys(data).filter(k => /bill\s*owner\s*name/i.test(k));

    // New delayed fields requested by user
    const finalKeys = Object.keys(data).filter(k => /partName|salHeadparticular/i.test(k));

    const otherKeys = Object.keys(data).filter(k =>
        !/(user)?project\s*code/i.test(k) &&
        !/bill\s*owner\s*name/i.test(k) &&
        !/partName|salHeadparticular/i.test(k)
    );

    // 2. Fill Project Code First
    for (const key of projectKeys) {
        if (!data[key]) continue;
        const input = findBestInputMatch(inputs, key);
        if (input) {
            console.log(`✅ MATCH FOUND for "${key}" (Project Code):`, input);
            await applyValueToInput(input, data[key], key);
            filledCount++;
        }
    }

    // 3. Wait 2 seconds if any project code was processed
    if (projectKeys.length > 0) {
        console.log("Waiting 2 seconds for Project Code to process...");
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Refresh inputs list as the page might have changed
        inputs = Array.from(document.querySelectorAll('input, select, textarea'));
    }

    // 4. Fill remaining fields (Standard)
    for (const key of otherKeys) {
        const value = data[key];
        if (!value) continue;

        const input = findBestInputMatch(inputs, key);

        if (input) {
            console.log(`✅ MATCH FOUND for "${key}":`, input);
            await applyValueToInput(input, value, key);
            filledCount++;
        } else {
            console.warn(`❌ NO MATCH FOUND for column: ${key}`);
        }
    }

    // 5. Fill Bill Owner
    for (const key of billOwnerKeys) {
        if (!data[key]) continue;
        const input = findBestInputMatch(inputs, key);
        if (input) {
            console.log(`✅ MATCH FOUND for "${key}" (Bill Owner):`, input);
            await applyValueToInput(input, data[key], key);
            filledCount++;
        } else {
            console.warn(`❌ NO MATCH FOUND for Bill Owner: ${key}`);
        }
    }

    // 6. Fill Final Delayed Fields (partName, salHeadparticular)
    if (finalKeys.length > 0) {
        console.log("Waiting 1 second before filling final fields (partName, salHead)...");
        await new Promise(resolve => setTimeout(resolve, 1000));
        inputs = Array.from(document.querySelectorAll('input, select, textarea')); // Refresh again

        for (const key of finalKeys) {
            if (!data[key]) continue;
            const input = findBestInputMatch(inputs, key);
            if (input) {
                console.log(`✅ MATCH FOUND for "${key}" (Final Delayed):`, input);
                await applyValueToInput(input, data[key], key);
                filledCount++;
            } else {
                console.warn(`❌ NO MATCH FOUND for Final Field: ${key}`);
            }
        }
    }

    console.log(`Autofill Complete! Filled ${filledCount} fields.`);
}


function findBestInputMatch(inputs, key) {
    const cleanKey = key.trim().toLowerCase();
    const normalizedKey = cleanKey.replace(/[^a-z0-9]/g, ''); // e.g. "bill owner" -> "billowner"


    // 1. Exact ID/Name Match
    let match = inputs.find(i =>
        (i.name && i.name.toLowerCase() === cleanKey) ||
        (i.id && i.id.toLowerCase() === cleanKey)
    );
    if (match) return match;


    // 2. Normalized ID/Name Match (Solves "Bill Owner" -> "billOwnerName")
    match = inputs.find(i => {
        const id = (i.id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const name = (i.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return (id && id === normalizedKey) || (name && name === normalizedKey) ||
            (id && id.includes(normalizedKey)) || (name && name.includes(normalizedKey));
    });
    if (match) return match;


    // 3. Partial Original Match
    match = inputs.find(i =>
        (i.name && i.name.toLowerCase().includes(cleanKey)) ||
        (i.id && i.id.toLowerCase().includes(cleanKey))
    );
    if (match) return match;


    // 4. Label / Context Search
    // "ProjectCode" -> "project code"
    let searchLabel = key.replace(/([A-Z])/g, ' $1').trim().toLowerCase();
    if (searchLabel.startsWith('user ')) searchLabel = searchLabel.replace(/^user\s+/, '');


    const labels = document.querySelectorAll('label, span, div, td, th, b, strong');


    for (const el of labels) {
        // Check text content matches strictly enough
        const text = (el.innerText || "").toLowerCase().trim();
        if (text === searchLabel || (text.length < 50 && text.includes(searchLabel))) {


            // a. Wrapped Input
            const child = el.querySelector('input, select, textarea');
            if (child) return child;


            // b. Next Sibling
            let sibling = el.nextElementSibling;
            if (sibling) {
                if (sibling.matches('input, select, textarea')) return sibling;
                const deep = sibling.querySelector('input, select, textarea');
                if (deep) return deep;
            }


            // c. Next Table Cell (TD -> TD)
            const parentTd = el.closest('td');
            if (parentTd && parentTd.nextElementSibling) {
                const nextInput = parentTd.nextElementSibling.querySelector('input, select, textarea');
                if (nextInput) return nextInput;
            }
        }
    }


    return null;
}


async function applyValueToInput(input, value, key) {
    // 1. Handle Select (Dropdowns)
    if (input.tagName === 'SELECT') {
        const valStr = String(value).toLowerCase().trim();
        let matchedIndex = -1;


        // Strategy A: Exact Match (Value or Text)
        for (let i = 0; i < input.options.length; i++) {
            const opt = input.options[i];
            if (opt.value.toLowerCase() === valStr || opt.text.toLowerCase() === valStr) {
                matchedIndex = i;
                break;
            }
        }


        // Strategy B: Partial Match (Option text starts with value)
        // Useful for: "Vendor" -> "Vendor / Sponsor"
        if (matchedIndex === -1) {
            for (let i = 0; i < input.options.length; i++) {
                if (input.options[i].text.toLowerCase().startsWith(valStr)) {
                    matchedIndex = i;
                    break;
                }
            }
        }


        // Strategy C: Loose Match (Option text contains value)
        if (matchedIndex === -1) {
            for (let i = 0; i < input.options.length; i++) {
                if (input.options[i].text.toLowerCase().includes(valStr)) {
                    matchedIndex = i;
                    break;
                }
            }
        }


        if (matchedIndex !== -1) {
            input.selectedIndex = matchedIndex;
        }
    }
    // 2. Handle Date Inputs
    else if (input.type === 'date') {
        // Convert DD-MM-YYYY to YYYY-MM-DD if needed
        const ddmmyyyy = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/;
        const match = String(value).trim().match(ddmmyyyy);
        if (match) {
            input.value = `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
        } else {
            input.value = value;
        }
    }
    // 3. Handle Standard Inputs (Text, etc.)
    else {
        // Force write even if readonly
        if (input.hasAttribute('readonly')) {
            console.log("Removing readonly from:", input);
            input.removeAttribute('readonly');
        }

        // Special Slow Typing for Project Code
        if (/project\s*code/i.test(key)) {
            console.log("Typing Project Code slowly...");
            input.focus();
            input.value = '';

            const chars = String(value).split('');
            for (const char of chars) {
                input.value += char;
                // Dispatch basic events for regex/filtering listeners
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('keydown', { bubbles: true }));
                input.dispatchEvent(new Event('keyup', { bubbles: true }));

                // Wait 200ms between keystrokes
                await new Promise(r => setTimeout(r, 500));
            }
        } else {
            // Instant fill for other fields
            input.value = value;
        }
    }


    // Visual Feedback
    input.style.backgroundColor = '#d1fae5';
    input.style.border = '2px solid #10b981';


    // Dispatch Standard Events to notify React/Angular/Legacy apps
    // (Skip input/key events for Project Code as we just did them)
    // Project Code: Do NOT fire blur/change yet. We need focus for dropdown.
    if (!/project\s*code/i.test(key)) {
        ['click', 'focus', 'input', 'change', 'blur', 'keydown', 'keyup'].forEach(evt => {
            input.dispatchEvent(new Event(evt, { bubbles: true }));
        });
    }

    // --- SPECIAL HANDLING: Project Code & Bill Owner ---
    const lowerKey = key.toLowerCase();

    // A. Project Code Autocomplete
    if (/project\s*code/i.test(key) && input.type !== 'date') {
        await handleProjectCodeAutocomplete(input, value);
    }

    // B. Bill Owner (Handle Hidden Fields)
    // If the field is "billOwnerName", we try to be smart about the hidden code
    if ((lowerKey.includes('bill owner') || input.id === 'billOwnerName') && value) {
        // Find sibling hidden field for Code
        const codeInput = document.querySelector('input[name="billOwnerCode"]') || document.getElementById('billOwnerCode');

        // If value is numeric (e.g. 15005), put it in the code field
        if (codeInput && /^\d+$/.test(String(value).trim())) {
            console.log("Auto-filling hidden Bill Owner Code:", value);
            codeInput.value = value;
        }
    }
}


async function handleProjectCodeAutocomplete(input, value) {
    try {
        console.log('[SmartBilling] Triggering Autocomplete Logic for:', value);
        input.focus();

        // 1. Simulate Interaction (Arrow Key) to wake up the dropdown
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', keyCode: 40, bubbles: true }));
        input.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown', keyCode: 40, bubbles: true }));

        // 2. Short wait for dropdown
        await new Promise(r => setTimeout(r, 500));

        // 3. Attempt to find and click the exact match in the DOM
        const candidates = document.querySelectorAll('li, tr, div, a, span, td');
        const target = String(value).trim().toLowerCase();
        let clicked = false;

        for (const el of candidates) {
            if (!el.offsetParent) continue; // Skip hidden
            // Avoid clicking the input itself
            if (el === input || el.contains(input)) continue;

            const text = (el.innerText || "").trim().toLowerCase();
            // Match exact or starts-with
            if ((text === target || (text.startsWith(target) && text.length < target.length + 30))) {
                console.log('[SmartBilling] Clicking Autocomplete Candidate:', el);
                el.click();
                clicked = true;
                break;
            }
        }

        // 4. Verify & Persist
        // If we clicked, wait a moment then blur.
        if (clicked) {
            await new Promise(r => setTimeout(r, 200));
        }

        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.blur();

        // 5. Final Safety Check: If it got erased, put it back!
        setTimeout(() => {
            if (!input.value) {
                console.log("[SmartBilling] Project Code was erased. Restoring value...");
                input.value = value;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
                input.blur();
            }
        }, 1000);

    } catch (e) {
        console.error("Autocomplete error:", e);
    }
}



