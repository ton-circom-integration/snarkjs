/*
    Copyright 2022 iden3 association.

    This file is part of snarkjs.

    snarkjs is a free software: you can redistribute it and/or
    modify it under the terms of the GNU General Public License as published by the
    Free Software Foundation, either version 3 of the License, or (at your option)
    any later version.

    snarkjs is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
    more details.

    You should have received a copy of the GNU General Public License along with
    snarkjs. If not, see <https://www.gnu.org/licenses/>.
*/

import {Scalar} from "@krigga/ffjavascript";
import jsSha256 from "js-sha256";
const { sha256 } = jsSha256;

const POLYNOMIAL = 0;
const SCALAR = 1;

export class Sha256Transcript {
    constructor(curve) {
        this.G1 = curve.G1;
        this.Fr = curve.Fr;

        this.reset();
    }

    reset() {
        this.data = [];
    }

    addPolCommitment(polynomialCommitment) {
        this.data.push({type: POLYNOMIAL, data: polynomialCommitment});
    }

    addScalar(scalar) {
        this.data.push({type: SCALAR, data: scalar});
    }

    getChallenge() {
        if(0 === this.data.length) {
            throw new Error("Keccak256Transcript: No data to generate a transcript");
        }

        let nPolynomials = 0;
        let nScalars = 0;

        this.data.forEach(element => POLYNOMIAL === element.type ? nPolynomials++ : nScalars++);

        let buffer = new Uint8Array(nScalars * this.Fr.n8 + nPolynomials * this.G1.F.n8);
        let offset = 0;

        for (let i = 0; i < this.data.length; i++) {
            if (POLYNOMIAL === this.data[i].type) {
                this.G1.toBlstCompressed(buffer, offset, this.data[i].data);
                const tb = new Uint8Array(this.G1.F.n8);
                this.G1.toBlstCompressed(tb, 0, this.data[i].data);
                offset += this.G1.F.n8;
            } else {
                this.Fr.toRprBE(buffer, offset, this.data[i].data);
                offset += this.Fr.n8;
            }
        }

        const hashBuf = new Uint8Array(sha256.arrayBuffer(buffer));
        const value = Scalar.fromRprBE(hashBuf);
        return this.Fr.e(value);
    }
}