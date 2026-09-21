"use strict";



const CONFIG = {

    minLength: 8,

    maxLength: 64,

    defaultLength: 16,

    characters: {

        uppercase:
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ",

        numbers:
            "0123456789",

        symbols:
            "!@#$%^&*()-_=+[]{}|;:,.<>?"
    }
};




const elements = {

    passwordOutput:
        document.getElementById(
            "passwordOutput"
        ),

    lengthRange:
        document.getElementById(
            "lengthRange"
        ),

    lengthValue:
        document.getElementById(
            "lengthValue"
        ),

    uppercase:
        document.getElementById(
            "uppercase"
        ),

    numbers:
        document.getElementById(
            "numbers"
        ),

    symbols:
        document.getElementById(
            "symbols"
        ),

    generateBtn:
        document.getElementById(
            "generateBtn"
        ),

    clearBtn:
        document.getElementById(
            "clearBtn"
        ),

    copyBtn:
        document.getElementById(
            "copyBtn"
        ),

    visibilityToggle:
        document.getElementById(
            "visibilityToggle"
        ),

    themeToggle:
        document.getElementById(
            "themeToggle"
        ),

    themeIcon:
        document.getElementById(
            "themeIcon"
        ),

    strengthText:
        document.getElementById(
            "strengthText"
        ),

    strengthFill:
        document.getElementById(
            "strengthFill"
        ),

    strengthDescription:
        document.getElementById(
            "strengthDescription"
        ),

    statusBadge:
        document.getElementById(
            "statusBadge"
        ),

    copyMessage:
        document.getElementById(
            "copyMessage"
        ),

    toast:
        document.getElementById(
            "toast"
        )
};



const state = {

    password: "",

    passwordVisible: true,

    theme:
        localStorage.getItem(
            "password-generator-theme"
        ) || "light"
};



function secureRandomInt(max) {

    if (
        !Number.isInteger(max) ||
        max <= 0
    ) {
        throw new Error(
            "Invalid random range."
        );
    }


    const maxUint32 = 0xFFFFFFFF;

    const limit =
        maxUint32 -
        (maxUint32 % max);

    const buffer =
        new Uint32Array(1);

    let randomNumber;


    do {

        crypto.getRandomValues(
            buffer
        );

        randomNumber =
            buffer[0];

    } while (
        randomNumber >= limit
    );


    return randomNumber % max;
}



function randomCharacter(characters) {

    const index =
        secureRandomInt(
            characters.length
        );

    return characters[index];
}



function secureShuffle(array) {

    const result = [...array];


    for (
        let i = result.length - 1;
        i > 0;
        i--
    ) {

        const j =
            secureRandomInt(i + 1);


        [
            result[i],
            result[j]
        ] = [
            result[j],
            result[i]
        ];
    }


    return result;
}



function getSelectedSets() {

    const sets = [];


    if (
        elements.uppercase.checked
    ) {

        sets.push(
            CONFIG.characters.uppercase
        );
    }


    if (
        elements.numbers.checked
    ) {

        sets.push(
            CONFIG.characters.numbers
        );
    }


    if (
        elements.symbols.checked
    ) {

        sets.push(
            CONFIG.characters.symbols
        );
    }


    return sets;
}



function generatePassword() {

    const length =
        Number(
            elements.lengthRange.value
        );


    const selectedSets =
        getSelectedSets();


    if (
        selectedSets.length === 0
    ) {

        updateStatus(
            "Select a type",
            "warning"
        );

        showToast(
            "Select at least one character type."
        );

        return;
    }


    if (
        length < selectedSets.length
    ) {

        updateStatus(
            "Invalid length",
            "warning"
        );

        showToast(
            "Increase the password length."
        );

        return;
    }


    const characters = [];


    /*
     * Guarantee at least one character
     * from every selected category.
     */

    for (
        const characterSet
        of selectedSets
    ) {

        characters.push(
            randomCharacter(
                characterSet
            )
        );
    }


    /*
     * Create combined pool.
     */

    const pool =
        selectedSets.join("");


    /*
     * Fill remaining characters.
     */

    while (
        characters.length < length
    ) {

        characters.push(
            randomCharacter(
                pool
            )
        );
    }


    /*
     * Secure shuffle.
     */

    const password =
        secureShuffle(
            characters
        ).join("");


    state.password =
        password;

    state.passwordVisible =
        true;


    updatePasswordDisplay();

    updateStrength(password);

    updateStatus(
        "Generated",
        "success"
    );


    elements.copyMessage.textContent =
        "";


    animatePassword();
}



