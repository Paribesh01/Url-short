"""User-agent string parsing for click analytics."""

from user_agents import parse as parse_user_agent


def parse_client(user_agent_string: str | None) -> dict:
    if not user_agent_string:
        return {"browser": "Unknown", "os": "Unknown", "device_type": "Unknown"}

    ua = parse_user_agent(user_agent_string)

    if ua.is_mobile:
        device_type = "Mobile"
    elif ua.is_tablet:
        device_type = "Tablet"
    elif ua.is_pc:
        device_type = "Desktop"
    else:
        device_type = "Other"

    return {
        "browser": ua.browser.family or "Unknown",
        "os": ua.os.family or "Unknown",
        "device_type": device_type,
    }
