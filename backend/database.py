import os
import logging
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Table, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from dotenv import load_dotenv

# Load env variables
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("database")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://username:password@localhost:5432/zenex")

# Fallback to SQLite if Postgres connection fails
try:
    if DATABASE_URL.startswith("postgresql"):
        # Test engine creation and connection
        engine = create_engine(DATABASE_URL, connect_args={'connect_timeout': 3})
        # Try to connect
        with engine.connect() as conn:
            logger.info("Successfully connected to PostgreSQL database.")
    else:
        engine = create_engine(DATABASE_URL)
except Exception as e:
    logger.warning(f"Failed to connect to PostgreSQL: {e}. Falling back to local SQLite database.")
    # SQLite file inside backend folder
    db_path = os.path.join(os.path.dirname(__file__), "zenex.db")
    DATABASE_URL = f"sqlite:///{db_path}"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Many-to-Many / Join Tables
# We'll use SQLAlchemy models for direct tables instead to allow easy query/addition

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    fullname = Column(String(100), nullable=False)
    avatar = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    points = Column(Integer, default=0)
    activity_level = Column(String(50), default="Bronze")
    
    # Relationships
    interests = relationship("UserInterest", back_populates="user", cascade="all, delete-orphan")
    badges = relationship("UserBadge", back_populates="user", cascade="all, delete-orphan")
    rewards = relationship("RewardEvent", back_populates="user", cascade="all, delete-orphan")
    event_memberships = relationship("EventMember", back_populates="user", cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "fullname": self.fullname,
            "avatar": self.avatar,
            "bio": self.bio,
            "city": self.city,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "points": self.points,
            "activity_level": self.activity_level
        }

class UserInterest(Base):
    __tablename__ = "user_interests"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    interest = Column(String(100), nullable=False)
    
    user = relationship("User", back_populates="interests")

class Event(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    rules = Column(Text, nullable=True)
    schedule = Column(Text, nullable=True)
    date = Column(String(100), nullable=False)
    time = Column(String(100), nullable=False)
    location = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    popularity = Column(Integer, default=0)
    image = Column(String(255), nullable=True)
    
    # Relationships
    members = relationship("EventMember", back_populates="event", cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "category": self.category,
            "description": self.description,
            "rules": self.rules,
            "schedule": self.schedule,
            "date": self.date,
            "time": self.time,
            "location": self.location,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "popularity": self.popularity,
            "image": self.image,
            "attendees_count": len(self.members)
        }

class EventMember(Base):
    __tablename__ = "event_members"
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    rsvp_status = Column(String(50), default="Attending")  # Attending, Interested, Declined
    
    event = relationship("Event", back_populates="members")
    user = relationship("User", back_populates="event_memberships")

class UserConnection(Base):
    __tablename__ = "user_connections"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    connection_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="connected")  # connected, pending, blocked
    
    # Simple direct query relationships
    user = relationship("User", foreign_keys=[user_id])
    connection = relationship("User", foreign_keys=[connection_id])

class Badge(Base):
    __tablename__ = "badges"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=False)
    color = Column(String(50), default="blue")  # yellow, green, blue, purple
    image = Column(String(100), nullable=True)   # Emoji representation or icon
    
    user_badges = relationship("UserBadge", back_populates="badge", cascade="all, delete-orphan")

class UserBadge(Base):
    __tablename__ = "user_badges"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    badge_id = Column(Integer, ForeignKey("badges.id", ondelete="CASCADE"), nullable=False)
    unlocked_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="badges")
    badge = relationship("Badge", back_populates="user_badges")

class RewardEvent(Base):
    __tablename__ = "reward_events"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    points = Column(Integer, nullable=False)
    reason = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="rewards")

