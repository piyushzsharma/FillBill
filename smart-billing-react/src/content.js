
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'autofill') {
        fillForm(request.data);
    }
});

function fillForm(data) {
    console.log("------- SMART BILLING AUTOFILL STARTED -------");
    console.log("Data received:", data);

    // Find all inputs on the page
    const inputs = document.querySelectorAll('input, select, textarea');
    let filledCount = 0;

    // Loop through each column in our CSV data
    Object.keys(data).forEach(key => {
        const value = data[key];
        if (!value) return;

        console.log(`Processing Key: "${key}", Value: "${value}"`);
        let foundInput = null;
        let method = "";

        // --- Strategy 1: Direct ID or Name Match ---
        for (const input of inputs) {
            const nameMatch = input.name && input.name.toLowerCase() === key.toLowerCase();
            const idMatch = input.id && input.id.toLowerCase() === key.toLowerCase();
            // Also try partial match if exact match fails, but be careful
            const partialName = input.name && input.name.toLowerCase().includes(key.toLowerCase());

            if (nameMatch || idMatch) {
                foundInput = input;
                method = "Exact ID/Name Match";
                break;
            }
        }

        // If exact match failed, try lax partial match on ID/Name
        if (!foundInput) {
            for (const input of inputs) {
                if (input.name && input.name.toLowerCase().includes(key.toLowerCase()) ||
                    input.id && input.id.toLowerCase().includes(key.toLowerCase())) {
                    foundInput = input;
                    method = "Partial ID/Name Match";
                    break;
                }
            }
        }

        // --- Strategy 2: Smart Label Search ---
        if (!foundInput) {
            // "ProjectCode" -> "project code"
            const searchLabel = key.replace(/([A-Z])/g, ' $1').trim().toLowerCase();
            console.log(`   Searching for label text: "${searchLabel}"`);

            const labels = document.querySelectorAll('label, span, div, td, th');
            for (const el of labels) {
                if (foundInput) break;

                // Check text content matches
                if (el.innerText && el.innerText.toLowerCase().includes(searchLabel)) {

                    // Case A: Next Sibling (Label -> Input)
                    let sibling = el.nextElementSibling;
                    if (sibling && (sibling.tagName === 'INPUT' || sibling.tagName === 'SELECT')) {
                        foundInput = sibling;
                        method = "Sibling Label Match";
                        break;
                    }

                    // Case B: Table Cell (TD -> Next TD -> Input)
                    const parentTd = el.closest('td');
                    if (parentTd) {
                        const nextTd = parentTd.nextElementSibling;
                        if (nextTd) {
                            const inputInNextTd = nextTd.querySelector('input, select, textarea');
                            if (inputInNextTd) {
                                foundInput = inputInNextTd;
                                method = "Table Row Match";
                                break;
                            }
                        }
                    }

                    // Case C: Implicit Label (Label contains Input)
                    const childInput = el.querySelector('input, select');
                    if (childInput) {
                        foundInput = childInput;
                        method = "Implicit Label Match";
                        break;
                    }
                }
            }
        }

        if (foundInput) {
            console.log(`   ✅ MATCH FOUND via ${method}:`, foundInput);
            applyValueToInput(foundInput, value);
            filledCount++;
        } else {
            console.warn(`   ❌ NO MATCH FOUND for column: ${key}`);
        }
    });

    if (filledCount > 0) {
        console.log(`Autofill Complete! Filled ${filledCount} fields.`);
    } else {
        console.warn("Autofill ran but could not find matches for any fields on this page.");
    }
}

function applyValueToInput(input, value) {
    // 1. Handle Date
    if (input.type === 'date') {
        const ddmmyyyy = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/;
        const match = String(value).trim().match(ddmmyyyy);
        if (match) {
            input.value = `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
        } else {
            input.value = value;
        }
    }
    // 2. Handle Select
    else if (input.tagName === 'SELECT') {
        let matched = false;
        // Text Match
        for (let i = 0; i < input.options.length; i++) {
            if (input.options[i].text.toLowerCase().includes(String(value).toLowerCase())) {
                input.selectedIndex = i;
                matched = true;
                break;
            }
        }
        // Value Match
        if (!matched) input.value = value;
    }
    // 3. Others
    else {
        input.value = value;
    }

    // Highlight and Trigger Events
    input.style.backgroundColor = '#d1fae5'; // light green
    input.style.border = '2px solid #10b981';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
}
