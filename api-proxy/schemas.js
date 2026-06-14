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

// $30 guide one-time checkout takes no input — the user is resolved from the
// bearer token server-side.
const guideCheckoutBodySchema = z.object({}).strict();

// Done-for-you setup request. server_tier maps to SERVER_TIERS in
// src/common/guideAccess.js. desired_password is sensitive and stored locked.
const setupRequestBodySchema = z.object({
    server_tier: z.enum(['single-ip', 'multi-ip']),
    email: z.string().trim().email().max(200),
    desired_username: z.string().trim().min(1).max(120),
    desired_password: z.string().min(8).max(200),
    devices: z.string().trim().max(500).optional().default(''),
    notes: z.string().trim().max(2000).optional().default(''),
}).strict();

const setupFulfillBodySchema = z.object({
    id: z.string().uuid(),
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
    guideCheckoutBodySchema,
    setupRequestBodySchema,
    setupFulfillBodySchema,
    validateBody,
};