class ChatRoom(Base):
    __tablename__ = "chat_rooms"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    type = Column(String(50), default="direct")  # direct, event, community
    
    messages = relationship("Message", back_populates="room", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("chat_rooms.id", ondelete="CASCADE"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    room = relationship("ChatRoom", back_populates="messages")
    sender = relationship("User")

# AI Chat History Tables
class AIConversation(Base):
    __tablename__ = "ai_conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, default="New Conversation")
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    messages = relationship("AIMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="AIMessage.id")

class AIMessage(Base):
    __tablename__ = "ai_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("ai_conversations.id", ondelete="CASCADE"), nullable=False)
    sender = Column(String(50), nullable=False)  # user, assistant
    text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    conversation = relationship("AIConversation", back_populates="messages")

# Database seeding function
def seed_database(db):
    # Check if we already have users
    if db.query(User).first() is not None:
        logger.info("Database already seeded.")
        return

    logger.info("Seeding database...")
    
    # 1. Create Badges
    badges = [
        Badge(name="Event Champion", description="Unlock by joining at least 5 sports events.", color="yellow", image="🏆"),
        Badge(name="Community Builder", description="Unlock by organizing or hosting a community gathering.", color="green", image="🤝"),
        Badge(name="Sports Enthusiast", description="Unlock by participating in 3 different types of sports matches.", color="blue", image="🏏"),
        Badge(name="Entertainment Explorer", description="Unlock by checking into arts, music, or comedy events.", color="purple", image="🎭")
    ]
    for b in badges:
        db.add(b)
    db.commit()

    # 2. Create Users
    admin_user = User(
        username="admin",
        fullname="Katakam Ritvik",
        avatar="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&h=300&q=80",
        bio="Passionate sports player and community organizer in Madhapur.",
        city="Hyderabad",
        latitude=17.4483,
        longitude=78.3741,
        points=850,
        activity_level="Gold"
    )
    
    rahul = User(
        username="rahul",
        fullname="Rahul Sharma",
        avatar="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80",
        bio="Cricket Captain. Always down for weekend tournament matches.",
        city="Hyderabad",
        latitude=17.4400,
        longitude=78.3489,
        points=1200,
        activity_level="Platinum"
    )
    
    neha = User(
        username="neha",
        fullname="Neha Reddy",
        avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
        bio="Local standup comedian and cultural event host.",
        city="Hyderabad",
        latitude=17.4483,
        longitude=78.3741,
        points=950,
        activity_level="Gold"
    )
    
    aisha = User(
        username="aisha",
        fullname="Aisha Khan",
        avatar="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
        bio="Fitness trainer. Leading local yoga sessions and outdoor group runs.",
        city="Hyderabad",
        latitude=17.4844,
        longitude=78.3889,
        points=600,
        activity_level="Silver"
    )
    
    db.add_all([admin_user, rahul, neha, aisha])
    db.commit()

    # Refresh instances to get IDs
    db.refresh(admin_user)
    db.refresh(rahul)
    db.refresh(neha)
    db.refresh(aisha)

    # 3. Add User Interests
    interests = [
        UserInterest(user_id=admin_user.id, interest="Cricket"),
        UserInterest(user_id=admin_user.id, interest="Football"),
        UserInterest(user_id=admin_user.id, interest="Standup Comedy"),
        UserInterest(user_id=admin_user.id, interest="Fitness"),
        
        UserInterest(user_id=rahul.id, interest="Cricket"),
        UserInterest(user_id=rahul.id, interest="Sports"),
        
        UserInterest(user_id=neha.id, interest="Standup Comedy"),
        UserInterest(user_id=neha.id, interest="Arts"),
        UserInterest(user_id=neha.id, interest="Music"),
        
        UserInterest(user_id=aisha.id, interest="Fitness"),
        UserInterest(user_id=aisha.id, interest="Yoga"),
        UserInterest(user_id=aisha.id, interest="Running")
    ]
    db.add_all(interests)

    # 4. Award Badges to Admin
    builder_badge = db.query(Badge).filter_by(name="Community Builder").first()
    sports_badge = db.query(Badge).filter_by(name="Sports Enthusiast").first()
    if builder_badge:
        db.add(UserBadge(user_id=admin_user.id, badge_id=builder_badge.id))
    if sports_badge:
        db.add(UserBadge(user_id=admin_user.id, badge_id=sports_badge.id))

    # 5. Add Reward Events history
    rewards = [
        RewardEvent(user_id=admin_user.id, points=500, reason="Joined Zenex Platform"),
        RewardEvent(user_id=admin_user.id, points=200, reason="Attended Sunday Football Match"),
        RewardEvent(user_id=admin_user.id, points=150, reason="Unlocked Sports Enthusiast Badge")
    ]
    db.add_all(rewards)

    # 6. Add Connections
    connections = [
        UserConnection(user_id=admin_user.id, connection_id=rahul.id, status="connected"),
        UserConnection(user_id=admin_user.id, connection_id=neha.id, status="connected"),
        UserConnection(user_id=admin_user.id, connection_id=aisha.id, status="pending")
    ]
    db.add_all(connections)

    # 7. Add Events
    events = [
        Event(
            title="Sunday Football Match",
            category="Football",
            description="Join us for a friendly 7v7 football match this Sunday at Madhapur Turf. All skill levels welcome!",
            rules="1. Fair play is key.\n2. Bring turf/indoor soccer boots.\n3. Respect the organizer's line-up decisions.",
            schedule="5:00 PM - Player Check-in & Warmups\n5:15 PM - Kick-off (7v7 Matches begin)\n6:15 PM - Short Break\n6:45 PM - Cool down and social chat",
            date="Sun, June 14",
            time="5:00 PM",
            location="Madhapur Turf, Hyderabad",
            latitude=17.4483,
            longitude=78.3741,
            popularity=12,
            image="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=400&h=250&q=80"
        ),
        Event(
            title="Live DJ & Sundowner",
            category="Entertainment",
            description="Experience the best sunset sounds at Over the Moon, Gachibowli, featuring top domestic DJ electronic sets and sundowner mocktails.",
            rules="1. Dress code: Smart Casual.\n2. Entry allowed for 21+ only.\n3. Keep your tickets/QR codes ready at check-in.",
            schedule="6:00 PM - Doors Open & Cocktail Hour\n7:00 PM - Opening Electronic Act\n8:30 PM - Headlining DJ Sunset Set\n10:00 PM - Event wraps up",
            date="Sat, June 20",
            time="6:00 PM",
            location="Over the Moon, Gachibowli",
            latitude=17.4400,
            longitude=78.3489,
            popularity=112,
            image="https://images.unsplash.com/photo-1516280440614-37939bbacd6a?auto=format&fit=crop&w=400&h=250&q=80"
        ),
        Event(
            title="Cricket Premier Tournament",
            category="Cricket",
            description="Standard T20 format local club premier championship. Cheer for Gachibowli Kings or Madhapur Strikers!",
            rules="1. Professional dress code (white pants/t-shirts required).\n2. Standard T20 ICC tournament rules apply.\n3. Decisions of the on-field umpire are final.",
            schedule="9:00 AM - Madhapur Strikers vs Gachibowli Kings\n12:30 PM - Lunch Break\n1:30 PM - Final Match\n4:00 PM - Presentation Ceremony",
            date="Fri, June 12",
            time="9:00 AM",
            location="State Ground, Secunderabad",
            latitude=17.4399,
            longitude=78.5020,
            popularity=22,
            image="https://images.unsplash.com/photo-1531415080290-bc98545ab3ef?auto=format&fit=crop&w=400&h=250&q=80"
        ),
        Event(
            title="Standup Open Mic",
            category="Arts",
            description="Catch Hyderabad's best local comics testing their fresh jokes! Grab a coffee and prepare for a laughter ride.",
            rules="1. No audio or video recording of jokes.\n2. Maintain silence while performers are on stage.\n3. Hecklers will be politely requested to leave.",
            schedule="7:30 PM - Seating opens\n8:00 PM - Show starts (5 acts, 15m each)\n9:30 PM - Closing comments & photos",
            date="Wed, June 15",
            time="7:30 PM",
            location="The Habitat, Hyderabad",
            latitude=17.4258,
            longitude=78.4510,
            popularity=45,
            image="https://images.unsplash.com/photo-1516280440614-37939bbacd6a?auto=format&fit=crop&w=400&h=250&q=80"
        )
    ]
    db.add_all(events)
    db.commit()

    # Refresh events to get IDs
    for e in events:
        db.refresh(e)

    # 8. Event Members RSVP
    db.add_all([
        EventMember(event_id=events[0].id, user_id=admin_user.id, rsvp_status="Attending"),
        EventMember(event_id=events[0].id, user_id=rahul.id, rsvp_status="Attending"),
        EventMember(event_id=events[2].id, user_id=admin_user.id, rsvp_status="Attending"),
        EventMember(event_id=events[2].id, user_id=rahul.id, rsvp_status="Attending")
    ])

    # 9. Seed Chat Rooms
    rooms = [
        ChatRoom(name="Rahul Sharma", type="direct"),
        ChatRoom(name="Neha Reddy", type="direct")
    ]
    db.add_all(rooms)
    db.commit()
    for r in rooms:
        db.refresh(r)

    # 10. Seed chat Messages
    # Convert dates to datetimes
    msgs = [
        Message(room_id=rooms[0].id, sender_id=rahul.id, text="Hey, are you down for the cricket match this Sunday?", created_at=datetime.utcnow()),
        Message(room_id=rooms[0].id, sender_id=admin_user.id, text="Yeah, definitely! What time does it start?", created_at=datetime.utcnow()),
        Message(room_id=rooms[0].id, sender_id=rahul.id, text="We start at 9 AM in Gachibowli. See you there!", created_at=datetime.utcnow()),
        
        Message(room_id=rooms[1].id, sender_id=neha.id, text="Hi! Thanks for attending the open mic night!", created_at=datetime.utcnow()),
        Message(room_id=rooms[1].id, sender_id=admin_user.id, text="It was amazing! The performances were great.", created_at=datetime.utcnow())
    ]
    db.add_all(msgs)
    db.commit()

    logger.info("Database seeding completed successfully.")

# Initialize tables (run if they don't exist)
def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
