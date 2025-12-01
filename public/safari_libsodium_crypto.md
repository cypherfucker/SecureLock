# **Limitations of Safari for Client-Side File Encryption Using Libsodium (WASM)**

### **_Technical Documentation_**

---

## **Overview**

This document provides a detailed examination of why [Safari](https://www.apple.com/safari/) (**both macOS and iOS/iPadOS**) and other WebKit [WebKit](https://github.com/WebKit/WebKit) based web browsers are **not** recommended as a platform for client-side file encryption when using **[libsodium](https://libsodium.org/)**, especially its _WebAssembly_ (WASM) build (`libsodium-wrappers` or custom-compiled builds).

<u>**Safari includes architectural limitations, missing features, and unstable behaviors that can reduce performance, increase unreliability, and in some cases compromise the safety expectations of cryptographic applications.**</u>
These issues affect both the cryptographic primitives (particularly _Argon2id_ and _XChaCha20-Poly1305_) and the operational stability required for large-file encryption.

The following sections present a full technical rationale.

---

# **1. WebAssembly Limitations in Safari**

Safari historically lags behind [Chromium](https://github.com/chromium/chromium) and [Firefox](https://github.com/mozilla-firefox/firefox) in **WebAssembly support**, especially features required for secure, efficient client-side encryption.

Libsodium’s WASM build relies on:

* **SharedArrayBuffer**
* **Atomics**
* **WebAssembly threads**
* **Deterministic memory growth**
* **WASM SIMD operations**
* **High-performance parallelism**

Safari’s partial support for these features leads to significant problems.

---

## **1.1. Lack of Full SharedArrayBuffer (SAB) Support by Default**

Many _Libsodium_ features depend on **SharedArrayBuffer**, especially the optimized _Argon2id_ implementation, which uses SAB for parallel memory-hard operations.

Safari restricts SAB unless **strict cross-origin isolation** is configured:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

Without these headers:

* SharedArrayBuffer is </u>unavailable</u>.
* WebAssembly threads are </u>disabled</u>.
* Libsodium must fall back to **slower**, **non-parallel**, and sometimes **non-constant-time** JS implementations.
* Memory-hard operations </u>degrade drastically, affecting security and performance</u>.

Many hosting platforms (e.g., GitHub Pages, Netlify, unconfigured Vercel deployments) do **not** support the required headers, </u>**making proper WASM threading impossible on Safari.**</u>

---

## **1.2. WebAssembly Threads Not Fully Supported**

Even when SAB is available, Safari’s implementation of **WebAssembly threads** remains incomplete and prone to instability:

* Limited thread pool support.
* Inconsistent availability depending on OS version.
* Worker initialization failures in multi-threaded WASM environments.
* Restrictions on nested workers.
* Unpredictable behavior under high memory load.

Cryptographic algorithms like _Argon2id_ benefit strongly from parallel execution; Safari’s limitations directly impair performance and can cause timeouts or crashes.

---

## **1.3. Memory Growth Limitations**

Heavy encryption workloads require stable, growable **WebAssembly** memory. Safari presents:

* Unreliable memory growth when using shared WASM memory.
* Out-of-memory exceptions at significantly lower thresholds compared to [compared to chromium](https://bugs.webkit.org/show_bug.cgi?id=269937).
* Silent memory allocation failures when dealing with multi-hundred-megabyte buffers.
* Inconsistent behavior between macOS and iOS versions.

</u>**When encrypting large files, these failures can cause incomplete encryption, corrupted ciphertext output, or unexpected termination of the encryption process.**</u>

---

## **1.4. Partial Support for WASM SIMD**

Libsodium can optionally leverage **SIMD** instructions to accelerate cryptographic operations.

Safari's support is:

* partial,
* unstable across versions,
* sometimes disabled by default,
* constrained on iOS.

</u>**This increases CPU load and slows encryption significantly, especially for large files.**</u>

---

# **2. JavaScript Execution and Resource Throttling**

Large client-side encryption tasks require uninterrupted CPU time, predictable memory access, and uninterrupted execution. Safari’s runtime policies interfere with all three.

---

## **2.1. Background Tab Throttling**

Safari aggressively throttles background tabs:

* CPU allocation reduced dramatically.
* Workers may be paused or suspended.
* WASM execution slowed or halted.

If a user switches tabs during encryption:

* The task may freeze.
* **The cryptographic context may be disrupted.**
* Execution may be silently terminated.

This poses a serious **reliability risk** for long-running encryption tasks.

---

## **2.2. Task Termination Under High Memory Use**

_WebAssembly_ encryption workloads use large binary buffers. Safari:

* Kills long-running tasks more aggressively than other browsers.
* Terminates tasks when memory pressure is detected, even erroneously.
* Uses mobile-like background execution policies on macOS when memory is high.

This can cause **incomplete encryption** or **corruption** of the output buffer.

---

## **2.3. JavaScript Event Loop Interference**

Safari frequently interrupts JS tasks to maintain UI responsiveness. Heavy _WebAssembly_ operations executed through Libsodium depend on uninterrupted blocks of execution.

Interruptions increase:

* Runtime variance,
* Potential timing-vector artifacts,
* Unpredictable job scheduling.

</u>**This interferes with the deterministic behavior expected from cryptographic operations.**</u>

---

# **3. File Handling and Blob Processing Issues**

Encrypting files in the browser requires reading them into memory as `ArrayBuffer` objects.
[Safari’s Blob and File API implementations](https://github.com/WebKit/WebKit/tree/main/Source/WebCore/fileapi) </u>**introduce additional risks.**</u>

---

## **3.1. Unreliable Blob → ArrayBuffer Reads**

Safari is known to generate incorrect or partial buffers in certain cases:

* Zero-length buffers produced intermittently.
* Misaligned data caused by internal copying.
* Truncated buffers for large files.
* Failures with `FileReader.readAsArrayBuffer`.
* Unpredictable behavior when handling >500MB files.

Because encryption relies on exact byte-level fidelity, any discrepancy </u>makes the ciphertext invalid and the plaintext unrecoverable.</u>

---

## **3.2. Memory Fragmentation and Copying**

[Safari’s JavaScript engine](https://trac.webkit.org/wiki/JavaScriptCore) often performs unnecessary internal copies of large binary buffers.

This has direct consequences:

* Increased memory pressure.
* Reduced WebAssembly performance.
* Increased likelihood of hitting Safari’s lower memory limits.
* Higher chance of “Out of Memory” termination.

In contrast, Chromium based browsers use more efficient memory strategies ( / zero-copy slices).

---

# **4. Randomness and Entropy Issues**

Secure encryption requires reliable, high-entropy randomness for nonce generation, session keys, and IVs.

Safari’s entropy source (`window.crypto.getRandomValues`) has historically shown:

* Reduced entropy in private browsing mode.
* Lower-quality randomness on certain iOS versions.
* Slower entropy replenishment.
* Fluctuating timing characteristics.

While most modern Safari versions have drastically improved, discrepancies remain, especially on older devices.

Libsodium expects:

* a consistent CSPRNG source,
* stable entropy availability,
* predictable latency for randomness extraction.

Safari can **not** guarantee these expectations.

---

# **5. WebCrypto API Instability**

Although Libsodium primarily uses _WebAssembly_, some builds use [WebCrypto](https://w3c.github.io/webcrypto/) as a fallback for certain operations. [Safari’s WebCrypto implementation](https://webkit.org/blog/7790/update-on-web-cryptography/) has historically exhibited:

* Incomplete **ECDH** and **ECDSA** support.
* **AES-GCM** instability in older versions.
* Restrictions on key export and import.
* Performance regressions between Safari updates.
* Lack of support for modern primitives such as:

  * Ed25519,
  * X25519,
  * XChaCha20,
  * Argon2id,
  * BLAKE2 variants.

Fallback to _WebCrypto_ in Safari may therefore result in:

* use of weaker algorithms,
* degraded performance,
* increased implementation complexity.

---

# **6. Impact on Cryptographic Safety and Reliability**

Safari’s limitations do not necessarily introduce cryptographic vulnerabilities directly; rather, they create an environment where encryption workflows become:

* fragile,
* unpredictable,
* prone to failure,
* non-deterministic,
* inconsistent across devices.

</u>**This undermines key guarantees that client-side encryption must provide:**</u>

### **6.1. Integrity**

Partial writes or truncated buffers break authentication tags.

### **6.2. Confidentiality**

Mismanagement of nonce generation or randomness **can weaken encryption.**

### **6.3. Reliability**

Users **risk losing data** if encryption freezes, **crashes**, or terminates early.

### **6.4. Portability**

**Encrypted output may be corrupted** or unreadable on other platforms.

Given the stakes, a browser with unreliable _WASM_ threading and memory handling is not recommended for high-assurance encryption.

---

# **7. Safari on iOS: Additional Limitations**

~~Safari on iOS shares the same WebKit engine with all browsers on iPhones and iPads~~ **EDIT**: Still apply outside the EU; [as of today no major browser has implemented a different rendering engine.](https://github.com/mozilla-mobile/firefox-ios/issues/19063)
This means the limitations described apply not only to Safari, but also to:

* _Chrome_ on iOS
* _Firefox_ on iOS
* _Edge_ on iOS
* _Brave_ on iOS

All these browsers are effectively “Safari with a different skin.”

This amplifies the impact:

* No iOS browser supports full _WASM_ threading consistently.
* Memory limits are far lower (typically 512MB or less).
* Background execution is terminated rapidly.
* **Large encryption operations are effectively impossible.**

</u>**Client-side file encryption on iOS WebKit is therefore extremely unreliable.**</u>

---

# **8. Summary of Key Problems**

### **Safari should be avoided for libsodium-based file encryption because:**

* _WebAssembly_ threads and _SharedArrayBuffer_ are inconsistently supported.
* Memory growth in _WASM_ is unstable, causing crashes or **incomplete encryption**.
* Large binary buffers regularly break Safari’s Blob/File APIs.
* Background tab throttling disrupts long-running encryption tasks.
* Randomness sources are slower and sometimes degraded.
* [WebCrypto APIs](https://github.com/w3c/webcrypto/) are incomplete and sometimes buggy.
* iOS WebKit enforces additional constraints (lower memory, forced tab suspension).
* Failure modes often occur silently, leading to **corrupted ciphertext and unrecoverable data.**

</u>**Taken together, these issues make Safari an unreliable and high-risk environment for client-side cryptographic workloads involving large files or memory-hard algorithms. **</u>


---

# **9. Recommendations**

### **For developers of encryption tools:**

* Detect Safari via User-Agent or feature detection.
* Provide visible warnings to users.
* Disable encryption of large files on Safari.
* Offer server-side, CLI, or desktop-app alternatives.
* Provide fallback “safe modes” with reduced functionality.
* Encourage the use of ~~Chromium~~ (**DISPUTED**) or Firefox for full functionality.

### **For users:**

* Use Firefox or a Chromium-based browser (Ungoogled Chromium, Brave, Chromium) for file encryption.
* **Avoid encrypting large files on iOS devices**

---

# **10. References and External Documentation**

Below are authoritative sources discussing Safari’s limitations:

### **SharedArrayBuffer and WASM Threads**

* MDN: SharedArrayBuffer overview
  [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer)
* WebKit Blog — “New WebKit Features in Safari 15.2” (SAB restrictions)
  [https://webkit.org/blog/12140/new-webkit-features-in-safari-15-2/](https://webkit.org/blog/12140/new-webkit-features-in-safari-15-2/)
* WASM Feature Support
  [https://webassembly.org/features/](https://webassembly.org/features/)

### **Safari WASM Limitations**

* “WASM Limitations” (Flutter/Rust Bridge documentation)
  [https://cjycode.com/flutter_rust_bridge/manual/miscellaneous/wasm-limitations](https://cjycode.com/flutter_rust_bridge/manual/miscellaneous/wasm-limitations)
* Emscripten issue: Shared memory problems in Safari
  [https://github.com/emscripten-core/emscripten/issues/19374](https://github.com/emscripten-core/emscripten/issues/19374)

### **Blob and File API Issues**

* WebKit bug reports on FileReader / ArrayBuffer inconsistencies
* Numerous open issues on Safari’s handling of large binary data

### **WebCrypto Warnings**

* MDN: Web Crypto API
  [https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

### **General Browser Crypto Caveats**

* Industry articles noting Safari lagging in crypto/WebAssembly adoption
* F5 Labs: “The State of Post-Quantum Cryptography on the Web”
  [https://www.f5.com/labs/articles/the-state-of-pqc-on-the-web](https://www.f5.com/labs/articles/the-state-of-pqc-on-the-web)

---
