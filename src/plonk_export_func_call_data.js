/*
    Copyright 2021 0KIMS association.

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

import { getCurveFromName } from "./curves.js";
import { utils }   from "@krigga/ffjavascript";
const { unstringifyBigInts } = utils;

export default async function plonkExportFuncCallData(_proof, _pub) {
    let proof = unstringifyBigInts(_proof);
    const pub = unstringifyBigInts(_pub);

    const curve = await getCurveFromName(proof.curve);
    proof = fromObjectProof(curve, proof);

    return `[
    { type: 'slice', cell: beginCell().storeBuffer(Buffer.from('${proof.A}', 'hex')).endCell() },
    { type: 'slice', cell: beginCell().storeBuffer(Buffer.from('${proof.B}', 'hex')).endCell() },
    { type: 'slice', cell: beginCell().storeBuffer(Buffer.from('${proof.C}', 'hex')).endCell() },
    { type: 'slice', cell: beginCell().storeBuffer(Buffer.from('${proof.Z}', 'hex')).endCell() },
    { type: 'slice', cell: beginCell().storeBuffer(Buffer.from('${proof.T1}', 'hex')).endCell() },
    { type: 'slice', cell: beginCell().storeBuffer(Buffer.from('${proof.T2}', 'hex')).endCell() },
    { type: 'slice', cell: beginCell().storeBuffer(Buffer.from('${proof.T3}', 'hex')).endCell() },
    { type: 'int', value: ${proof.eval_a.toString(10)}n },
    { type: 'int', value: ${proof.eval_b.toString(10)}n },
    { type: 'int', value: ${proof.eval_c.toString(10)}n },
    { type: 'int', value: ${proof.eval_s1.toString(10)}n },
    { type: 'int', value: ${proof.eval_s2.toString(10)}n },
    { type: 'int', value: ${proof.eval_zw.toString(10)}n },
    { type: 'slice', cell: beginCell().storeBuffer(Buffer.from('${proof.Wxi}', 'hex')).endCell() },
    { type: 'slice', cell: beginCell().storeBuffer(Buffer.from('${proof.Wxiw}', 'hex')).endCell() },
    { type: 'cell', cell: publicInputsToDict([${pub.map(e => e.toString(10) + "n").join(", ")}]) }
]`;
}

function pointToBlstCHex(curve, p) {
    const tmp = new Uint8Array(curve.F.n8);
    curve.toBlstCompressed(tmp, 0, p);
    return Buffer.from(tmp).toString("hex");
}

function fromObjectProof(curve, proof) {
    const G1 = curve.G1;
    // const Fr = curve.Fr;
    const res = proof;
    res.A = pointToBlstCHex(curve.G1, G1.fromObject(proof.A));
    res.B = pointToBlstCHex(curve.G1, G1.fromObject(proof.B));
    res.C = pointToBlstCHex(curve.G1, G1.fromObject(proof.C));
    res.Z = pointToBlstCHex(curve.G1, G1.fromObject(proof.Z));
    res.T1 = pointToBlstCHex(curve.G1, G1.fromObject(proof.T1));
    res.T2 = pointToBlstCHex(curve.G1, G1.fromObject(proof.T2));
    res.T3 = pointToBlstCHex(curve.G1, G1.fromObject(proof.T3));
    // res.eval_a = Fr.fromObject(proof.eval_a);
    // res.eval_b = Fr.fromObject(proof.eval_b);
    // res.eval_c = Fr.fromObject(proof.eval_c);
    // res.eval_zw = Fr.fromObject(proof.eval_zw);
    // res.eval_s1 = Fr.fromObject(proof.eval_s1);
    // res.eval_s2 = Fr.fromObject(proof.eval_s2);
    res.Wxi = pointToBlstCHex(curve.G1, G1.fromObject(proof.Wxi));
    res.Wxiw = pointToBlstCHex(curve.G1, G1.fromObject(proof.Wxiw));
    return res;
}
