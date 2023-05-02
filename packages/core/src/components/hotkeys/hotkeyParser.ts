/*
 * Copyright 2016 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// alph sorting is unintuitive here
// tslint:disable object-literal-sort-keys

export interface KeyCodeTable {
    [code: number]: string;
}

export interface KeyCodeReverseTable {
    [key: string]: number;
}

export interface KeyMap {
    [key: string]: string;
}

/**
 * Named modifier keys
 *
 * @see https://www.w3.org/TR/uievents-key/#keys-modifier
 */
const MODIFIER_KEYS = new Set(["Shift", "Control", "Alt", "Meta"]);

export const MODIFIER_BIT_MASKS: KeyCodeReverseTable = {
    alt: 1,
    ctrl: 2,
    meta: 4,
    shift: 8,
};

export const CONFIG_ALIASES: KeyMap = {
    cmd: "meta",
    command: "meta",
    escape: "escape",
    minus: "-",
    mod: isMac() ? "meta" : "ctrl",
    option: "alt",
    plus: "+",
    return: "enter",
    win: "meta",
    // need these direction aliases for backwards-compatibility (but they're also convenient)
    up: "ArrowUp",
    left: "ArrowLeft",
    down: "ArrowDown",
    right: "ArrowRight",
};

export const SHIFT_KEYS: KeyMap = {
    "~": "`",
    "!": "1",
    "@": "2",
    "#": "3",
    $: "4",
    "%": "5",
    "^": "6",
    "&": "7",
    "*": "8",
    "(": "9",
    ")": "0",
    _: "-",
    "+": "=",
    "{": "[",
    "}": "]",
    "|": "\\",
    ":": ";",
    '"': "'",
    "<": ",",
    ">": ".",
    "?": "/",
};

export interface KeyCombo {
    key?: string;
    modifiers: number;
}

export function comboMatches(a: KeyCombo, b: KeyCombo) {
    return a.modifiers === b.modifiers && a.key === b.key;
}

/**
 * Converts a key combo string into a key combo object. Key combos include
 * zero or more modifier keys, such as `shift` or `alt`, and exactly one
 * action key, such as `A`, `enter`, or `left`.
 *
 * For action keys that require a shift, e.g. `@` or `|`, we inlude the
 * necessary `shift` modifier and automatically convert the action key to the
 * unshifted version. For example, `@` is equivalent to `shift+2`.
 */
export const parseKeyCombo = (combo: string): KeyCombo => {
    const pieces = combo.replace(/\s/g, "").toLowerCase().split("+");
    let modifiers = 0;
    let key: string | undefined;
    for (let piece of pieces) {
        if (piece === "") {
            throw new Error(`Failed to parse key combo "${combo}".
                Valid key combos look like "cmd + plus", "shift+p", or "!"`);
        }

        if (CONFIG_ALIASES[piece] !== undefined) {
            piece = CONFIG_ALIASES[piece];
        }

        if (MODIFIER_BIT_MASKS[piece] !== undefined) {
            modifiers += MODIFIER_BIT_MASKS[piece];
        } else if (SHIFT_KEYS[piece] !== undefined) {
            modifiers += MODIFIER_BIT_MASKS.shift;
            key = SHIFT_KEYS[piece];
        } else {
            key = piece.toLowerCase();
        }
    }
    return { modifiers, key };
};

/**
 * Converts a keyboard event into a valid combo prop string
 */
export const getKeyComboString = (e: KeyboardEvent): string => {
    const comboParts = [] as string[];

    // modifiers first
    if (e.ctrlKey) {
        comboParts.push("ctrl");
    }
    if (e.altKey) {
        comboParts.push("alt");
    }
    if (e.shiftKey) {
        comboParts.push("shift");
    }
    if (e.metaKey) {
        comboParts.push("meta");
    }

    if (e.key !== undefined && !MODIFIER_KEYS.has(e.key)) {
        comboParts.push(e.key.toLowerCase());
    }

    return comboParts.join(" + ");
};

/**
 * Determines the key combo object from the given keyboard event. Again, a key
 * combo includes zero or more modifiers (represented by a bitmask) and one
 * action key, which we determine from the `e.key` property of the keyboard
 * event.
 */
export const getKeyCombo = (e: KeyboardEvent): KeyCombo => {
    let key: string | undefined;
    if (MODIFIER_KEYS.has(e.key)) {
        // keep key undefined
    } else {
        key = e.key?.toLowerCase();
    }

    let modifiers = 0;
    if (e.altKey) {
        modifiers += MODIFIER_BIT_MASKS.alt;
    }
    if (e.ctrlKey) {
        modifiers += MODIFIER_BIT_MASKS.ctrl;
    }
    if (e.metaKey) {
        modifiers += MODIFIER_BIT_MASKS.meta;
    }
    if (e.shiftKey) {
        modifiers += MODIFIER_BIT_MASKS.shift;
        if (SHIFT_KEYS[e.key] !== undefined) {
            key = SHIFT_KEYS[e.key];
        }
    }

    return { modifiers, key };
};

/**
 * Splits a key combo string into its constituent key values and looks up
 * aliases, such as `return` -> `enter`.
 *
 * Unlike the parseKeyCombo method, this method does NOT convert shifted
 * action keys. So `"@"` will NOT be converted to `["shift", "2"]`).
 */
export const normalizeKeyCombo = (combo: string, platformOverride?: string): string[] => {
    const keys = combo.replace(/\s/g, "").split("+");
    return keys.map(key => {
        const keyName = CONFIG_ALIASES[key] != null ? CONFIG_ALIASES[key] : key;
        return keyName === "meta" ? (isMac(platformOverride) ? "cmd" : "ctrl") : keyName;
    });
};

function isMac(platformOverride?: string) {
    // HACKHACK: see https://github.com/palantir/blueprint/issues/5174
    // eslint-disable-next-line deprecation/deprecation
    const platform = platformOverride ?? (typeof navigator !== "undefined" ? navigator.platform : undefined);
    return platform === undefined ? false : /Mac|iPod|iPhone|iPad/.test(platform);
}
