from typing import Any
from .provider import BaseAIProvider, GeminiProvider, GroqProvider, GrokProvider


SUPPORTED_PROVIDERS = {
    "gemini": {
        "name": "Google Gemini",
        "models": [
            "gemini-2.5-pro",
            "gemini-2.5-flash",
            "gemini-2.5-flash-lite",
            "gemini-2.0-flash",
            "gemini-2.0-flash-lite",
            "gemini-1.5-pro",
            "gemini-1.5-flash"
        ],
        "default_model": "gemini-2.5-flash"
    },
    "groq": {
        "name": "Groq",
        "models": [
            "llama-3.3-70b-versatile",
            "llama-3.3-8b-versatile",
            "llama-3.1-70b-versatile",
            "llama-3.1-8b-instant",
            "llama3-70b-8192",
            "llama3-8b-8192",
            "mixtral-8x7b-32768",
            "gemma-7b-it"
        ],
        "default_model": "llama-3.1-8b-instant"
    },
    "grok": {
        "name": "Grok (xAI)",
        "models": [
            "grok-3-mini-fast",
            "grok-3-mini",
            "grok-3-fast",
            "grok-3",
            "grok-3-latest",
            "grok-3-latest-fast"
        ],
        "default_model": "grok-3-mini-fast"
    }
}

class AIService:
    @staticmethod
    def get_provider(provider_name: str, api_key: str) -> BaseAIProvider:
        if provider_name == "gemini":
            return GeminiProvider(api_key)
        elif provider_name == "groq":
            return GroqProvider(api_key)
        elif provider_name == "grok":
            return GrokProvider(api_key)
        else:
            raise ValueError(f"Unsupported provider: {provider_name}")
    
    @staticmethod
    def get_supported_providers() -> dict[str, Any]:
        return SUPPORTED_PROVIDERS
