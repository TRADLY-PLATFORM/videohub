export type ParsedSignUpResponse =
	| { verify_id: string }
	| { error: string }

export type ParsedUserResponse =
	| { user: import('@/types/auth.types').User }
	| { error: string }

export const parseSignUpResponse = (response: unknown): ParsedSignUpResponse => {
	if (response instanceof Error) {
		return {
			error: 'Unable to contact the sign-up service. Check your connection and try again.',
		}
	}

	if (!response || typeof response !== 'object') {
		return { error: 'Sign up failed. The service returned an invalid response.' }
	}

	const result = response as {
		status?: boolean
		error?: { message?: string }
		data?: { verify_id?: string }
	}

	if (result.error) {
		return { error: result.error.message || 'Sign up failed' }
	}

	if (result.status !== true || typeof result.data?.verify_id !== 'string' || !result.data.verify_id) {
		return { error: 'Sign up failed. The service returned an invalid response.' }
	}

	return { verify_id: result.data.verify_id }
}

export const parseUserResponse = (response: unknown, action: string): ParsedUserResponse => {
	if (response instanceof Error) {
		return {
			error: `Unable to contact the sign-in service. Check your connection and try again.`,
		}
	}

	if (!response || typeof response !== 'object') {
		return { error: `${action} failed. The service returned an invalid response.` }
	}

	const result = response as {
		status?: boolean
		error?: { message?: string }
		data?: { user?: import('@/types/auth.types').User }
	}

	if (result.error) {
		return { error: result.error.message || `${action} failed` }
	}

	if (result.status !== true || !result.data?.user) {
		return { error: `${action} failed. The service returned an invalid response.` }
	}

	return { user: result.data.user }
}
