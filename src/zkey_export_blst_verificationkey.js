/*
    Copyright 2018 0KIMS association.

    This file is part of snarkJS.

    snarkJS is a free software: you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    snarkJS is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
    License for more details.

    You should have received a copy of the GNU General Public License
    along with snarkJS. If not, see <https://www.gnu.org/licenses/>.
*/

import * as binFileUtils from "@iden3/binfileutils";
import * as zkeyUtils from "./zkey_utils.js";
import {getCurveFromQ as getCurve} from "./curves.js";
import {utils} from "@krigga/ffjavascript";

const {stringifyBigInts} = utils;

export default async function zkeyExportBlstVerificationKey(zkeyName, logger) {
    if (logger) logger.info("EXPORT VERIFICATION KEY STARTED");

    const {fd, sections} = await binFileUtils.readBinFile(zkeyName, "zkey", 2);
    const zkey = await zkeyUtils.readHeader(fd, sections);

    if (logger) logger.info("> Detected protocol: " + zkey.protocol);

    let res;
    if (zkey.protocol === "plonk") {
        res = await plonkVk(zkey);
    } else {
        throw new Error("zkey file protocol "+zkey.protocol+" not supported");
    }

    await fd.close();

    if (logger) logger.info("EXPORT VERIFICATION KEY FINISHED");

    return res;
}

function pointToBlstCHex(curve, p) {
    const tmp = new Uint8Array(curve.F.n8);
    curve.toBlstCompressed(tmp, 0, p);
    return Buffer.from(tmp).toString("hex");
}

async function plonkVk(zkey) {
    const curve = await getCurve(zkey.q);

    let vKey = {
        protocol: zkey.protocol,
        curve: curve.name,
        nPublic: zkey.nPublic,
        power: zkey.power,

        k1: curve.Fr.toObject(zkey.k1),
        k2: curve.Fr.toObject(zkey.k2),

        Qm: pointToBlstCHex(curve.G1, zkey.Qm),
        Ql: pointToBlstCHex(curve.G1, zkey.Ql),
        Qr: pointToBlstCHex(curve.G1, zkey.Qr),
        Qo: pointToBlstCHex(curve.G1, zkey.Qo),
        Qc: pointToBlstCHex(curve.G1, zkey.Qc),
        S1: pointToBlstCHex(curve.G1, zkey.S1),
        S2: pointToBlstCHex(curve.G1, zkey.S2),
        S3: pointToBlstCHex(curve.G1, zkey.S3),

        X_2: pointToBlstCHex(curve.G2, zkey.X_2),

        w: curve.Fr.toObject(curve.Fr.w[zkey.power])
    };

    vKey = stringifyBigInts(vKey);

    return vKey;
}
