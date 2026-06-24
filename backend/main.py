import os
import json
import logging
import asyncio
from datetime import datetime
from contextlib import asynccontextmanager
from typing import Dict, Any, List
from fastapi import FastAPI, Depends, HTTPException, Header, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

# Local imports
from database import init_db, SessionLocal, User, Event, EventMember, UserConnection, AIConversation, AIMessage, Badge, UserBadge, RewardEvent
from ai_service import stream_response, execute_tool, build_system_prompt, TOOLS_SCHEMA, is_groq_configured

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("main")

# Global dict to store cancel events for streams
cancel_events: Dict[int, asyncio.Event] = {}

# Lifespan event handler
@asynccontextmanager
async def app_lifespan(app: FastAPI):
    logger.info("Initializing database...")
    init_db()
    yield
    logger.info("Shutting down...")

app = FastAPI(lifespan=app_lifespan)

# Allow CORS for local dev environment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Helper to get current user based on username in header
def get_current_user(db: Session = Depends(get_db), x_user_username: str = Header(default="admin")) -> User:
    user = db.query(User).filter_by(username=x_user_username).first()
    if not user:
        # Fallback to admin if not found
        user = db.query(User).filter_by(username="admin").first()
    if not user:
        raise HTTPException(status_code=404, detail="Active user not found in database.")
    return user

# Request/Response Schemas
class MessageCreate(BaseModel):
    text: str

class ConversationCreate(BaseModel):
    title: str = "New Conversation"

# Simple test route
@app.get("/api/message")
async def read_message() -> dict:
    return {"message": "Hello from Zenex Python backend!"}

# Health Check Endpoint
@app.get("/api/ai/health")
async def ai_health():
    return {
        "status": "online",
        "provider": "groq"
    }

# --- AI CHAT CONVERSATIONS ENDPOINTS ---

