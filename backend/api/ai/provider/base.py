from abc import ABC, abstractmethod
from typing import Any

class BaseAIProvider(ABC):
    @abstractmethod
    def analyze_resume(self, resume_text: str, model: str) -> dict[str, Any]:
        pass

    @abstractmethod
    def generate_optimization_questions(self, resume_text: str, analysis: dict[str, Any], model: str) -> list[dict[str, Any]]:
        pass

    @abstractmethod
    def optimize_resume(
        self, 
        resume_text: str, 
        analysis: dict[str, Any], 
        user_answers: dict[str, Any], 
        model: str
    ) -> dict[str, Any]:
        pass

    @abstractmethod
    def test_connection(self, model: str) -> bool:
        pass
