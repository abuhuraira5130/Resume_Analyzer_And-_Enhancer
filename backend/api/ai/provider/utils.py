import json
import re


def clean_resume_text(text: str, max_chars: int = 12000) -> str:
    """
    Clean resume text to remove hidden characters, normalize whitespace, and truncate
    to prevent token overflow and high latency
    """
    # Remove null bytes and other control characters except newlines/tabs
    cleaned = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
    # Normalize line endings
    cleaned = cleaned.replace('\r\n', '\n').replace('\r', '\n')
    # Remove multiple blank lines
    cleaned = re.sub(r'\n\s*\n\s*\n', '\n\n', cleaned)
    # Normalize whitespace
    cleaned = re.sub(r'[ \t]+', ' ', cleaned)
    # Trim leading/trailing whitespace
    cleaned = cleaned.strip()
    # Truncate to max_chars, ensuring we don't cut off mid-word if possible
    if len(cleaned) > max_chars:
        # Try to cut at the last whitespace before max_chars
        last_space = cleaned.rfind(' ', 0, max_chars)
        if last_space != -1:
            cleaned = cleaned[:last_space]
        else:
            cleaned = cleaned[:max_chars]
    return cleaned


def clean_json_response(result_text: str) -> str:
    cleaned = result_text.strip()
    # Try to extract content between ```json and ``` or ``` and ```
    matches = re.findall(r"```(?:json)?\s*(.*?)\s*```", cleaned, re.DOTALL)
    if matches:
        cleaned = matches[0]
    else:
        # If no markdown blocks, try to find the outermost braces or brackets
        brace_start = cleaned.find('{')
        bracket_start = cleaned.find('[')
        
        if brace_start != -1 and (bracket_start == -1 or brace_start < bracket_start):
            end = cleaned.rfind('}')
            if end != -1 and end > brace_start:
                cleaned = cleaned[brace_start:end+1]
            else:
                cleaned = cleaned[brace_start:]
        elif bracket_start != -1:
            end = cleaned.rfind(']')
            if end != -1 and end > bracket_start:
                cleaned = cleaned[bracket_start:end+1]
            else:
                cleaned = cleaned[bracket_start:]
            
    cleaned = cleaned.strip()
    
    # Very basic attempt to auto-close truncated JSON if it's missing a final brace/bracket
    if cleaned.count('{') > cleaned.count('}'):
        cleaned += '}' * (cleaned.count('{') - cleaned.count('}'))
    if cleaned.count('[') > cleaned.count(']'):
        cleaned += ']' * (cleaned.count('[') - cleaned.count(']'))
        
    return cleaned
