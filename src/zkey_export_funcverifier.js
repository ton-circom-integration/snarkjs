import ejs from "ejs";

import exportBlstVerificationKey from "./zkey_export_blst_verificationkey.js";

export default async function exportFuncVerifier(zKeyName, templates, logger) {
    const verificationKey = await exportBlstVerificationKey(zKeyName, logger);

    let template = templates[verificationKey.protocol];

    return ejs.render(template, verificationKey);
}
