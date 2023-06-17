import { z } from "zod";

// export function $typeOnly<T, U extends {} | undefined = undefined>(p1?: U) {
//     if (p1 !== undefined) {
//         const schema = z.object(p1);
//         type Schema = typeof schema;

//         return schema as unknown as U extends {}
//             ? z.ZodObject<Schema["shape"], "strip", z.ZodTypeAny, Schema["_input"], Schema["_type"]>
//             : never;
//     }

//     const schema = z.custom<T>(() => true);
//     type Schema = typeof schema;

//     return schema as unknown as U extends {} ? never : z.ZodType<Schema["_input"], z.ZodTypeDef, Schema["_type"]>;
// }

export function $typeOnly<T>() {
    return z.custom<T>(() => true);
}
