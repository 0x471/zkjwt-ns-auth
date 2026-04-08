# zk-nsauth: in-depth review

A ruthlessly self-critical walkthrough of the `zk-nsauth` circuit. Read this before
trusting the proof for anything that matters.

> **TL;DR** — The circuit proves *"I hold a JWT signed by NS-Auth's RSA-4096 key
> whose `iss` matches X and whose `exp` is in the future."* That is the entire
> guarantee. It does **not** identify you, bind to your private key, prove your
> roles, or guarantee freshness. Anyone holding a stolen token can produce an
> identical proof.

---

## 1. What this circuit *actually* is

It is a **pseudonymous membership badge**. You take an NS-Auth access token,
feed it into the circuit, and out comes:

- A proof that *some* valid token exists
- A nullifier that uniquely identifies *that token* (not the user)

The verifier learns: "this proof was produced by someone in possession of a valid
NS-Auth-issued token at this moment." That's it. No name. No Discord ID.
No roles. No join date. Just *"someone"*.

This is an unusually thin guarantee. It is useful for a narrow set of use cases
(anonymous gating, sybil-resistant voting where one token = one vote) and
**actively misleading for almost everything else**.

---

## 2. The token under verification

The circuit consumes an NS-Auth **access token** issued by
`backend/app/services/token_service.py:95` (`issue_user_token`):

```json
{
  "iss": "https://auth.networkschool.org",
  "sub": "<user-uuid>",
  "aud": "<client-id>",
  "exp": 1799999999,
  "iat": 1737642217,
  "jti": "<token-uuid>",
  "scope": "openid profile email roles",
  "client_id": "<client-id>",
  "user_id": "<user-uuid>"
}
```

**There is no Discord data in this token.** No roles. No join date. No name.
No avatar. Those claims live in the *ID token* (`issue_id_token` at
`token_service.py:131`) and the live `/oauth/userinfo` response — neither of
which the circuit can see.

This is the first design fault: **the circuit is verifying the wrong token type
for any interesting use case beyond binary membership.**

---

## 3. Circuit anatomy

`zk-nsauth/src/main.nr`:

```noir
global NUM_LIMBS: u32 = 35;        // ceil(4096 / 120)
global MOD_BITS: u32 = 4096;
global MAX_DATA_LENGTH: u32 = 1200;
global MAX_ISS_LENGTH: u32 = 128;
global MAX_JTI_LENGTH: u32 = 64;

fn main(
    // private
    data: BoundedVec<u8, MAX_DATA_LENGTH>,
    base64_decode_offset: u32,
    redc_params_limbs: [u128; NUM_LIMBS],
    signature_limbs: [u128; NUM_LIMBS],
    // public
    pubkey_modulus_limbs: pub [u128; NUM_LIMBS],
    expected_issuer: pub BoundedVec<u8, MAX_ISS_LENGTH>,
    min_exp_timestamp: pub u64,
) -> pub Field {
    let jwt = JWT::init(data, base64_decode_offset,
                        pubkey_modulus_limbs, redc_params_limbs, signature_limbs);
    jwt.verify();                                                  // [1]
    jwt.assert_claim_string("iss".as_bytes(), expected_issuer);    // [2]
    let exp = jwt.get_claim_number("exp".as_bytes());              // [3]
    assert(exp > min_exp_timestamp, "token expired");

    let jti = jwt.get_claim_string("jti".as_bytes());              // [4]
    let mut jti_fields: [Field; MAX_JTI_LENGTH] = [0; MAX_JTI_LENGTH];
    for i in 0..MAX_JTI_LENGTH {
        if i < jti.len() { jti_fields[i] = jti.get(i) as Field; }
    }
    std::hash::pedersen_hash(jti_fields)
}
```

| # | Step | What it costs | What it proves |
|---|------|---------------|----------------|
| 1 | `jwt.verify()` | ~80% of constraints | RSA-4096 PKCS#1v1.5 verify over SHA256(data) |
| 2 | `assert_claim_string("iss", …)` | string_search + byte loop | `iss` in payload equals `expected_issuer` |
| 3 | `get_claim_number("exp", …)` | string_search + parse | `exp` parses to a u64 greater than `min_exp_timestamp` |
| 4 | jti hash | 64 Pedersen rounds | nullifier = Pedersen([jti bytes, 0…]) |

