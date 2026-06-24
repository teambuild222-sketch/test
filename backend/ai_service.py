import os
import json
import math
import logging
from typing import Generator, List, Dict, Any
from groq import Groq
from sqlalchemy.orm import Session
from database import User, UserInterest, Event, EventMember, UserConnection, Badge, UserBadge, RewardEvent, ChatRoom, Message

from dotenv import load_dotenv

# Ensure environment variables are loaded
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

logger = logging.getLogger("ai_service")

# Models definition
PRIMARY_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
FALLBACK_MODEL = "llama-3.1-8b-instant"

def is_groq_configured() -> bool:
    key = os.getenv("GROQ_API_KEY")
    if not key:
        return False
    key_lower = key.lower().strip()
    if not key_lower or "your" in key_lower or "placeholder" in key_lower or key_lower == "gsk_":
        return False
    return True

def get_groq_client():
    if not is_groq_configured():
        return None
    key = os.getenv("GROQ_API_KEY")
    try:
        return Groq(api_key=key)
    except Exception as e:
        logger.error(f"Error details - Groq client initialization failed: {e}")
        return None


# Haversine distance formula
def calculate_distance(lat1, lon1, lat2, lon2):
    if None in (lat1, lon1, lat2, lon2):
        return 0.0
    R = 6371.0  # Earth radius in kilometers
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = math.sin(d_lat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

# Database queries mapped to AI tools
def tool_search_events(db: Session, user: User, category: str = None, max_distance: float = None, sort_by: str = "distance") -> str:
    query = db.query(Event)
    if category and category.lower() != "all":
        # Case insensitive filter
        query = query.filter(Event.category.ilike(f"%{category}%"))
    
    events = query.all()
    results = []
    
    for e in events:
        dist = calculate_distance(user.latitude, user.longitude, e.latitude, e.longitude)
        if max_distance is not None and dist > max_distance:
            continue
        
        # Check if user is attending
        is_attending = db.query(EventMember).filter_by(event_id=e.id, user_id=user.id).first() is not None
        
        results.append({
            "id": e.id,
            "title": e.title,
            "category": e.category,
            "description": e.description,
            "date": e.date,
            "time": e.time,
            "location": e.location,
            "distance_km": round(dist, 1),
            "popularity": e.popularity,
            "image": e.image,
            "is_attending": is_attending,
            "attendees_count": len(e.members)
        })
    
    # Sort
    if sort_by == "popularity":
        results.sort(key=lambda x: x["popularity"], reverse=True)
    else:
        results.sort(key=lambda x: x["distance_km"])
        
    if not results:
        return "No events found matching your criteria in Hyderabad."
        
    # Format results as XML tags so frontend can render rich cards
    card_strings = []
    for r in results:
        card = (
            f'<event-card id="{r["id"]}" title="{r["title"]}" category="{r["category"]}" '
            f'date="{r["date"]}" time="{r["time"]}" location="{r["location"]}" '
            f'image="{r["image"]}" attendees="{r["attendees_count"]}" '
            f'distance="{r["distance_km"]} km" attending="{str(r["is_attending"]).lower()}" />'
        )
        card_strings.append(card)
        
    return "\n\n".join(card_strings)

def tool_get_community_recommendations(db: Session, user: User) -> str:
    user_interest_list = [i.interest.lower() for i in user.interests]
    
    # Predefined communities matching interests
    communities = [
        {"title": "Hyderabad Cricket Club", "category": "Cricket", "description": "Weekly net practice and local club tournaments around Gachibowli.", "members": 154},
        {"title": "Madhapur Football League", "category": "Football", "description": "7v7 turf football games, friendly matches and weekend leagues.", "members": 98},
        {"title": "Comedy & Arts Collective", "category": "Standup Comedy", "description": "Open mic performers, workshop hosts, and standup enthusiasts.", "members": 210},
        {"title": "Hyderabad Run Club", "category": "Fitness", "description": "Active community for morning jogs, marathon prep, and outdoor fitness.", "members": 87},
        {"title": "Secunderabad Tennis Club", "category": "Tennis", "description": "Tennis matches, court booking groups, and practice sessions.", "members": 43}
    ]
    
    recommended = []
    # Filter based on interests
    for c in communities:
        matches = c["category"].lower() in user_interest_list or any(interest in c["description"].lower() for interest in user_interest_list)
        if matches:
            recommended.append(c)
            
    # Fallback to all if no interest matched
    if not recommended:
        recommended = communities[:3]
        
    card_strings = []
    for r in recommended:
        card = (
            f'<community-card title="{r["title"]}" category="{r["category"]}" '
            f'description="{r["description"]}" members="{r["members"]}" />'
        )
        card_strings.append(card)
        
    return "\n\n".join(card_strings)

def tool_get_profile_details(db: Session, user: User) -> str:
    # Fetch earned badges
    badges = db.query(Badge).join(UserBadge).filter(UserBadge.user_id == user.id).all()
    badge_list = [b.name for b in badges]
    
    response = {
        "fullname": user.fullname,
        "username": user.username,
        "avatar": user.avatar,
        "points": user.points,
        "activity_level": user.activity_level,
        "interests": [i.interest for i in user.interests],
        "badges": badge_list
    }
    
    details_str = (
        f"**Profile Details:**\n"
        f"- **Name:** {user.fullname} (@{user.username})\n"
        f"- **Points:** {user.points} XP\n"
        f"- **Level:** {user.activity_level}\n"
        f"- **Interests:** {', '.join(response['interests'])}\n"
        f"- **Earned Badges:** {', '.join(badge_list) if badge_list else 'None yet'}\n"
    )
    
    # Render badges visually
    card_strings = []
    for b in badges:
        card = f'<badge-card name="{b.name}" description="{b.description}" color="{b.color}" image="{b.image}" unlocked="true" />'
        card_strings.append(card)
        
    if card_strings:
        details_str += "\n\n" + "\n\n".join(card_strings)
        
    return details_str

def tool_create_event(db: Session, user: User, title: str, category: str, date: str, time: str, location: str, description: str = "", rules: str = "", schedule: str = "") -> str:
    try:
        new_event = Event(
            title=title,
            category=category,
            description=description,
            rules=rules,
            schedule=schedule,
            date=date,
            time=time,
            location=location,
            latitude=user.latitude,  # default to creator's location
            longitude=user.longitude,
            popularity=0,
            image="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=400&h=250&q=80"  # default cover
        )
        db.add(new_event)
        db.commit()
        db.refresh(new_event)
        
        # Add creator as attending
        db.add(EventMember(event_id=new_event.id, user_id=user.id, rsvp_status="Attending"))
        db.commit()
        
        # Award reward points for hosting!
        user.points += 100
        db.add(RewardEvent(user_id=user.id, points=100, reason=f"Created Event: {title}"))
        db.commit()
        
        card = (
            f'<event-card id="{new_event.id}" title="{new_event.title}" category="{new_event.category}" '
            f'date="{new_event.date}" time="{new_event.time}" location="{new_event.location}" '
            f'image="{new_event.image}" attendees="1" distance="0.0 km" attending="true" />'
        )
        
        return f"🎉 Event **'{title}'** has been successfully created! You've earned **100 XP** for organizing a community event.\n\nHere is your new event card:\n\n{card}"
    except Exception as e:
        db.rollback()
        return f"Failed to create event: {str(e)}"

def tool_get_social_connections(db: Session, user: User) -> str:
    # Retrieve all users except admin
    all_users = db.query(User).filter(User.id != user.id).all()
    suggested = []
    
    for u in all_users:
        # Check connection status
        conn = db.query(UserConnection).filter(
            ((UserConnection.user_id == user.id) & (UserConnection.connection_id == u.id)) |
            ((UserConnection.user_id == u.id) & (UserConnection.connection_id == user.id))
        ).first()
        
        status = conn.status if conn else "not_connected"
        dist = calculate_distance(user.latitude, user.longitude, u.latitude, u.longitude)
        
        suggested.append({
            "id": u.id,
            "name": u.fullname,
            "username": u.username,
            "avatar": u.avatar,
            "bio": u.bio,
            "city": u.city,
            "distance_km": round(dist, 1),
            "status": status,
            "points": u.points,
            "level": u.activity_level
        })
        
    card_strings = []
    for s in suggested:
        card = (
            f'<user-card id="{s["id"]}" name="{s["name"]}" username="{s["username"]}" '
            f'avatar="{s["avatar"]}" bio="{s["bio"]}" distance="{s["distance_km"]} km" '
            f'status="{s["status"]}" points="{s["points"]}" level="{s["level"]}" />'
        )
        card_strings.append(card)
        
    return "\n\n".join(card_strings)

def tool_get_rewards_info(db: Session, user: User) -> str:
    # Fetch user points history
    history = db.query(RewardEvent).filter_by(user_id=user.id).order_by(RewardEvent.created_at.desc()).all()
    history_str = "\n".join([f"- **+{h.points} XP**: {h.reason} ({h.created_at.strftime('%Y-%m-%d')})" for h in history])
    
    # Leaderboard
    all_users = db.query(User).order_by(User.points.desc()).all()
    leaderboard = []
    for idx, u in enumerate(all_users):
        leaderboard.append(f"{idx+1}. **{u.fullname}** - {u.points} XP ({u.activity_level})")
        
    badges = db.query(Badge).all()
    badge_cards = []
    for b in badges:
        unlocked = db.query(UserBadge).filter_by(user_id=user.id, badge_id=b.id).first() is not None
        card = f'<badge-card name="{b.name}" description="{b.description}" color="{b.color}" image="{b.image}" unlocked="{str(unlocked).lower()}" />'
        badge_cards.append(card)
        
    response = (
        f"🏆 **Zenex Rewards & Badges Guide**\n\n"
        f"You are currently at **{user.points} XP** (**{user.activity_level} Level**).\n\n"
        f"📊 **Platform Leaderboard:**\n" + "\n".join(leaderboard) + "\n\n"
        f"📝 **Your Recent Activity points:**\n" + history_str + "\n\n"
        f"🏅 **Badge Collection Achievements:**\n" + "\n\n".join(badge_cards)
    )
    return response

# Groq Function Definitions
TOOLS_SCHEMA = [
    {
        "type": "function",
        "function": {
            "name": "search_events",
            "description": "Find sports, matches, music nights, arts, or local events in Hyderabad.",
            "parameters": {
                "type": "object",
                "properties": {
                    "category": {"type": "string", "description": "The category of events to search for (e.g. Cricket, Football, Entertainment, Arts, Fitness, Wellness, All)"},
                    "max_distance": {"type": "number", "description": "Maximum distance in kilometers from the user"},
                    "sort_by": {"type": "string", "enum": ["distance", "popularity"], "description": "Sort the results by distance or popularity"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_community_recommendations",
            "description": "Get suggested local sports clubs, entertainment groups, or community hangouts based on user interests.",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_profile_details",
            "description": "Get current logged-in user profile metrics including points, activity level, interests, and earned badges.",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_event",
            "description": "Help users create a new custom sports match or entertainment activity in the database.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "The name or title of the event"},
                    "category": {"type": "string", "description": "The sport or event category (e.g. Cricket, Football, Standup Comedy, Yoga)"},
                    "date": {"type": "string", "description": "The date of the event (e.g., 'Sun, June 14')"},
                    "time": {"type": "string", "description": "The starting time (e.g., '5:00 PM')"},
                    "location": {"type": "string", "description": "Location description/address in Hyderabad (e.g., 'Madhapur Turf')"},
                    "description": {"type": "string", "description": "Short explanation of what the event is about"},
                    "rules": {"type": "string", "description": "Rules of play or participation guidelines (newline separated)"},
                    "schedule": {"type": "string", "description": "Schedule/itinerary of the event (newline separated)"}
                },
                "required": ["title", "category", "date", "time", "location"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_social_connections",
            "description": "Recommend local users, captains, and event organizers nearby in Hyderabad to connect with.",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_rewards_info",
            "description": "Explain rewards, levels, check your points history, leaderboard standings, and badges description.",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    }
]

# Run tool function execution locally
def execute_tool(name: str, arguments: Dict[str, Any], db: Session, user: User) -> str:
    try:
        logger.info(f"Executing tool {name} with args: {arguments}")
        if name == "search_events":
            return tool_search_events(db, user, **arguments)
        elif name == "get_community_recommendations":
            return tool_get_community_recommendations(db, user)
        elif name == "get_profile_details":
            return tool_get_profile_details(db, user)
        elif name == "create_event":
            return tool_create_event(db, user, **arguments)
        elif name == "get_social_connections":
            return tool_get_social_connections(db, user)
        elif name == "get_rewards_info":
            return tool_get_rewards_info(db, user)
        else:
            return f"Error: Tool '{name}' not found."
    except Exception as e:
        logger.error(f"Error executing tool {name}: {e}")
        return f"Error executing database query: {str(e)}"

# Construct detailed system prompt context
def build_system_prompt(user: User, db: Session) -> str:
    interests_str = ", ".join([i.interest for i in user.interests])
    badges = db.query(Badge).join(UserBadge).filter(UserBadge.user_id == user.id).all()
    badges_str = ", ".join([b.name for b in badges])
    events = db.query(Event).join(EventMember).filter(EventMember.user_id == user.id).all()
    events_str = ", ".join([e.title for e in events])
    
    system_prompt = (
        f"You are ZENEX AI, the premium floating personal assistant for the Zenex platform.\n"
        f"Tagline: 'Connect. Play. Experience.'\n"
        f"Purpose: You assist users with sports events, entertainment activities, local communities, social networking, rewards, and general app support.\n\n"
        f"USER CONTEXT PROFILE:\n"
        f"- Name: {user.fullname} (@{user.username})\n"
        f"- Level: {user.activity_level}\n"
        f"- Points: {user.points} XP\n"
        f"- Location: {user.city} (Latitude: {user.latitude}, Longitude: {user.longitude})\n"
        f"- Interests: {interests_str if interests_str else 'None listed'}\n"
        f"- Joined Events: {events_str if events_str else 'None yet'}\n"
        f"- Unlocked Badges: {badges_str if badges_str else 'None yet'}\n\n"
        f"BEHAVIOR RULES:\n"
        f"1. Tone: Warm, clean, concise, polite, premium (Apple-inspired).\n"
        f"2. Formatting: Use markdown (lists, bold text, etc.). Do not return blocky walls of text.\n"
        f"3. Rich Card Rendering: To show structured recommendations (like Events, Communities, Users, or Badges), use the following custom XML-like tag patterns. The frontend parses these tags into beautiful glassmorphic visual cards. Place them directly in your response on their own lines:\n"
        f"   - Event Card: `<event-card id=\"[id]\" title=\"[title]\" category=\"[category]\" date=\"[date]\" time=\"[time]\" location=\"[location]\" image=\"[image_url]\" attendees=\"[count]\" distance=\"[X.X km]\" attending=\"[true/false]\" />`\n"
        f"   - Community Card: `<community-card title=\"[title]\" category=\"[category]\" description=\"[desc]\" members=\"[count]\" />`\n"
        f"   - User Card: `<user-card id=\"[id]\" name=\"[name]\" username=\"[username]\" avatar=\"[avatar_url]\" bio=\"[bio]\" distance=\"[X.X km]\" status=\"[connected/pending/not_connected]\" points=\"[XP]\" level=\"[Level]\" />`\n"
        f"   - Badge Card: `<badge-card name=\"[name]\" description=\"[desc]\" color=\"[yellow/green/blue/purple]\" image=\"[emoji]\" unlocked=\"[true/false]\" />`\n\n"
        f"4. Tool Integration: Always use tools if the user is looking for events, communities, connections, rewards, or profiles. For example, if they say 'Find football matches', use `search_events(category='Football')` rather than making up events. The tools pull live database data.\n"
        f"5. Fallback: If any information is missing or tools fail, guide the user politely.\n\n"
        f"EXAMPLE DIALOGUES:\n"
        f"User: Hello\n"
        f"ZENEX AI: Hi 👋 I'm ZENEX AI. How can I help you today?\n"
        f"User: Find cricket events near me\n"
        f"ZENEX AI: I found several cricket events happening near your location."
    )
    return system_prompt

# Main API streaming function
def stream_response(db: Session, user: User, message_history: List[Dict[str, str]], cancel_event: Any = None) -> Generator[str, None, None]:
    if not is_groq_configured():
        dev_msg = "Hello 👋 I'm ZENEX AI. The AI backend is currently in development mode."
        logger.info("Groq is not configured. Streaming development mode message.")
        yield dev_msg
        return

    client = get_groq_client()
    if not client:
        fallback_msg = "Hi 👋 I'm ZENEX AI. My AI services are temporarily unavailable, but I'm still online. Please try again in a few moments."
        logger.warning("Groq client creation failed. Streaming fallback message.")
        yield fallback_msg
        return

    system_prompt = build_system_prompt(user, db)
    
    # Formulate API messages
    api_messages = [{"role": "system", "content": system_prompt}]
    for msg in message_history:
        api_messages.append({"role": msg["role"], "content": msg["content"]})
        
    try:
        # 1. Primary Model Call
        logger.info(f"Request sent to Groq. Primary Model: {PRIMARY_MODEL}")
        response = client.chat.completions.create(
            model=PRIMARY_MODEL,
            messages=api_messages,
            tools=TOOLS_SCHEMA,
            tool_choice="auto",
            stream=False  # Do not stream first if we need to check for tool calls
        )
        logger.info("Response received from Groq (Primary Model first call successful)")
    except Exception as e:
        logger.warning(f"Error details - Primary model call failed: {e}. Attempting fallback model: {FALLBACK_MODEL}")
        logger.info(f"Request sent to Groq. Fallback Model: {FALLBACK_MODEL}")
        try:
            # Fallback model call
            response = client.chat.completions.create(
                model=FALLBACK_MODEL,
                messages=api_messages,
                tools=TOOLS_SCHEMA,
                tool_choice="auto",
                stream=False
            )
            logger.info("Response received from Groq (Fallback Model call successful)")
        except Exception as fallback_e:
            logger.error(f"Error details - Fallback model also failed: {fallback_e}")
            fallback_msg = "Hi 👋 I'm ZENEX AI. My AI services are temporarily unavailable, but I'm still online. Please try again in a few moments."
            yield fallback_msg
            return

    # Check for tool/function calls
    response_message = response.choices[0].message
    tool_calls = response_message.tool_calls
    
    if tool_calls:
        # Add assistant tool request message to conversation history
        api_messages.append(response_message)
        
        # Execute each tool call and add the results to history
        for tool_call in tool_calls:
            if cancel_event and cancel_event.is_set():
                logger.info("Stream generation cancelled by client before tool execution.")
                yield "[Generation Cancelled]"
                return
                
            function_name = tool_call.function.name
            function_args = json.loads(tool_call.function.arguments)
            tool_result = execute_tool(function_name, function_args, db, user)
            
            api_messages.append({
                "tool_call_id": tool_call.id,
                "role": "tool",
                "name": function_name,
                "content": tool_result
            })
            
        # Re-submit to the model to generate the final response with the tool output
        try:
            logger.info(f"Request sent to Groq (Re-submit streaming). Primary Model: {PRIMARY_MODEL}")
            stream = client.chat.completions.create(
                model=PRIMARY_MODEL,
                messages=api_messages,
                stream=True
            )
        except Exception as stream_e:
            logger.warning(f"Error details - Re-submitting failed with primary model: {stream_e}. Attempting fallback...")
            logger.info(f"Request sent to Groq (Re-submit streaming). Fallback Model: {FALLBACK_MODEL}")
            try:
                stream = client.chat.completions.create(
                    model=FALLBACK_MODEL,
                    messages=api_messages,
                    stream=True
                )
            except Exception as stream_fallback_e:
                logger.error(f"Error details - Fallback streaming also failed: {stream_fallback_e}")
                fallback_msg = "Hi 👋 I'm ZENEX AI. My AI services are temporarily unavailable, but I'm still online. Please try again in a few moments."
                yield fallback_msg
                return
                
        # Yield the streamed final content
        for chunk in stream:
            if cancel_event and cancel_event.is_set():
                logger.info("Stream generation cancelled by client during streaming.")
                yield "[Generation Cancelled]"
                return
            content = chunk.choices[0].delta.content
            if content:
                yield content
    else:
        # No tool calls needed, we can just yield the text from the response we already have,
        # or we could have streamed it. Since we did stream=False to inspect tool calls,
        # we can just yield the whole response content at once, or chunk it slightly for streaming feel.
        content = response_message.content
        if content:
            # Yield in smaller pieces to simulate streaming if it was synchronous
            chunk_size = 15
            for i in range(0, len(content), chunk_size):
                if cancel_event and cancel_event.is_set():
                    logger.info("Stream generation cancelled by client during synchronous chunking.")
                    yield "[Generation Cancelled]"
                    return
                yield content[i:i+chunk_size]

