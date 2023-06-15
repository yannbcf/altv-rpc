import { execSync } from "node:child_process";
import { join } from "node:path";
import { build } from "esbuild";

const BASE = process.cwd();
const ENTRY_POINT = join(BASE, "src/index.ts");

try {
    const t = performance.now();

    // execSync(`npx dts-bundle-generator -o ${join("dist", "index.d.ts")} ${ENTRY_POINT} --no-check`, {
    //     stdio: "inherit",
    // });

    await Promise.all([
        build({
            bundle: true,
            minify: true,
            format: "esm",
            platform: "node",
            target: "esnext",
            keepNames: true,
            entryPoints: [
                {
                    in: "src/index.ts",
                    out: "index",
                },
            ],
            outdir: "dist",
            external: ["zod"],
        }),
    ]);

    console.log(`\n> Build finished ! (done in ${(performance.now() - t).toFixed(3)} ms)\n`);
} catch (e) {
    console.log(`ERROR: ${e.message}`);
}