### Public input layout

The proof carries 166 public input field elements. The bulk is the 4096-bit
modulus (35 limbs) and the issuer BoundedVec (128 padded bytes). The actual
*meaningful* public outputs are:

- `nullifier` — one Field, the Pedersen hash of jti
- `min_exp_timestamp` — verifier-supplied threshold
- `expected_issuer` — verifier-supplied issuer string
- `pubkey_modulus_limbs` — verifier-supplied (or *should be* hardcoded; see §7)

---

## 4. The nullifier in detail

```noir
let mut jti_fields: [Field; MAX_JTI_LENGTH] = [0; MAX_JTI_LENGTH];
for i in 0..MAX_JTI_LENGTH {
    if i < jti.len() { jti_fields[i] = jti.get(i) as Field; }
}
std::hash::pedersen_hash(jti_fields)
```

This is the part I am most embarrassed by. It is functionally correct *for our
specific case* (jti is always a 36-byte UUID, so the padding is deterministic
and there are no length-collision attacks in practice). But it is **structurally
sloppy in at least four ways**:

1. **No length prefix.** The hash input is `[byte0, byte1, …, byteN, 0, 0, …]`.
   Two distinct values that pad to the same array collide. UUIDs are
   fixed-length so this is unreachable today; if jti format ever changes,
   it becomes exploitable. The fix is one line: hash `[jti.len(), …bytes]`.

2. **One byte per Field.** A BN254 Field is 254 bits ≈ 31 bytes. We are using
   64 Field elements to hold 36 bytes of UUID. We could pack the entire jti
   into 2 Fields. Instead we're paying for **64 Pedersen rounds when we need 2**.
   This is 30× more constraints than necessary in the hash step.

3. **No domain separation.** There is no domain tag in the hash input. If
   another circuit in this project ever Pedersen-hashes user data, the hashes
   could collide across contexts. Best practice: prepend a constant tag like
   `[NS_AUTH_NULLIFIER_V1, …payload]`.

4. **Pedersen, not Poseidon.** Pedersen is collision-resistant and lives in
   `std::hash`, which is why I picked it. Poseidon is the modern SNARK-native
   choice and is more constraint-efficient. This is a missed optimization,
   not a soundness issue.

### What the nullifier does and does not provide

It provides: **replay prevention.** A verifier maintains a set of seen
nullifiers and rejects duplicates. One token → one accepted proof.

It does **not** provide:

- **Unlinkability across proofs.** Every proof generated from the same JWT
  produces the same nullifier. If a user proves membership 5 times with the
  same access token, all 5 proofs are linkable as "same token holder." Within
  a token's TTL (≈ 1 hour), the prover is effectively pseudonymous-but-stable.
- **Cross-verifier unlinkability.** The same token used at two different
  verifiers produces the same nullifier at both. Verifier A and Verifier B can
  collude and link the user across services. There is no per-verifier domain
  separation.
- **Identity binding.** The nullifier is derived from jti, not from any
  user-controlled secret. It identifies the *token*, not the *person*.

---

## 5. Concrete guarantees

If `nargo execute` succeeds and `verifyProof` returns true, the verifier knows:

1. There exists a JWT signed by the RSA-4096 key whose modulus matches
   `pubkey_modulus_limbs`.
2. That JWT contains an `iss` claim equal to `expected_issuer` — *modulo the
   noir-jwt soundness debt described in §7*.
3. That JWT contains an `exp` claim parsing to a u64 greater than
   `min_exp_timestamp` — *modulo the same soundness debt*.
4. The nullifier output is the Pedersen hash of (zero-padded) jti bytes.

That is the complete list of cryptographic guarantees.

---

## 6. Concrete non-guarantees

The circuit does **not** prove any of the following, and a verifier that
assumes otherwise is broken:

| The circuit does NOT prove | Why this matters |
|----------------------------|------------------|
| The prover is a specific user | Anyone with the token can produce the proof — there's no PoP (proof-of-possession) of a private key |
| The token wasn't revoked | Revocation lives in the `access_tokens` DB table; the circuit cannot read it |
| The user has any specific role | Roles aren't in the access token at all |
| The token was issued recently | `iat` is unchecked — a long-lived token from months ago is just as valid |
| The token was issued for *this* verifier | `aud` is unchecked — a token issued for client X verifies fine at client Y |
| The user actually consented to *this* scope | `scope` is unchecked |
| The user is currently in NS Discord | The backend checks at issuance, but membership can be revoked after — circuit can't recheck |
| Two proofs come from two different people | The nullifier identifies the token; if a user has two tokens, they look like two users |
| Proofs from the same user are unlinkable | Same token → same nullifier → linkable |

The most consequential of these: **a stolen access token produces a valid
proof.** The "ZK" part of this is hiding *which valid token among many* you
hold, not assuring that you are the legitimate owner.

---

## 7. Ruthless self-criticism

This section enumerates every flaw I am aware of, in roughly decreasing order
of severity. None of them are theoretical — all are issues with the code as it
sits today.

### 7.1 Unaddressed Brillig soundness warnings (severity: high)

`nargo compile` emits two warnings explicitly labeled `bug:`:

```
bug: Brillig function call isn't properly covered by a manual constraint
   ┌─ noir-jwt/src/lib.nr:229:13
   │
   │   self.extract_claim_unconstrained::<KEY_LENGTH, MAX_VALUE_LENGTH>(…)
   │   ──────────────────────────────── This Brillig call's inputs and its
   │   return values haven't been sufficiently constrained. This should be
   │   done to prevent potential soundness vulnerabilities
```

