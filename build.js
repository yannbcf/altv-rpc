import { execSync } from "node:child_process";
import { join } from "node:path";
import { build } from "esbuild";

const BASE = process.cwd();
const ENTRY_POINT = join(BASE, "src/index.ts");

function _build(inPath, outPath, external) {
    build({
        bundle: true,
        minify: true,
        format: "esm",
        platform: "node",
        target: "esnext",
        keepNames: true,
        entryPoints: [
            {
                in: inPath,
                out: outPath,
            },
        ],
        outdir: "dist",
        external: external,
    });
}

try {
    const t = performance.now();

    // execSync(`npx dts-bundle-generator -o ${join("dist", "index.d.ts")} ${ENTRY_POINT} --no-check`, {
    //     stdio: "inherit",
    // });

    await Promise.all([
        _build("src/index.ts", "index", ["zod"]),
        _build("src/$types/$client.ts", "$client", ["zod", "alt-client"]),
        _build("src/$types/$server.ts", "$server", ["zod", "alt-server"]),
        _build("src/$types/$shared.ts", "$shared", ["zod"]),
        _build("src/$types/$typeOnly.ts", "$typeOnly", ["zod"])
    ]);

    console.log(`\n> Build finished ! (done in ${(performance.now() - t).toFixed(3)} ms)\n`);
} catch (e) {
    console.log(`ERROR: ${e.message}`);
}
