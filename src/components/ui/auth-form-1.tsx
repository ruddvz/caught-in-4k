import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    ArrowLeft,
    Chrome,
    Eye,
    EyeOff,
    Loader2,
    MailCheck,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const AUTH_VIEWS = {
    SIGN_IN: 'sign-in',
    SIGN_UP: 'sign-up',
    FORGOT_PASSWORD: 'forgot-password',
    RESET_SUCCESS: 'reset-success',
} as const;

type AuthView = (typeof AUTH_VIEWS)[keyof typeof AUTH_VIEWS];

interface AuthState {
    view: AuthView;
}

interface FormState {
    isLoading: boolean;
    error: string | null;
    showPassword: boolean;
}

const signInSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

const signUpSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    terms: z.boolean().refine((value) => value, {
        message: 'You must agree to the terms',
    }),
});

const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});

type SignInFormValues = z.infer<typeof signInSchema>;
type SignUpFormValues = z.infer<typeof signUpSchema>;
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

function Auth({ className, ...props }: React.ComponentProps<'div'>) {
    const [state, setState] = React.useState<AuthState>({
        view: AUTH_VIEWS.SIGN_IN,
    });

    const setView = React.useCallback((view: AuthView) => {
        setState((previousState) => ({
            ...previousState,
            view,
        }));
    }, []);

    return (
        <div data-slot='auth' className={cn('mx-auto w-full max-w-md', className)} {...props}>
            <div className='relative overflow-hidden rounded-xl border border-border/50 bg-card/80 shadow-xl backdrop-blur-sm'>
                <div className='absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5' />
                <div className='relative z-10'>
                    <AnimatePresence mode='wait'>
                        {state.view === AUTH_VIEWS.SIGN_IN ? (
                            <AuthSignIn
                                key='sign-in'
                                onForgotPassword={() => setView(AUTH_VIEWS.FORGOT_PASSWORD)}
                                onSignUp={() => setView(AUTH_VIEWS.SIGN_UP)}
                            />
                        ) : null}
                        {state.view === AUTH_VIEWS.SIGN_UP ? (
                            <AuthSignUp key='sign-up' onSignIn={() => setView(AUTH_VIEWS.SIGN_IN)} />
                        ) : null}
                        {state.view === AUTH_VIEWS.FORGOT_PASSWORD ? (
                            <AuthForgotPassword
                                key='forgot-password'
                                onSignIn={() => setView(AUTH_VIEWS.SIGN_IN)}
                                onSuccess={() => setView(AUTH_VIEWS.RESET_SUCCESS)}
                            />
                        ) : null}
                        {state.view === AUTH_VIEWS.RESET_SUCCESS ? (
                            <AuthResetSuccess
                                key='reset-success'
                                onSignIn={() => setView(AUTH_VIEWS.SIGN_IN)}
                            />
                        ) : null}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

interface AuthFormProps {
    onSubmit: React.FormEventHandler<HTMLFormElement>;
    children: React.ReactNode;
    className?: string;
}

function AuthForm({ onSubmit, children, className }: AuthFormProps) {
    return (
        <form onSubmit={onSubmit} data-slot='auth-form' className={cn('space-y-6', className)}>
            {children}
        </form>
    );
}

interface AuthErrorProps {
    message: string | null;
}

function AuthError({ message }: AuthErrorProps) {
    if (!message) {
        return null;
    }

    return (
        <div
            data-slot='auth-error'
            className='mb-6 animate-in rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive'
        >
            {message}
        </div>
    );
}

interface AuthSocialButtonsProps {
    isLoading: boolean;
}

function AuthSocialButtons({ isLoading }: AuthSocialButtonsProps) {
    return (
        <div data-slot='auth-social-buttons' className='mt-6 w-full'>
            <Button
                type='button'
                variant='outline'
                className='h-12 w-full border-border/50 bg-background/50'
                disabled={isLoading}
            >
                <Chrome className='mr-2 h-4 w-4' />
                Google
            </Button>
        </div>
    );
}

interface AuthSeparatorProps {
    text?: string;
}

function AuthSeparator({ text = 'Or continue with' }: AuthSeparatorProps) {
    return (
        <div data-slot='auth-separator' className='relative mt-6'>
            <div className='absolute inset-0 flex items-center'>
                <Separator />
            </div>
            <div className='relative flex justify-center text-xs uppercase'>
                <span className='bg-card px-2 text-muted-foreground'>{text}</span>
            </div>
        </div>
    );
}

interface AuthSignInProps {
    onForgotPassword: () => void;
    onSignUp: () => void;
}

function AuthSignIn({ onForgotPassword, onSignUp }: AuthSignInProps) {
    const [formState, setFormState] = React.useState<FormState>({
        isLoading: false,
        error: null,
        showPassword: false,
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignInFormValues>({
        resolver: zodResolver(signInSchema),
        defaultValues: { email: '', password: '' },
    });

    const onSubmit = async (_data: SignInFormValues) => {
        setFormState((previousState) => ({
            ...previousState,
            isLoading: true,
            error: null,
        }));

        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            setFormState((previousState) => ({
                ...previousState,
                error: 'Invalid email or password',
            }));
        } catch {
            setFormState((previousState) => ({
                ...previousState,
                error: 'An unexpected error occurred',
            }));
        } finally {
            setFormState((previousState) => ({
                ...previousState,
                isLoading: false,
            }));
        }
    };

    return (
        <motion.div
            data-slot='auth-sign-in'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className='p-8'
        >
            <div className='mb-8 text-center'>
                <h1 className='text-3xl font-semibold text-foreground'>Welcome back</h1>
                <p className='mt-2 text-sm text-muted-foreground'>Sign in to your account</p>
            </div>

            <AuthError message={formState.error} />

            <AuthForm onSubmit={handleSubmit(onSubmit)}>
                <div className='space-y-2'>
                    <Label htmlFor='auth-sign-in-email'>Email</Label>
                    <Input
                        id='auth-sign-in-email'
                        type='email'
                        placeholder='name@example.com'
                        disabled={formState.isLoading}
                        className={cn(errors.email && 'border-destructive')}
                        {...register('email')}
                    />
                    {errors.email ? (
                        <p className='text-xs text-destructive'>{errors.email.message}</p>
                    ) : null}
                </div>

                <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                        <Label htmlFor='auth-sign-in-password'>Password</Label>
                        <Button
                            type='button'
                            variant='link'
                            className='h-auto p-0 text-xs'
                            onClick={onForgotPassword}
                            disabled={formState.isLoading}
                        >
                            Forgot password?
                        </Button>
                    </div>
                    <div className='relative'>
                        <Input
                            id='auth-sign-in-password'
                            type={formState.showPassword ? 'text' : 'password'}
                            placeholder='••••••••'
                            disabled={formState.isLoading}
                            className={cn(errors.password && 'border-destructive')}
                            {...register('password')}
                        />
                        <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='absolute right-0 top-0 h-full'
                            onClick={() =>
                                setFormState((previousState) => ({
                                    ...previousState,
                                    showPassword: !previousState.showPassword,
                                }))
                            }
                            disabled={formState.isLoading}
                        >
                            {formState.showPassword ? (
                                <EyeOff className='h-4 w-4' />
                            ) : (
                                <Eye className='h-4 w-4' />
                            )}
                            <span className='sr-only'>Toggle password visibility</span>
                        </Button>
                    </div>
                    {errors.password ? (
                        <p className='text-xs text-destructive'>{errors.password.message}</p>
                    ) : null}
                </div>

                <Button type='submit' className='w-full' disabled={formState.isLoading}>
                    {formState.isLoading ? (
                        <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Signing in...
                        </>
                    ) : (
                        'Sign in'
                    )}
                </Button>
            </AuthForm>

            <AuthSeparator />
            <AuthSocialButtons isLoading={formState.isLoading} />

            <p className='mt-8 text-center text-sm text-muted-foreground'>
                No account?{' '}
                <Button
                    type='button'
                    variant='link'
                    className='h-auto p-0 text-sm'
                    onClick={onSignUp}
                    disabled={formState.isLoading}
                >
                    Create one
                </Button>
            </p>
        </motion.div>
    );
}

interface AuthSignUpProps {
    onSignIn: () => void;
}

function AuthSignUp({ onSignIn }: AuthSignUpProps) {
    const [formState, setFormState] = React.useState<FormState>({
        isLoading: false,
        error: null,
        showPassword: false,
    });

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<SignUpFormValues>({
        resolver: zodResolver(signUpSchema),
        defaultValues: { name: '', email: '', password: '', terms: false },
    });

    const terms = watch('terms');

    const onSubmit = async (_data: SignUpFormValues) => {
        setFormState((previousState) => ({
            ...previousState,
            isLoading: true,
            error: null,
        }));

        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            setFormState((previousState) => ({
                ...previousState,
                error: 'Email already registered',
            }));
        } catch {
            setFormState((previousState) => ({
                ...previousState,
                error: 'An unexpected error occurred',
            }));
        } finally {
            setFormState((previousState) => ({
                ...previousState,
                isLoading: false,
            }));
        }
    };

    return (
        <motion.div
            data-slot='auth-sign-up'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className='p-8'
        >
            <div className='mb-8 text-center'>
                <h1 className='text-3xl font-semibold text-foreground'>Create account</h1>
                <p className='mt-2 text-sm text-muted-foreground'>Get started with your account</p>
            </div>

            <AuthError message={formState.error} />

            <AuthForm onSubmit={handleSubmit(onSubmit)}>
                <div className='space-y-2'>
                    <Label htmlFor='auth-sign-up-name'>Name</Label>
                    <Input
                        id='auth-sign-up-name'
                        type='text'
                        placeholder='John Doe'
                        disabled={formState.isLoading}
                        className={cn(errors.name && 'border-destructive')}
                        {...register('name')}
                    />
                    {errors.name ? <p className='text-xs text-destructive'>{errors.name.message}</p> : null}
                </div>

                <div className='space-y-2'>
                    <Label htmlFor='auth-sign-up-email'>Email</Label>
                    <Input
                        id='auth-sign-up-email'
                        type='email'
                        placeholder='name@example.com'
                        disabled={formState.isLoading}
                        className={cn(errors.email && 'border-destructive')}
                        {...register('email')}
                    />
                    {errors.email ? (
                        <p className='text-xs text-destructive'>{errors.email.message}</p>
                    ) : null}
                </div>

                <div className='space-y-2'>
                    <Label htmlFor='auth-sign-up-password'>Password</Label>
                    <div className='relative'>
                        <Input
                            id='auth-sign-up-password'
                            type={formState.showPassword ? 'text' : 'password'}
                            placeholder='••••••••'
                            disabled={formState.isLoading}
                            className={cn(errors.password && 'border-destructive')}
                            {...register('password')}
                        />
                        <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='absolute right-0 top-0 h-full'
                            onClick={() =>
                                setFormState((previousState) => ({
                                    ...previousState,
                                    showPassword: !previousState.showPassword,
                                }))
                            }
                            disabled={formState.isLoading}
                        >
                            {formState.showPassword ? (
                                <EyeOff className='h-4 w-4' />
                            ) : (
                                <Eye className='h-4 w-4' />
                            )}
                            <span className='sr-only'>Toggle password visibility</span>
                        </Button>
                    </div>
                    {errors.password ? (
                        <p className='text-xs text-destructive'>{errors.password.message}</p>
                    ) : null}
                </div>

                <div className='flex items-center space-x-2'>
                    <Checkbox
                        id='auth-sign-up-terms'
                        checked={terms}
                        onCheckedChange={(checked) =>
                            setValue('terms', checked === true, {
                                shouldDirty: true,
                                shouldValidate: true,
                            })
                        }
                        disabled={formState.isLoading}
                    />
                    <div className='space-y-1'>
                        <Label htmlFor='auth-sign-up-terms' className='text-sm'>
                            I agree to the terms
                        </Label>
                        <p className='text-xs text-muted-foreground'>
                            By signing up, you agree to our{' '}
                            <Button type='button' variant='link' className='h-auto p-0 text-xs'>
                                Terms
                            </Button>{' '}
                            and{' '}
                            <Button type='button' variant='link' className='h-auto p-0 text-xs'>
                                Privacy Policy
                            </Button>
                            .
                        </p>
                    </div>
                </div>
                {errors.terms ? <p className='text-xs text-destructive'>{errors.terms.message}</p> : null}

                <Button type='submit' className='w-full' disabled={formState.isLoading}>
                    {formState.isLoading ? (
                        <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Creating account...
                        </>
                    ) : (
                        'Create account'
                    )}
                </Button>
            </AuthForm>

            <AuthSeparator />
            <AuthSocialButtons isLoading={formState.isLoading} />

            <p className='mt-8 text-center text-sm text-muted-foreground'>
                Have an account?{' '}
                <Button
                    type='button'
                    variant='link'
                    className='h-auto p-0 text-sm'
                    onClick={onSignIn}
                    disabled={formState.isLoading}
                >
                    Sign in
                </Button>
            </p>
        </motion.div>
    );
}

interface AuthForgotPasswordProps {
    onSignIn: () => void;
    onSuccess: () => void;
}

function AuthForgotPassword({ onSignIn, onSuccess }: AuthForgotPasswordProps) {
    const [formState, setFormState] = React.useState<FormState>({
        isLoading: false,
        error: null,
        showPassword: false,
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: '' },
    });

    const onSubmit = async (_data: ForgotPasswordFormValues) => {
        setFormState((previousState) => ({
            ...previousState,
            isLoading: true,
            error: null,
        }));

        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            onSuccess();
        } catch {
            setFormState((previousState) => ({
                ...previousState,
                error: 'An unexpected error occurred',
            }));
        } finally {
            setFormState((previousState) => ({
                ...previousState,
                isLoading: false,
            }));
        }
    };

    return (
        <motion.div
            data-slot='auth-forgot-password'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className='relative p-8'
        >
            <Button
                type='button'
                variant='ghost'
                size='icon'
                className='absolute left-4 top-4'
                onClick={onSignIn}
                disabled={formState.isLoading}
            >
                <ArrowLeft className='h-4 w-4' />
                <span className='sr-only'>Back</span>
            </Button>

            <div className='mb-8 text-center'>
                <h1 className='text-3xl font-semibold text-foreground'>Reset password</h1>
                <p className='mt-2 text-sm text-muted-foreground'>
                    Enter your email to receive a reset link
                </p>
            </div>

            <AuthError message={formState.error} />

            <AuthForm onSubmit={handleSubmit(onSubmit)}>
                <div className='space-y-2'>
                    <Label htmlFor='auth-forgot-password-email'>Email</Label>
                    <Input
                        id='auth-forgot-password-email'
                        type='email'
                        placeholder='name@example.com'
                        disabled={formState.isLoading}
                        className={cn(errors.email && 'border-destructive')}
                        {...register('email')}
                    />
                    {errors.email ? (
                        <p className='text-xs text-destructive'>{errors.email.message}</p>
                    ) : null}
                </div>

                <Button type='submit' className='w-full' disabled={formState.isLoading}>
                    {formState.isLoading ? (
                        <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Sending...
                        </>
                    ) : (
                        'Send reset link'
                    )}
                </Button>
            </AuthForm>

            <p className='mt-8 text-center text-sm text-muted-foreground'>
                Remember your password?{' '}
                <Button
                    type='button'
                    variant='link'
                    className='h-auto p-0 text-sm'
                    onClick={onSignIn}
                    disabled={formState.isLoading}
                >
                    Sign in
                </Button>
            </p>
        </motion.div>
    );
}

interface AuthResetSuccessProps {
    onSignIn: () => void;
}

function AuthResetSuccess({ onSignIn }: AuthResetSuccessProps) {
    return (
        <motion.div
            data-slot='auth-reset-success'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className='flex flex-col items-center p-8 text-center'
        >
            <div className='mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10'>
                <MailCheck className='h-8 w-8 text-primary' />
            </div>

            <h1 className='text-2xl font-semibold text-foreground'>Check your email</h1>
            <p className='mt-2 text-sm text-muted-foreground'>
                We sent a password reset link to your email.
            </p>

            <Button type='button' variant='outline' className='mt-6 w-full max-w-xs' onClick={onSignIn}>
                Back to sign in
            </Button>

            <p className='mt-6 text-xs text-muted-foreground'>
                No email? Check spam or{' '}
                <Button type='button' variant='link' className='h-auto p-0 text-xs'>
                    try another email
                </Button>
            </p>
        </motion.div>
    );
}

export {
    Auth,
    AuthSignIn,
    AuthSignUp,
    AuthForgotPassword,
    AuthResetSuccess,
    AuthForm,
    AuthError,
    AuthSocialButtons,
    AuthSeparator,
};

export default Auth;