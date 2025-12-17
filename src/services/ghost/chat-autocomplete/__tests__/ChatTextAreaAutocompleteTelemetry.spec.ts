import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { ChatTextAreaAutocompleteTelemetry, ChatAutocompleteContext } from "../ChatTextAreaAutocompleteTelemetry"
import { TelemetryService } from "@roo-code/telemetry"
import { TelemetryEventName } from "@roo-code/types"

describe("ChatTextAreaAutocompleteTelemetry", () => {
	let telemetry: ChatTextAreaAutocompleteTelemetry
	let mockCaptureEvent: ReturnType<typeof vi.fn>
	let consoleLogSpy: ReturnType<typeof vi.spyOn>

	const mockContext: ChatAutocompleteContext = {
		modelId: "test-model",
		provider: "test-provider",
		usedFim: true,
		hasVisibleCodeContext: true,
		hasClipboardContext: false,
	}

	beforeEach(() => {
		telemetry = new ChatTextAreaAutocompleteTelemetry()
		mockCaptureEvent = vi.fn()
		consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {})

		// Mock TelemetryService
		vi.spyOn(TelemetryService, "hasInstance").mockReturnValue(true)
		vi.spyOn(TelemetryService, "instance", "get").mockReturnValue({
			captureEvent: mockCaptureEvent,
		} as any)
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe("captureSuggestionRequested", () => {
		it("should capture suggestion requested event with correct properties", () => {
			const userTextLength = 42

			telemetry.captureSuggestionRequested(mockContext, userTextLength)

			expect(mockCaptureEvent).toHaveBeenCalledWith(TelemetryEventName.CHAT_AUTOCOMPLETE_SUGGESTION_REQUESTED, {
				modelId: "test-model",
				provider: "test-provider",
				usedFim: true,
				hasVisibleCodeContext: true,
				hasClipboardContext: false,
				userTextLength: 42,
			})
			expect(consoleLogSpy).toHaveBeenCalled()
		})
	})

	describe("captureLlmRequestCompleted", () => {
		it("should capture LLM request completed event with metrics", () => {
			const properties = {
				latencyMs: 150,
				inputTokens: 100,
				outputTokens: 50,
			}

			telemetry.captureLlmRequestCompleted(properties, mockContext)

			expect(mockCaptureEvent).toHaveBeenCalledWith(TelemetryEventName.CHAT_AUTOCOMPLETE_LLM_REQUEST_COMPLETED, {
				latencyMs: 150,
				inputTokens: 100,
				outputTokens: 50,
				modelId: "test-model",
				provider: "test-provider",
				usedFim: true,
			})
		})

		it("should handle optional token counts", () => {
			const properties = {
				latencyMs: 150,
			}

			telemetry.captureLlmRequestCompleted(properties, mockContext)

			expect(mockCaptureEvent).toHaveBeenCalledWith(TelemetryEventName.CHAT_AUTOCOMPLETE_LLM_REQUEST_COMPLETED, {
				latencyMs: 150,
				modelId: "test-model",
				provider: "test-provider",
				usedFim: true,
			})
		})
	})

	describe("captureLlmRequestFailed", () => {
		it("should capture LLM request failed event with error details", () => {
			const properties = {
				latencyMs: 100,
				error: "Network timeout",
			}

			telemetry.captureLlmRequestFailed(properties, mockContext)

			expect(mockCaptureEvent).toHaveBeenCalledWith(TelemetryEventName.CHAT_AUTOCOMPLETE_LLM_REQUEST_FAILED, {
				latencyMs: 100,
				error: "Network timeout",
				modelId: "test-model",
				provider: "test-provider",
				usedFim: true,
			})
		})
	})

	describe("captureSuggestionReturned", () => {
		it("should capture suggestion returned event with length", () => {
			const suggestionLength = 25

			telemetry.captureSuggestionReturned(mockContext, suggestionLength)

			expect(mockCaptureEvent).toHaveBeenCalledWith(TelemetryEventName.CHAT_AUTOCOMPLETE_SUGGESTION_RETURNED, {
				modelId: "test-model",
				provider: "test-provider",
				usedFim: true,
				suggestionLength: 25,
			})
		})
	})

	describe("captureSuggestionFiltered", () => {
		it("should capture filtered event with empty_response reason", () => {
			telemetry.captureSuggestionFiltered("empty_response", mockContext)

			expect(mockCaptureEvent).toHaveBeenCalledWith(TelemetryEventName.CHAT_AUTOCOMPLETE_SUGGESTION_FILTERED, {
				reason: "empty_response",
				modelId: "test-model",
				provider: "test-provider",
				usedFim: true,
			})
		})

		it("should capture filtered event with unwanted_pattern reason", () => {
			telemetry.captureSuggestionFiltered("unwanted_pattern", mockContext)

			expect(mockCaptureEvent).toHaveBeenCalledWith(TelemetryEventName.CHAT_AUTOCOMPLETE_SUGGESTION_FILTERED, {
				reason: "unwanted_pattern",
				modelId: "test-model",
				provider: "test-provider",
				usedFim: true,
			})
		})

		it("should capture filtered event with model_not_loaded reason", () => {
			telemetry.captureSuggestionFiltered("model_not_loaded", mockContext)

			expect(mockCaptureEvent).toHaveBeenCalledWith(TelemetryEventName.CHAT_AUTOCOMPLETE_SUGGESTION_FILTERED, {
				reason: "model_not_loaded",
				modelId: "test-model",
				provider: "test-provider",
				usedFim: true,
			})
		})
	})

	describe("captureSuggestionAccepted", () => {
		it("should capture suggestion accepted event", () => {
			const suggestionLength = 30

			telemetry.captureSuggestionAccepted(suggestionLength)

			expect(mockCaptureEvent).toHaveBeenCalledWith(TelemetryEventName.CHAT_AUTOCOMPLETE_SUGGESTION_ACCEPTED, {
				suggestionLength: 30,
			})
		})
	})

	describe("captureSuggestionDismissed", () => {
		it("should capture dismissed event with escape reason", () => {
			telemetry.captureSuggestionDismissed("escape")

			expect(mockCaptureEvent).toHaveBeenCalledWith(TelemetryEventName.CHAT_AUTOCOMPLETE_SUGGESTION_DISMISSED, {
				dismissReason: "escape",
			})
		})

		it("should capture dismissed event with continued_typing reason", () => {
			telemetry.captureSuggestionDismissed("continued_typing")

			expect(mockCaptureEvent).toHaveBeenCalledWith(TelemetryEventName.CHAT_AUTOCOMPLETE_SUGGESTION_DISMISSED, {
				dismissReason: "continued_typing",
			})
		})

		it("should capture dismissed event with clicked_away reason", () => {
			telemetry.captureSuggestionDismissed("clicked_away")

			expect(mockCaptureEvent).toHaveBeenCalledWith(TelemetryEventName.CHAT_AUTOCOMPLETE_SUGGESTION_DISMISSED, {
				dismissReason: "clicked_away",
			})
		})

		it("should capture dismissed event with timeout reason", () => {
			telemetry.captureSuggestionDismissed("timeout")

			expect(mockCaptureEvent).toHaveBeenCalledWith(TelemetryEventName.CHAT_AUTOCOMPLETE_SUGGESTION_DISMISSED, {
				dismissReason: "timeout",
			})
		})
	})

	describe("when TelemetryService is not available", () => {
		beforeEach(() => {
			vi.spyOn(TelemetryService, "hasInstance").mockReturnValue(false)
		})

		it("should not throw error when capturing events", () => {
			expect(() => {
				telemetry.captureSuggestionRequested(mockContext, 10)
			}).not.toThrow()

			expect(mockCaptureEvent).not.toHaveBeenCalled()
		})
	})

	describe("context variations", () => {
		it("should handle context without optional fields", () => {
			const minimalContext: ChatAutocompleteContext = {
				usedFim: false,
				hasVisibleCodeContext: false,
				hasClipboardContext: false,
			}

			telemetry.captureSuggestionRequested(minimalContext, 5)

			expect(mockCaptureEvent).toHaveBeenCalledWith(TelemetryEventName.CHAT_AUTOCOMPLETE_SUGGESTION_REQUESTED, {
				modelId: undefined,
				provider: undefined,
				usedFim: false,
				hasVisibleCodeContext: false,
				hasClipboardContext: false,
				userTextLength: 5,
			})
		})

		it("should handle FIM vs chat-based completion", () => {
			const fimContext: ChatAutocompleteContext = {
				...mockContext,
				usedFim: true,
			}

			const chatContext: ChatAutocompleteContext = {
				...mockContext,
				usedFim: false,
			}

			telemetry.captureSuggestionReturned(fimContext, 10)
			expect(mockCaptureEvent).toHaveBeenLastCalledWith(
				TelemetryEventName.CHAT_AUTOCOMPLETE_SUGGESTION_RETURNED,
				expect.objectContaining({ usedFim: true }),
			)

			telemetry.captureSuggestionReturned(chatContext, 10)
			expect(mockCaptureEvent).toHaveBeenLastCalledWith(
				TelemetryEventName.CHAT_AUTOCOMPLETE_SUGGESTION_RETURNED,
				expect.objectContaining({ usedFim: false }),
			)
		})
	})
})