function updatePasswordDisplay() {

    elements.passwordOutput.type =
        state.passwordVisible
            ? "text"
            : "password";


    elements.passwordOutput.value =
        state.password;


    elements.passwordOutput.placeholder =
        "Generate a password";


    elements.visibilityToggle.setAttribute(
        "aria-label",
        state.passwordVisible
            ? "Hide password"
            : "Show password"
    );
}



function toggleVisibility() {

    if (!state.password) {

        showToast(
            "Generate a password first."
        );

        return;
    }


    state.passwordVisible =
        !state.passwordVisible;


    updatePasswordDisplay();
}



async function copyPassword() {

    if (!state.password) {

        showToast(
            "Generate a password first."
        );

        return;
    }


    try {

        await navigator.clipboard.writeText(
            state.password
        );


        elements.copyMessage.textContent =
            "Copied to clipboard.";


        showToast(
            "Password copied."
        );


        setTimeout(() => {

            elements.copyMessage.textContent =
                "";

        }, 1800);


    } catch (error) {

        fallbackCopy();
    }
}



function fallbackCopy() {

    const input =
        elements.passwordOutput;


    input.select();

    input.setSelectionRange(
        0,
        input.value.length
    );


    try {

        document.execCommand(
            "copy"
        );


        elements.copyMessage.textContent =
            "Copied to clipboard.";


        showToast(
            "Password copied."
        );

    } catch (error) {

        showToast(
            "Copy failed."
        );
    }


    window.getSelection()
        ?.removeAllRanges();
}



function clearPassword() {

    state.password = "";

    state.passwordVisible = true;


    elements.passwordOutput.value =
        "";

    elements.passwordOutput.type =
        "text";


    elements.copyMessage.textContent =
        "";


    elements.strengthText.textContent =
        "—";


    elements.strengthText.className =
        "";


    elements.strengthFill.style.width =
        "0%";


    elements.strengthFill.className =
        "";


    elements.strengthDescription.textContent =
        "Generate a password to see its strength.";


    updateStatus(
        "Ready"
    );


    showToast(
        "Password cleared."
    );
}



function calculateStrength(password) {

    if (!password) {

        return {

            score: 0,

            label: "—",

            description:
                "Generate a password to see its strength."
        };
    }


    let score = 0;


    /*
     * Length
     */

    if (
        password.length >= 8
    ) {
        score++;
    }


    if (
        password.length >= 12
    ) {
        score++;
    }


    if (
        password.length >= 20
    ) {
        score++;
    }


    if (
        password.length >= 32
    ) {
        score++;
    }


    /*
     * Uppercase
     */

    if (
        /[A-Z]/.test(password)
    ) {
        score++;
    }


    /*
     * Numbers
     */

    if (
        /[0-9]/.test(password)
    ) {
        score++;
    }


    /*
     * Symbols
     */

    if (
        /[^A-Z0-9]/.test(password)
    ) {
        score++;
    }


    /*
     * Character uniqueness
     */

    const unique =
        new Set(password).size;


    const uniqueness =
        unique / password.length;


    if (
        uniqueness >= 0.65
    ) {
        score++;
    }


    /*
     * Result
     */

    if (score <= 3) {

        return {

            score,

            label: "Weak",

            description:
                "Short or limited character diversity."
        };
    }


    if (score <= 5) {

        return {

            score,

            label: "Medium",

            description:
                "Reasonable complexity with room for improvement."
        };
    }


    if (score <= 7) {

        return {

            score,

            label: "Strong",

            description:
                "Good length and character diversity."
        };
    }


    return {

        score,

        label: "Very Strong",

        description:
            "Long password with strong character diversity."
    };
}



