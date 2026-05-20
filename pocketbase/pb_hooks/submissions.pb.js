function decodeUtf8(bytes) {
    if (!bytes) return "";
    let str = "";
    for (let i = 0; i < bytes.length; i++) {
        const b = bytes[i];
        if (b < 0x80) {
            str += String.fromCharCode(b);
        } else if (b >= 0xC0 && b < 0xE0) {
            str += String.fromCharCode(((b & 0x1F) << 6) | (bytes[++i] & 0x3F));
        } else if (b >= 0xE0 && b < 0xF0) {
            str += String.fromCharCode(((b & 0x0F) << 12) | ((bytes[++i] & 0x3F) << 6) | (bytes[++i] & 0x3F));
        } else if (b >= 0xF0 && b < 0xF8) {
            const cp = ((b & 0x07) << 18) | ((bytes[++i] & 0x3F) << 12) | ((bytes[++i] & 0x3F) << 6) | (bytes[++i] & 0x3F);
            if (cp >= 0x10000) {
                str += String.fromCharCode(((cp - 0x10000) >> 10) + 0xD800, ((cp - 0x10000) & 0x3FF) + 0xDC00);
            } else {
                str += String.fromCharCode(cp);
            }
        }
    }
    return str;
}

onRecordAfterCreateSuccess((e) => {
    const formSubmission = e.record;
    const formId = formSubmission.get("form_id");

    try {
        // Fetch the form info to get the target email
        const form = $app.findRecordById("forms", formId);
        const targetEmail = form.get("target_email");
        const formTitle = form.get("title");

        if (!targetEmail) {
            console.log("No target email defined for form: " + formId);
            return;
        }

        // Helper to parse JSON fields which are returned as byte arrays in JSVM
        const parseJsonField = (rawVal) => {
            if (!rawVal) return null;
            
            // If it is already a parsed JS object (not a Go proxy or raw array)
            if (typeof rawVal === "object" && typeof rawVal.string !== "function" && typeof rawVal.marshalJSON !== "function" && !Array.isArray(rawVal)) {
                return rawVal;
            }
            
            try {
                let jsonStr;
                if (typeof rawVal === "string") {
                    jsonStr = rawVal;
                } else if (typeof rawVal.string === "function") {
                    jsonStr = rawVal.string();
                } else if (Array.isArray(rawVal) || (typeof rawVal === "object" && typeof rawVal.length === "number")) {
                    jsonStr = decodeUtf8(rawVal);
                } else {
                    jsonStr = String(rawVal);
                }
                return JSON.parse(jsonStr);
            } catch (err) {
                console.error("Failed to parse JSON field:", err);
                if (typeof rawVal === "object") {
                    return rawVal;
                }
                return null;
            }
        };

        // Get the submission data
        const rawData = formSubmission.get("data");
        const data = parseJsonField(rawData) || {};

        // Format the email body
        let body = "<p>Nowe zgłoszenie w formularzu: <strong>" + formTitle + "</strong></p>";
        body += "<p><strong>Szczegóły zgłoszenia:</strong></p>";
        body += "<table border='1' cellpadding='8' cellspacing='0' style='border-collapse: collapse; min-width: 400px; border: 1px solid #e5e7eb;'>";
        body += "<thead><tr style='background-color: #f3f4f6;'><th>Pole</th><th>Wartość</th></tr></thead>";
        body += "<tbody>";

        // We can check if the form configuration has the labels to show them nicely
        const rawFields = form.get("fields");
        const fields = parseJsonField(rawFields) || [];
        
        // Track keys we render to ensure we output in form layout order, then append the rest
        const processedKeys = {};

        // Render fields in the order defined in the form's config
        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];
            if (!field || !field.id || field.type === "static_text") continue;

            const key = field.id;
            const value = data[key];
            if (value === undefined) continue;

            processedKeys[key] = true;
            const label = field.label || key;
            let displayValue = "";
            if (Array.isArray(value)) {
                displayValue = value.join(", ");
            } else {
                displayValue = String(value || "");
            }
            body += "<tr><td style='padding: 8px; border: 1px solid #e5e7eb;'><strong>" + label + "</strong></td><td style='padding: 8px; border: 1px solid #e5e7eb; white-space: pre-wrap;'>" + displayValue + "</td></tr>";
        }

        // Render any remaining keys in data that were not in form.fields (e.g. is_test_submission)
        for (const key in data) {
            if (processedKeys[key]) continue;

            const value = data[key];
            const label = key;
            let displayValue = "";
            if (Array.isArray(value)) {
                displayValue = value.join(", ");
            } else {
                displayValue = String(value || "");
            }
            body += "<tr><td style='padding: 8px; border: 1px solid #e5e7eb;'><strong>" + label + "</strong></td><td style='padding: 8px; border: 1px solid #e5e7eb; white-space: pre-wrap;'>" + displayValue + "</td></tr>";
        }
        body += "</tbody></table>";
        body += "<p style='color: #6b7280; font-size: 11px; margin-top: 25px;'>Wiadomość wygenerowana automatycznie przez portal szkolny.</p>";

        // Send email
        const message = new MailerMessage({
            from: {
                address: $app.settings().meta.senderAddress,
                name: $app.settings().meta.senderName,
            },
            to: [{ address: targetEmail }],
            subject: "[Formularz] Nowe zgłoszenie: " + formTitle,
            html: body,
        });

        $app.newMailClient().send(message);
        console.log("Email notification sent to: " + targetEmail + " for form: " + formTitle);
    } catch (err) {
        console.error("Failed to send email notification for submission: " + err.message);
    }
}, "form_submissions");