I shipped despite this. The warnings come from the upstream noir-jwt library
(not our fork's modifications). The wrapping `get_claim` function does
re-assert the extracted bytes against the haystack via byte-by-byte equality
(see `noir-jwt/src/lib.nr:274-282`), and the closing-delimiter assertion at
line 281-282 should prevent length manipulation. **In practice the constraints
appear tight for our use case.** But the compiler's static analysis cannot
prove this, and neither have I. This is real risk we are accepting on
faith. The right thing to do is either:

- Audit `extract_claim_unconstrained` carefully and document why each return
  field is constrained, OR
- Replace it with a fully constrained extractor (slower, more constraints,
  but no Brillig dependency).

### 7.2 No proof of possession (severity: high)

The circuit consumes an opaque JWT. There is no challenge–response, no
signature from the prover, no link between "the entity producing this proof"
and "the entity the token was issued to." If a token leaks (browser
compromise, log file, MITM during a misconfigured callback), the attacker
gets a valid proof generator for the token's lifetime.

For real anonymous identity, the user needs an asymmetric keypair, and the
circuit needs to verify a signature over a verifier-supplied challenge using
that key. We have neither. This is a fundamental architectural gap, not a
small fix.

### 7.3 No `aud` check (severity: medium)

A token issued for client A produces a valid proof at verifier B with no
modification. A verifier should be able to require *"this proof was generated
from a token issued to me specifically."* Adding an `expected_aud` public
input + `assert_claim_string` is ~2 lines of code. We didn't do it.

### 7.4 No freshness window (severity: medium)

`min_exp_timestamp` checks the future side. Nothing checks the past side
(`iat`). A token issued months ago with a long expiry produces a valid proof.
For most NS-Auth tokens this doesn't matter because `token_expiry_seconds` is
short, but the circuit places **all** trust in the backend's TTL config. If
someone bumps token expiry to a year for testing and forgets, our circuit
silently accepts year-old proofs.

### 7.5 Public key as a 35-limb public input (severity: medium)

The 4096-bit RSA modulus is passed as a public input on every proof. That's
35 × 16 = 560 bytes of data per proof that the verifier already knows
out-of-band (it's NS-Auth's public key — fetch it from JWKS once). A better
design is to **commit** to the public key (a single Field hash, hardcoded as a
constant in the circuit) and have the verifier check the commitment. Two
benefits:

- Smaller proofs.
- Eliminates the entire class of "verifier accidentally accepts a proof
  against a wrong key" bugs, because there is no key parameter to get wrong.

### 7.6 Issuer as a public input rather than a constant (severity: low/medium)

`expected_issuer` is supplied per-verification. This means a verifier could
accidentally (or maliciously) verify against an issuer string they don't
control, and accept proofs against a malicious issuer that happens to share
NS-Auth's public key. Hardcoding the issuer trades flexibility for safety.

### 7.7 Nullifier encoding flaws (severity: low — see §4)

- No length prefix
- One byte per Field (30× constraint waste in the hash)
- No domain separation
- Pedersen instead of Poseidon (efficiency only)

These are not security holes in our specific UUID-jti context, but they are
amateur-hour structural choices. A reviewer would flag every one of them.

### 7.8 noir-jwt's claim extractor breaks on commas inside string values (severity: low)

`extract_claim_unconstrained` (`noir-jwt/src/lib.nr:351-358`) breaks the value
loop on `,` or `}` or `"`. Inside a quoted string, an escaped comma is valid
JSON but the extractor would silently truncate. UUIDs and URLs don't contain
these chars, so we're safe today, but anyone reusing this library for
free-form claim values is going to get a nasty surprise.

### 7.9 `MAX_DATA_LENGTH = 1200` is brittle (severity: low)

Real NS-Auth tokens are ~450-620 bytes. 1200 has margin, but adding a few
claims to the access token would push past it. **The circuit silently breaks
when the backend evolves.** No CI test catches this.

### 7.10 Hardcoded RSA-4096 (severity: low)

`NUM_LIMBS=35`, `MOD_BITS=4096`. If NS-Auth ever rotates to a different key
size (RSA-2048 for performance, post-quantum, etc.), the circuit must be
recompiled and every verifier must re-distribute the new VK. There is no
graceful migration story.

### 7.11 No automated tests (severity: medium for engineering, low for crypto)

There are no negative tests. We do not verify that:

- A tampered signature fails
- An expired token fails
- A wrong issuer fails
- A different jti produces a different nullifier
- A modified payload fails the issuer check

We rely entirely on "nargo execute succeeded once on a real token" as our
correctness signal. That is not a test suite.

### 7.12 No CI (severity: medium engineering)

No GitHub Actions workflow runs `nargo compile` or `node scripts/prove.mjs`.
The project will silently break the next time we touch any of:

- noir-jwt fork
- nargo version
- bb.js version
- Backend token format

### 7.13 Vendored fork drift (severity: medium long-term)

We forked noir-jwt and modified three files for RSA-4096 + bignum v0.9.2.
This is committed at `noir-jwt/` directly (no submodule). Upstream security
fixes do not flow to us. If saleel patches a soundness bug (especially one
related to §7.1), we have to manually merge. The longer this sits, the worse
the merge gets.

### 7.14 Operational realities

- **Proving time:** 5-30 seconds in `bb.js` WASM. Bad UX for browsers.
- **Proof size:** 16,256 bytes. Expensive on-chain.
- **Native `bb prove` segfaults** on this circuit. We are stuck on the slow
  WASM path until upstream fixes it.
- **Compiled circuit JSON is ~1MB.** Bundling for browsers is heavy.
- **Pre-1.0 tooling everywhere:** `nargo beta.19`, `bb.js 4.0.0-nightly`. APIs
  will break before 1.0. We are pinned to specific commits with no upgrade
  path tested.

---

## 8. What I would change tomorrow

In rough priority order:

1. **Audit or replace the Brillig extractor** in noir-jwt. This is the
   single largest soundness risk we are accepting on faith.
2. **Add `aud` claim check.** Two lines. Closes a real gap.
3. **Add `iat` lower-bound check.** Two lines. Closes a less-real gap.
4. **Hardcode the public key as a Pedersen commitment** baked into the
   circuit as a constant. Removes a class of misconfiguration bugs.
5. **Fix the nullifier:**
   - Length-prefix the input
   - Pack bytes into 2 Fields instead of 64
   - Add a domain separator
   - (Optional) switch to Poseidon
6. **Write negative tests.** At minimum: wrong issuer fails, expired token
   fails, tampered signature fails.
7. **Set up CI.** `nargo compile` + `node scripts/prove.mjs` against a fixed
   test JWT on every commit.

None of these are large undertakings individually. Together they would move
the circuit from "a working demo" to "something I'd recommend others depend
on."

---

## 9. What this circuit is *good* for

To be fair to the design: there are use cases where this circuit is exactly
right.

- **Anonymous one-vote-per-token gating.** If NS-Auth's TTL is short and the
  use case treats the nullifier as "one ballot per active session," this
  works fine.
- **Sybil-resistant access to anonymous content.** "You're an active NS
  member, but I won't know which one."
- **Pseudonymous reactions / reputation accumulation per-token.** Within a
  token's lifetime, the nullifier acts as a stable pseudonym.
- **Demo of zkjwt over RSA-4096.** This is the only public end-to-end zkjwt
  example I know of that uses RSA-4096 + bignum v0.9.2 + bb.js WASM proving.
  As a reference implementation it has value beyond its production
  readiness.

It is **not** good for:

- Anything where stolen tokens matter (identity, financial, cross-service
  auth)
- Selective disclosure of any user attribute (roles, join date, name, email)
- Long-lived anonymous identity (each token rotation breaks the nullifier)
- High-volume verification (16KB proofs, multi-second prove time)

---

## 10. Path to selective disclosure

If we want to prove things like *"I joined NS Discord before date X"* or
*"I have the Moderator role"*, the circuit alone cannot do it. We need
**three coordinated changes**:

### 10.1 Backend: issue a ZK-friendly token

A new endpoint, e.g. `POST /auth/zk-token`, that mints a JWT with **flat
primitive claims**:

```json
{
  "iss": "https://auth.networkschool.org",
  "sub": "<uuid>", "exp": …, "iat": …, "jti": "<uuid>",
  "discord_joined_ts": 1710941400,
  "account_created_ts": 1705276800,
  "role_moderator": true,
  "role_builder": true,
  "role_core_team": false,
  "is_booster": false,
  "email_domain": "networkschool.org"
}
```

No arrays. No nested objects. No ISO date strings (numbers only — circuits
can't compare strings arithmetically). Booleans for roles. Same RSA-4096
signing key as the existing tokens, so no new key infrastructure.

### 10.2 Circuits: one per proof type

noir-jwt cannot handle "selectively check this claim conditionally" — Noir
constraint generation doesn't elide constraints based on runtime flags. So
the right design is **multiple narrow circuits**, each compiled separately,
each proving one thing:

| Circuit | Public input | Proves |
|---------|--------------|--------|
| `zk-ns-membership` (current) | — | Holds a valid token |
| `zk-ns-role` | role name | Token has `role_<name> == true` |
| `zk-ns-tenure` | max_join_ts | Token has `discord_joined_ts < max_join_ts` |
| `zk-ns-email-domain` | expected_domain | Token's `email_domain` matches |

A verifier requiring multiple properties asks for multiple proofs. This is
slow but composable and easier to audit than one fat circuit with many flags.

### 10.3 SDK: multi-circuit support

`zk-nsauth-sdk/src/` currently exports `proveNSMembership` /
`verifyNSMembership`. Extend to `proveNSRole`, `proveNSTenure`, etc., each
loading the appropriate compiled circuit JSON and feeding the right inputs.

---

## 11. Files referenced

- Circuit: `zk-nsauth/src/main.nr`
- Compiled: `zk-nsauth/target/zk_nsauth.json`
- Witness generator: `zk-nsauth/scripts/generate-prover-toml.ts`
- Prover/verifier driver: `zk-nsauth/scripts/prove.mjs`
- SDK: `zk-nsauth-sdk/src/{prove,verify,index}.ts`
- noir-jwt fork: `noir-jwt/src/lib.nr`, `noir-jwt/Nargo.toml`,
  `noir-jwt/js/src/generate-inputs.ts`
- Token issuance: `backend/app/services/token_service.py:95`
  (`issue_user_token`)
- ID token issuance (richer claims, currently unused by the circuit):
  `backend/app/services/token_service.py:131` (`issue_id_token`)

## 12. Versions pinned

- nargo `beta.19`
- bb.js `4.0.0-nightly.20260120`
- noir-bignum `v0.9.2` (Barrett overflow bits = 6, hence `+6n` in
  `generate-inputs.ts`)
- noir_rsa `v0.10.0`
- sha256 `v0.3.0`
- base64 `v0.4.2`
- string_search `v0.3.3`
- nodash `v0.42.0`
