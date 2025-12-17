import { TelemetryService } from "@roo-code/telemetry"
import { TelemetryEventName } from "@roo-code/types"

/**
 * Context for chat textarea autocomplete telemetry events
 */
export interface ChatAutocompleteContext {
	/** The model ID being used for completion */
	modelId?: string
	/** The provider name (e.g., "openai", "anthropic") */
	provider?: string
	/** Whether FIM (Fill-in-the-Middle) was used vs chat-based completion */
	usedFim: boolean
	/** Whether visible code context was included */
	hasVisibleCodeContext: boolean
	/** Whether clipboard context was included */
	hasClipboardContext: boolean
}

/**
 * Telemetry service for chat textarea autocomplete events.
 * Tracks user interactions with the autocomplete feature in the chat input area.
 */
export class ChatTextAreaAutocompleteTelemetry {
	constructor() {}

	private captureEvent(event: TelemetryEventName, properties?: Record<string, unknown>): void {
		if (TelemetryService.hasInstance()) {
			if (properties !== undefined) {
				TelemetryService.instance.captureEvent(event, properties)
				console.log(`Chat Autocomplete Telemetry event: ${event}`, properties)
			} else {
				TelemetryService.instance.captureEvent(event)
				console.log(`Chat Autocomplete Telemetry event: ${event}`)
			}
		}
	}

	/**
	 * Capture when a chat autocomplete suggestion is requested.
	 * This is triggered when the user pauses typing and the system attempts to generate a completion.
	 *
	 * @param context - The chat autocomplete context
	 * @param userTextLength - The length of the user's current input text
	 */
	public captureSuggestionRequested(context: ChatAutocompleteContext, userTextLength: number): void {
		this.captureEvent(TelemetryEventName.CHAT_AUTOCOMPLETE_SUGGESTION_REQUESTED, {
			modelId: context.modelId,
			provider: context.provider,
			usedFim: context.usedFim,
			hasVisibleCodeContext: context.hasVisibleCodeContext,
			hasClipboardContext: context.hasClipboardContext,
			userTextLength,
		})
	}

	/**
	 * Capture when an LLM request for chat autocomplete completes successfully.
	 *
	 * @param properties - Request metrics including latency and token counts
	 * @param context - The chat autocomplete context
	 */
	public captureLlmRequestCompleted(
		properties: {
			latencyMs: number
			inputTokens?: number
			outputTokens?: number
		},
		context: ChatAutocompleteContext,
	): void {
		this.captureEvent(TelemetryEventName.CHAT_AUTOCOMPLETE_LLM_REQUEST_COMPLETED, {
			...properties,
			modelId: context.modelId,
			provider: context.provider,
			usedFim: context.usedFim,
		})
	}

	/**
	 * Capture when an LLM request for chat autocomplete fails.
	 *
	 * @param properties - Error details including latency and error message
	 * @param context - The chat autocomplete context
	 */
	public captureLlmRequestFailed(
		properties: { latencyMs: number; error: string },
		context: ChatAutocompleteContext,
	): void {
		this.captureEvent(TelemetryEventName.CHAT_AUTOCOMPLETE_LLM_REQUEST_FAILED, {
			...properties,
			modelId: context.modelId,
			provider: context.provider,
			usedFim: context.usedFim,
		})
	}

	/**
	 * Capture when a suggestion is successfully returned to the user.
	 * This means the suggestion passed all filters and was displayed.
	 *
	 * @param context - The chat autocomplete context
	 * @param suggestionLength - The length of the suggestion in characters
	 */
	public captureSuggestionReturned(context: ChatAutocompleteContext, suggestionLength: number): void {
		this.captureEvent(TelemetryEventName.CHAT_AUTOCOMPLETE_SUGGESTION_RETURNED, {
			modelId: context.modelId,
			provider: context.provider,
			usedFim: context.usedFim,
			suggestionLength,
		})
	}

	/**
	 * Capture when a suggestion is filtered out by post-processing.
	 * This happens when the suggestion is empty, contains unwanted patterns, or fails validation.
	 *
	 * @param reason - The reason the suggestion was filtered out
	 * @param context - The chat autocomplete context
	 */
	public captureSuggestionFiltered(
		reason: "empty_response" | "unwanted_pattern" | "too_short" | "model_not_loaded" | "no_credentials",
		context: ChatAutocompleteContext,
	): void {
		this.captureEvent(TelemetryEventName.CHAT_AUTOCOMPLETE_SUGGESTION_FILTERED, {
			reason,
			modelId: context.modelId,
			provider: context.provider,
			usedFim: context.usedFim,
		})
	}

	/**
	 * Capture when a user accepts a suggestion (e.g., by pressing Tab).
	 *
	 * @param suggestionLength - The length of the accepted suggestion
	 */
	public captureSuggestionAccepted(suggestionLength: number): void {
		this.captureEvent(TelemetryEventName.CHAT_AUTOCOMPLETE_SUGGESTION_ACCEPTED, {
			suggestionLength,
		})
	}

	/**
	 * Capture when a user dismisses a suggestion (e.g., by pressing Escape or continuing to type).
	 *
	 * @param dismissReason - How the suggestion was dismissed
	 */
	public captureSuggestionDismissed(dismissReason: "escape" | "continued_typing" | "clicked_away" | "timeout"): void {
		this.captureEvent(TelemetryEventName.CHAT_AUTOCOMPLETE_SUGGESTION_DISMISSED, {
			dismissReason,
		})
	}
}