function updateStrength(password) {

    const result =
        calculateStrength(
            password
        );


    elements.strengthText.textContent =
        result.label;


    elements.strengthDescription.textContent =
        result.description;


    const percentage =
        result.score === 0
            ? 0
            : Math.min(
                100,
                (result.score / 8) * 100
            );


    elements.strengthFill.style.width =
        `${percentage}%`;


    elements.strengthText.className =
        "";


    elements.strengthFill.className =
        "";


    if (
        result.label === "Weak"
    ) {

        elements.strengthText.classList.add(
            "strength-weak"
        );

        elements.strengthFill.classList.add(
            "strength-weak"
        );

    } else if (
        result.label === "Medium"
    ) {

        elements.strengthText.classList.add(
            "strength-medium"
        );

        elements.strengthFill.classList.add(
            "strength-medium"
        );

    } else {

        elements.strengthText.classList.add(
            "strength-strong"
        );

        elements.strengthFill.classList.add(
            "strength-strong"
        );
    }
}



function updateStatus(
    text,
    type = ""
) {

    elements.statusBadge.textContent =
        text;


    elements.statusBadge.className =
        "status";


    if (type) {

        elements.statusBadge.classList.add(
            `status-${type}`
        );
    }
}



function updateLength() {

    elements.lengthValue.textContent =
        elements.lengthRange.value;
}



function validateOptions() {

    const sets =
        getSelectedSets();


    if (
        sets.length === 0
    ) {

        updateStatus(
            "Select a type",
            "warning"
        );

        return false;
    }


    updateStatus(
        "Ready"
    );


    return true;
}



function applyTheme(theme) {

    const dark =
        theme === "dark";


    document.body.classList.toggle(
        "dark",
        dark
    );


    /*
     * CSS-created icon changes naturally
     * without using emoji.
     */

    elements.themeIcon.style.transform =
        dark
            ? "rotate(180deg)"
            : "rotate(0deg)";
}


function toggleTheme() {

    state.theme =
        state.theme === "light"
            ? "dark"
            : "light";


    localStorage.setItem(
        "password-generator-theme",
        state.theme
    );


    applyTheme(
        state.theme
    );
}



function animatePassword() {

    elements.passwordOutput.classList.remove(
        "password-update"
    );


    void elements.passwordOutput.offsetWidth;


    elements.passwordOutput.classList.add(
        "password-update"
    );
}



let toastTimer;


function showToast(message) {

    elements.toast.textContent =
        message;


    elements.toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(() => {

            elements.toast.classList.remove(
                "show"
            );

        }, 2200);
}




/*
 * IMPORTANT:
 *
 * Generate button is the ONLY place
 * that creates a new password.
 */

elements.generateBtn.addEventListener(
    "click",
    generatePassword
);


/*
 * Clear password.
 */

elements.clearBtn.addEventListener(
    "click",
    clearPassword
);


/*
 * Length slider ONLY changes the number.
 *
 * It DOES NOT generate a password.
 */

elements.lengthRange.addEventListener(
    "input",
    updateLength
);


/*
 * Character options ONLY validate
 * the current selection.
 *
 * They DO NOT generate a password.
 */

elements.uppercase.addEventListener(
    "change",
    validateOptions
);


elements.numbers.addEventListener(
    "change",
    validateOptions
);


elements.symbols.addEventListener(
    "change",
    validateOptions
);


/*
 * Copy
 */

elements.copyBtn.addEventListener(
    "click",
    copyPassword
);


/*
 * Visibility
 */

elements.visibilityToggle.addEventListener(
    "click",
    toggleVisibility
);


/*
 * Theme
 */

elements.themeToggle.addEventListener(
    "click",
    toggleTheme
);



document.addEventListener(
    "keydown",
    event => {

        /*
         * Ctrl + Enter
         * = Generate
         */

        if (
            event.ctrlKey &&
            event.key === "Enter"
        ) {

            event.preventDefault();

            generatePassword();
        }


        /*
         * Escape
         * = Clear
         */

        if (
            event.key === "Escape"
        ) {

            clearPassword();
        }
    }
);



function initialize() {

    elements.lengthRange.value =
        CONFIG.defaultLength;


    updateLength();


    applyTheme(
        state.theme
    );


    /*
     * IMPORTANT:
     *
     * No password is generated
     * automatically on page load.
     */

    state.password = "";

    elements.passwordOutput.value =
        "";

    updateStrength("");

    updateStatus("Ready");
}


initialize();