@app.get("/api/ai/conversations")
def list_conversations(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    convs = db.query(AIConversation).filter_by(user_id=user.id).order_by(AIConversation.updated_at.desc()).all()
    return [{
        "id": c.id,
        "title": c.title,
        "created_at": c.created_at.isoformat(),
        "updated_at": c.updated_at.isoformat()
    } for c in convs]

@app.post("/api/ai/conversations")
def create_conversation(payload: ConversationCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    try:
        conv = AIConversation(title=payload.title, user_id=user.id)
        db.add(conv)
        db.commit()
        db.refresh(conv)
        return {
            "id": conv.id,
            "title": conv.title,
            "created_at": conv.created_at.isoformat(),
            "updated_at": conv.updated_at.isoformat()
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/ai/conversations/{conv_id}")
def delete_conversation(conv_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    conv = db.query(AIConversation).filter_by(id=conv_id, user_id=user.id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    try:
        db.delete(conv)
        db.commit()
        return {"success": True, "message": "Conversation deleted successfully."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ai/conversations/{conv_id}/messages")
def get_conversation_messages(conv_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    conv = db.query(AIConversation).filter_by(id=conv_id, user_id=user.id).first()
    if not conv:
        raise HTTPException(status_code=444, detail="Conversation not found")
    
    return [{
        "id": m.id,
        "sender": m.sender,
        "text": m.text,
        "created_at": m.created_at.isoformat()
    } for m in conv.messages]

# Cancel stream endpoint
@app.post("/api/ai/conversations/{conv_id}/cancel")
def cancel_conversation_stream(conv_id: int):
    if conv_id in cancel_events:
        cancel_events[conv_id].set()
        logger.info(f"Cancellation requested for stream in conversation: {conv_id}")
        return {"success": True, "message": "Cancellation request submitted."}
    return {"success": False, "message": "No active stream found to cancel."}

# Main Streaming SSE Endpoint
@app.post("/api/ai/conversations/{conv_id}/stream")
async def stream_ai_chat(
    conv_id: int,
    payload: MessageCreate,
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    # Ensure conversation exists
    conv = db.query(AIConversation).filter_by(id=conv_id, user_id=user.id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    user_text = payload.text.strip()
    if not user_text:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    # 1. Save user message in database
    user_msg = AIMessage(conversation_id=conv_id, sender="user", text=user_text)
    db.add(user_msg)
    conv.updated_at = datetime.utcnow()
    db.commit()
    
    # Check for slash commands
    if user_text.startswith("/"):
        # Instant slash command parser (Bypasses Groq to return instant structured card output)
        command = user_text.split(" ")[0].lower()
        logger.info(f"Processing slash command: {command}")
        
        instant_response = ""
        if command == "/events":
            instant_response = "Here are the current upcoming events in Hyderabad:\n\n" + execute_tool("search_events", {}, db, user)
        elif command == "/profile":
            instant_response = execute_tool("get_profile_details", {}, db, user)
        elif command == "/rewards":
            instant_response = execute_tool("get_rewards_info", {}, db, user)
        elif command == "/badges":
            instant_response = execute_tool("get_rewards_info", {}, db, user)  # Rewards tool outputs badges too
        elif command == "/community":
            instant_response = "Here are recommended community groups based on your interests:\n\n" + execute_tool("get_community_recommendations", {}, db, user)
        elif command == "/leaderboard":
            instant_response = execute_tool("get_rewards_info", {}, db, user)
        elif command == "/help":
            instant_response = (
                "🤖 **Zenex AI Help Center**\n\n"
                "I am your premium assistant for sports, entertainment, rewards, and support.\n\n"
                "💡 **Supported Slash Commands:**\n"
                "- `/events` - Search and discover nearby sports/entertainment matches.\n"
                "- `/profile` - Check your profile status, XP level, and interests.\n"
                "- `/rewards` - View rewards history, leaderboard, and badge details.\n"
                "- `/badges` - View all unlocked achievements and badges.\n"
                "- `/community` - Get customized community recommendations.\n"
                "- `/leaderboard` - Show the platform's top participants.\n"
                "- `/help` - View this help menu.\n\n"
                "You can also ask me anything in natural language, like *'Find cricket matches near me'* or *'Suggest some people to connect with'*!"
            )
        else:
            instant_response = f"Unknown command: `{command}`. Type `/help` to view a list of supported commands."
            
        # Save AI reply to database
        ai_msg = AIMessage(conversation_id=conv_id, sender="assistant", text=instant_response)
        db.add(ai_msg)
        db.commit()
        
        async def generate_instant():
            # Yield characters or words with slight delay to simulate a fast stream
            words = instant_response.split(" ")
            for w in words:
                yield w + " "
                await asyncio.sleep(0.01)
                
        return StreamingResponse(generate_instant(), media_type="text/event-stream")

    # 2. Regular message: retrieve previous conversation history (excluding system prompt context which is appended in service)
    history_msgs = db.query(AIMessage).filter_by(conversation_id=conv_id).order_by(AIMessage.id).all()
    # Format message history for Groq api (take last 20 messages for context)
    formatted_history = []
    for hm in history_msgs[-20:]:
        role = "user" if hm.sender == "user" else "assistant"
        formatted_history.append({"role": role, "content": hm.text})
        
    # Setup cancellation event for this stream
    cancel_events[conv_id] = asyncio.Event()
    
    # 3. Stream generator
    async def generator():
        full_reply = ""
        loop = asyncio.get_event_loop()
        
        try:
            logger.info(f"User message received (Streaming): '{user_text}' in conversation {conv_id}")
            # We run the generator in a thread pool since Groq sdk is synchronous
            def get_chunks():
                return list(stream_response(db, user, formatted_history, cancel_events[conv_id]))
                
            chunks = await loop.run_in_executor(None, get_chunks)
            
            for chunk in chunks:
                if cancel_events[conv_id].is_set() or chunk == "[Generation Cancelled]":
                    yield "[Generation Cancelled]"
                    break
                full_reply += chunk
                yield chunk
                await asyncio.sleep(0.005) # smooth stream
                
            logger.info(f"Response received (Streaming completed). Final text length: {len(full_reply)}")
        except Exception as e:
            logger.error(f"Error details - Error in stream generator: {e}")
            fallback_response = "Hi 👋 I'm ZENEX AI. My AI services are temporarily unavailable, but I'm still online. Please try again in a few moments."
            yield fallback_response
            full_reply = fallback_response
        finally:
            # Clean up cancel event
            cancel_events.pop(conv_id, None)
            
            # Save final response to database if we got a substantial reply and not cancelled
            if full_reply and "[Generation Cancelled]" not in full_reply:
                # Need a new DB session since the request context session might be closed or async
                db_save = SessionLocal()
                try:
                    ai_reply = AIMessage(conversation_id=conv_id, sender="assistant", text=full_reply)
                    db_save.add(ai_reply)
                    db_save.commit()
                except Exception as save_err:
                    logger.error(f"Error saving AI message: {save_err}")
                finally:
                    db_save.close()

    return StreamingResponse(generator(), media_type="text/event-stream")


class ChatPayload(BaseModel):
    conversation_id: int
    text: str

@app.post("/api/ai/chat")
def ai_chat(
    payload: ChatPayload,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    logger.info("Request received: POST /api/ai/chat")
    
    conv_id = payload.conversation_id
    user_text = payload.text.strip()
    
    # Ensure conversation exists
    conv = db.query(AIConversation).filter_by(id=conv_id, user_id=user.id).first()
    if not conv:
        conv = AIConversation(title="New Conversation", user_id=user.id)
        db.add(conv)
        db.commit()
        db.refresh(conv)
        conv_id = conv.id
        
    # Save user message to database
    user_msg = AIMessage(conversation_id=conv_id, sender="user", text=user_text)
    db.add(user_msg)
    conv.updated_at = datetime.utcnow()
    db.commit()
    
    logger.info(f"User message received: '{user_text}' in conversation {conv_id}")

    # Check if Groq is configured
    if not is_groq_configured():
        dev_response = "Hello 👋 I'm ZENEX AI. The AI backend is currently in development mode."
        logger.info("Groq is not configured. Returning development mode message.")
        ai_msg = AIMessage(conversation_id=conv_id, sender="assistant", text=dev_response)
        db.add(ai_msg)
        db.commit()
        db.refresh(ai_msg)
        return {
            "id": ai_msg.id,
            "sender": "assistant",
            "text": dev_response,
            "created_at": ai_msg.created_at.isoformat()
        }

    # Get context (last 20 messages)
    history_msgs = db.query(AIMessage).filter_by(conversation_id=conv_id).order_by(AIMessage.id).all()
    formatted_history = []
    for hm in history_msgs[-20:]:
        role = "user" if hm.sender == "user" else "assistant"
        formatted_history.append({"role": role, "content": hm.text})
        
    # Initialize Groq client
    groq_api_key = os.getenv("GROQ_API_KEY")
    from groq import Groq
    try:
        groq_client = Groq(api_key=groq_api_key)
    except Exception as init_err:
        logger.error(f"Error details - Groq client initialization failed: {init_err}")
        fallback_response = "Hi 👋 I'm ZENEX AI. My AI services are temporarily unavailable, but I'm still online. Please try again in a few moments."
        ai_msg = AIMessage(conversation_id=conv_id, sender="assistant", text=fallback_response)
        db.add(ai_msg)
        db.commit()
        db.refresh(ai_msg)
        return {
            "id": ai_msg.id,
            "sender": "assistant",
            "text": fallback_response,
            "created_at": ai_msg.created_at.isoformat()
        }
        
    system_prompt = build_system_prompt(user, db)
    api_messages = [{"role": "system", "content": system_prompt}]
    for msg in formatted_history:
        api_messages.append({"role": msg["role"], "content": msg["content"]})
        
    primary_model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    fallback_model = "llama-3.1-8b-instant"
    
    ai_response_text = ""
    completion = None
    
    logger.info(f"Request sent to Groq. Primary Model: {primary_model}, Prompt: {user_text}")
    
    try:
        completion = groq_client.chat.completions.create(
            model=primary_model,
            messages=api_messages,
            tools=TOOLS_SCHEMA,
            tool_choice="auto"
        )
        logger.info(f"Response received from Groq (Primary Model): {completion.choices[0].message.content or '[tool call]'}")
    except Exception as e:
        logger.warning(f"Error details - Groq primary model call failed: {e}. Falling back to {fallback_model}...")
        logger.info(f"Request sent to Groq. Fallback Model: {fallback_model}, Prompt: {user_text}")
        try:
            completion = groq_client.chat.completions.create(
                model=fallback_model,
                messages=api_messages,
                tools=TOOLS_SCHEMA,
                tool_choice="auto"
            )
            logger.info(f"Response received from Groq (Fallback Model): {completion.choices[0].message.content or '[tool call]'}")
        except Exception as fallback_e:
            logger.error(f"Error details - Groq fallback model call failed: {fallback_e}")
            fallback_response = "Hi 👋 I'm ZENEX AI. My AI services are temporarily unavailable, but I'm still online. Please try again in a few moments."
            ai_msg = AIMessage(conversation_id=conv_id, sender="assistant", text=fallback_response)
            db.add(ai_msg)
            db.commit()
            db.refresh(ai_msg)
            return {
                "id": ai_msg.id,
                "sender": "assistant",
                "text": fallback_response,
                "created_at": ai_msg.created_at.isoformat()
            }

    # Process response
    response_message = completion.choices[0].message
    tool_calls = response_message.tool_calls
    
    if tool_calls:
        api_messages.append(response_message)
        for tool_call in tool_calls:
            func_name = tool_call.function.name
            func_args = json.loads(tool_call.function.arguments)
            tool_result = execute_tool(func_name, func_args, db, user)
            
            api_messages.append({
                "tool_call_id": tool_call.id,
                "role": "tool",
                "name": func_name,
                "content": tool_result
            })
            
        try:
            logger.info(f"Request sent to Groq (Re-submit). Primary Model: {primary_model}")
            completion2 = groq_client.chat.completions.create(
                model=primary_model,
                messages=api_messages
            )
            ai_response_text = completion2.choices[0].message.content
            logger.info(f"Response received from Groq (Re-submit Primary Model): {ai_response_text}")
        except Exception as e2:
            logger.warning(f"Error details - Re-submitting failed with primary model: {e2}. Trying fallback...")
            logger.info(f"Request sent to Groq (Re-submit). Fallback Model: {fallback_model}")
            try:
                completion2 = groq_client.chat.completions.create(
                    model=fallback_model,
                    messages=api_messages
                )
                ai_response_text = completion2.choices[0].message.content
                logger.info(f"Response received from Groq (Re-submit Fallback Model): {ai_response_text}")
            except Exception as fallback_e2:
                logger.error(f"Error details - Re-submit fallback failed: {fallback_e2}")
                fallback_response = "Hi 👋 I'm ZENEX AI. My AI services are temporarily unavailable, but I'm still online. Please try again in a few moments."
                ai_msg = AIMessage(conversation_id=conv_id, sender="assistant", text=fallback_response)
                db.add(ai_msg)
                db.commit()
                db.refresh(ai_msg)
                return {
                    "id": ai_msg.id,
                    "sender": "assistant",
                    "text": fallback_response,
                    "created_at": ai_msg.created_at.isoformat()
                }
    else:
        ai_response_text = response_message.content
        
    if not ai_response_text:
        ai_response_text = "I received your message but could not generate a response."
        
    logger.info(f"Response received (completed len={len(ai_response_text)})")
    
    # Save response to database
    ai_msg = AIMessage(conversation_id=conv_id, sender="assistant", text=ai_response_text)
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)
    
    logger.info("Response returned to frontend")
    
    return {
        "id": ai_msg.id,
        "sender": "assistant",
        "text": ai_response_text,
        "created_at": ai_msg.created_at.isoformat()
    }


# --- SYSTEM INTEGRATION INTERACTIONS ENDPOINTS ---

class RsvpRequest(BaseModel):
    event_id: int
    status: str = "Attending"

@app.post("/api/event/rsvp")
def event_rsvp(payload: RsvpRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    event = db.query(Event).filter_by(id=payload.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    rsvp = db.query(EventMember).filter_by(event_id=payload.event_id, user_id=user.id).first()
    if rsvp:
        rsvp.rsvp_status = payload.status
        db.commit()
        msg = f"Updated RSVP to {payload.status}."
    else:
        rsvp = EventMember(event_id=payload.event_id, user_id=user.id, rsvp_status=payload.status)
        db.add(rsvp)
        
        # Award XP points for joining!
        user.points += 50
        db.add(RewardEvent(user_id=user.id, points=50, reason=f"RSVP'd to Event: {event.title}"))
        db.commit()
        msg = f"Successfully RSVP'd as {payload.status}. You earned 50 XP!"
        
    return {"success": True, "message": msg, "points": user.points, "activity_level": user.activity_level}

class ConnectRequest(BaseModel):
    connection_id: int
    status: str = "connected"

@app.post("/api/user/connect")
def user_connect(payload: ConnectRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    target_user = db.query(User).filter_by(id=payload.connection_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    conn = db.query(UserConnection).filter(
        ((UserConnection.user_id == user.id) & (UserConnection.connection_id == payload.connection_id)) |
        ((UserConnection.user_id == payload.connection_id) & (UserConnection.connection_id == user.id))
    ).first()
    
    if conn:
        conn.status = payload.status
        db.commit()
        msg = f"Connection status updated to: {payload.status}."
    else:
        conn = UserConnection(user_id=user.id, connection_id=payload.connection_id, status=payload.status)
        db.add(conn)
        
        # Award XP for networking!
        user.points += 30
        db.add(RewardEvent(user_id=user.id, points=30, reason=f"Connected with {target_user.fullname}"))
        db.commit()
        msg = f"Successfully sent connection request to {target_user.fullname}. You earned 30 XP!"
        
    return {"success": True, "message": msg, "points": user.points, "activity_level": user.activity_level}
