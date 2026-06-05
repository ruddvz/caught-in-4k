/**
 * Zod schemas for api-proxy request validation
 */

const { z } = require('zod');

const canonTakeBodySchema = z.object({
    title: z.string().trim().min(1).max(200),
    year: z.union([z.string(), z.number()]),
    genres: z.union([z.string(), z.array(z.string())]),
    imdbRating: z.union([z.string(), z.number()]),
}).strict();

const checkoutBodySchema = z.object({
    plan: z.enum(['monthly', 'yearly', 'lifetime']),
}).strict();

const accessKeyBodySchema = z.object({
    key: z.string().trim().min(1).max(32),
}).strict();

const validateBody = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            error: 'Invalid request',
            details: result.error.issues.map((issue) => ({
                path: issue.path.join('.'),
                message: issue.message,
            })),
        });
    }
    req.validatedBody = result.data;
    return next();
};

module.exports = {
    canonTakeBodySchema,
    checkoutBodySchema,
    accessKeyBodySchema,
    validateBody,
};
