import { useState, useRef, useEffect } from "react";
import {
  Avatar,
  Badge,
  Button,
  Input,
  Tabs,
  Typography,
  theme as antTheme,
} from "antd";
import {
  SendOutlined,
  SearchOutlined,
  TeamOutlined,
  CustomerServiceOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
  MoreOutlined,
  PaperClipOutlined,
  SmileOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const { Text } = Typography;

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  sender: string;
  avatar: string;
  content: string;
  time: string;
  isMe: boolean;
  read: boolean;
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  role?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const TEAM_CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    name: "Sarah Ahmed",
    avatar: "SA",
    lastMessage: "Can you check the Q3 report?",
    time: "2m",
    unread: 2,
    online: true,
    role: "Sales Manager",
  },
  {
    id: "2",
    name: "Omar Hassan",
    avatar: "OH",
    lastMessage: "Invoice #INV-2024-001 is approved",
    time: "15m",
    unread: 0,
    online: true,
    role: "Accountant",
  },
  {
    id: "3",
    name: "Lisa Chen",
    avatar: "LC",
    lastMessage: "New employee onboarding done",
    time: "1h",
    unread: 1,
    online: false,
    role: "HR Manager",
  },
  {
    id: "4",
    name: "Mark Johnson",
    avatar: "MJ",
    lastMessage: "Stock transfer request sent",
    time: "2h",
    unread: 0,
    online: false,
    role: "Warehouse",
  },
  {
    id: "5",
    name: "Team General",
    avatar: "TG",
    lastMessage: "Monthly meeting at 3PM today",
    time: "3h",
    unread: 5,
    online: true,
    role: "Group",
  },
];

const SUPPORT_CONVERSATIONS: Conversation[] = [
  {
    id: "s1",
    name: "Tatweer Support",
    avatar: "TS",
    lastMessage: "Your ticket #T-4821 is resolved",
    time: "1h",
    unread: 1,
    online: true,
    role: "Support Agent",
  },
  {
    id: "s2",
    name: "Technical Team",
    avatar: "TT",
    lastMessage: "We're looking into the issue",
    time: "1d",
    unread: 0,
    online: false,
    role: "Tech Support",
  },
];

const TEAM_MESSAGES: Message[] = [
  {
    id: "1",
    sender: "Sarah Ahmed",
    avatar: "SA",
    content: "Hey, can you check the Q3 sales report when you get a chance?",
    time: "10:02 AM",
    isMe: false,
    read: true,
  },
  {
    id: "2",
    sender: "Me",
    avatar: "ME",
    content: "Sure, I'll take a look right now.",
    time: "10:04 AM",
    isMe: true,
    read: true,
  },
  {
    id: "3",
    sender: "Sarah Ahmed",
    avatar: "SA",
    content: "Thanks! Also, the invoice for Acme Corp is pending approval.",
    time: "10:05 AM",
    isMe: false,
    read: true,
  },
  {
    id: "4",
    sender: "Me",
    avatar: "ME",
    content: "Got it. I'll approve it once I verify the amounts.",
    time: "10:08 AM",
    isMe: true,
    read: true,
  },
  {
    id: "5",
    sender: "Sarah Ahmed",
    avatar: "SA",
    content: "Can you check the Q3 report?",
    time: "10:20 AM",
    isMe: false,
    read: false,
  },
];

const SUPPORT_MESSAGES: Message[] = [
  {
    id: "1",
    sender: "Tatweer Support",
    avatar: "TS",
    content: "Hello! Welcome to Tatweer Support. How can we help you today?",
    time: "Yesterday 9:00 AM",
    isMe: false,
    read: true,
  },
  {
    id: "2",
    sender: "Me",
    avatar: "ME",
    content: "Hi, we're having an issue with the bank reconciliation module.",
    time: "Yesterday 9:05 AM",
    isMe: true,
    read: true,
  },
  {
    id: "3",
    sender: "Tatweer Support",
    avatar: "TS",
    content:
      "Thank you for reaching out. We've opened ticket #T-4821 for you. Our technical team is investigating.",
    time: "Yesterday 9:10 AM",
    isMe: false,
    read: true,
  },
  {
    id: "4",
    sender: "Tatweer Support",
    avatar: "TS",
    content:
      "Your ticket #T-4821 is resolved. The issue was a timezone mismatch in the reconciliation engine. Please try again.",
    time: "1h ago",
    isMe: false,
    read: false,
  },
];

// ─── Conversation List ────────────────────────────────────────────────────────

function ConversationList({
  conversations,
  activeId,
  onSelect,
  accentColor,
}: {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
  accentColor: string;
}) {
  const { token } = antTheme.useToken();
  const [search, setSearch] = useState("");

  const filtered = conversations.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      style={{
        width: 280,
        flexShrink: 0,
        borderRight: `1px solid ${token.colorBorderSecondary}`,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Search */}
      <div style={{ padding: "12px 12px 8px" }}>
        <Input
          prefix={
            <SearchOutlined style={{ color: token.colorTextQuaternary }} />
          }
          placeholder="Search conversations..."
          size="small"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ borderRadius: 8 }}
        />
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {filtered.map(conv => {
          const isActive = conv.id === activeId;
          return (
            <div
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                cursor: "pointer",
                background: isActive ? `${accentColor}12` : "transparent",
                borderLeft: isActive
                  ? `3px solid ${accentColor}`
                  : "3px solid transparent",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => {
                if (!isActive)
                  e.currentTarget.style.background = token.colorFillAlter;
              }}
              onMouseLeave={e => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              <Badge
                dot
                status={conv.online ? "success" : "default"}
                offset={[-2, 30]}
              >
                <Avatar
                  size={38}
                  style={{
                    background: isActive
                      ? accentColor
                      : token.colorFillSecondary,
                    color: isActive ? "#fff" : token.colorTextSecondary,
                    fontWeight: 700,
                    fontSize: 12,
                    flexShrink: 0,
                  }}
                >
                  {conv.avatar}
                </Avatar>
              </Badge>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    strong
                    style={{
                      fontSize: 13,
                      color: isActive ? accentColor : token.colorText,
                    }}
                  >
                    {conv.name}
                  </Text>
                  <Text
                    style={{ fontSize: 10, color: token.colorTextTertiary }}
                  >
                    {conv.time}
                  </Text>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 2,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: token.colorTextSecondary,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: 150,
                    }}
                  >
                    {conv.lastMessage}
                  </Text>
                  {conv.unread > 0 && (
                    <div
                      style={{
                        background: accentColor,
                        color: "#fff",
                        borderRadius: "50%",
                        width: 18,
                        height: 18,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {conv.unread}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({
  msg,
  accentColor,
}: {
  msg: Message;
  accentColor: string;
}) {
  const { token } = antTheme.useToken();

  if (msg.isMe) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 12,
        }}
      >
        <div style={{ maxWidth: "65%" }}>
          <div
            style={{
              background: accentColor,
              color: "#fff",
              borderRadius: "16px 16px 4px 16px",
              padding: "10px 14px",
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            {msg.content}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 4,
              marginTop: 3,
            }}
          >
            <Text style={{ fontSize: 10, color: token.colorTextTertiary }}>
              {msg.time}
            </Text>
            <CheckOutlined
              style={{
                fontSize: 10,
                color: msg.read ? accentColor : token.colorTextQuaternary,
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
      <Avatar
        size={30}
        style={{
          background: token.colorFillSecondary,
          color: token.colorTextSecondary,
          fontWeight: 700,
          fontSize: 10,
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        {msg.avatar}
      </Avatar>
      <div style={{ maxWidth: "65%" }}>
        <Text
          style={{
            fontSize: 11,
            color: token.colorTextTertiary,
            display: "block",
            marginBottom: 3,
          }}
        >
          {msg.sender}
        </Text>
        <div
          style={{
            background: token.colorFillAlter,
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: "4px 16px 16px 16px",
            padding: "10px 14px",
            fontSize: 13,
            lineHeight: 1.5,
            color: token.colorText,
          }}
        >
          {msg.content}
        </div>
        <Text
          style={{
            fontSize: 10,
            color: token.colorTextTertiary,
            marginTop: 3,
            display: "block",
          }}
        >
          {msg.time}
        </Text>
      </div>
    </div>
  );
}

// ─── Chat Window ──────────────────────────────────────────────────────────────

function ChatWindow({
  conversation,
  messages,
  accentColor,
}: {
  conversation: Conversation | undefined;
  messages: Message[];
  accentColor: string;
}) {
  const { token } = antTheme.useToken();
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Message[]>(messages);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMsgs(messages);
  }, [messages]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  function send() {
    if (!input.trim()) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setMsgs(prev => [
      ...prev,
      {
        id: String(Date.now()),
        sender: "Me",
        avatar: "ME",
        content: input.trim(),
        time,
        isMe: true,
        read: false,
      },
    ]);
    setInput("");
  }

  if (!conversation) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ fontSize: 48, opacity: 0.15 }}>💬</div>
        <Text type="secondary">Select a conversation to start chatting</Text>
      </div>
    );
  }

  return (
    <div
      style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 20px",
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Badge
            dot
            status={conversation.online ? "success" : "default"}
            offset={[-2, 30]}
          >
            <Avatar
              size={36}
              style={{
                background: accentColor,
                color: "#fff",
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              {conversation.avatar}
            </Avatar>
          </Badge>
          <div>
            <Text strong style={{ fontSize: 14, display: "block" }}>
              {conversation.name}
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: conversation.online
                  ? "#10B981"
                  : token.colorTextTertiary,
              }}
            >
              {conversation.online ? "Online" : "Offline"} · {conversation.role}
            </Text>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <Button type="text" icon={<PhoneOutlined />} size="small" />
          <Button type="text" icon={<VideoCameraOutlined />} size="small" />
          <Button type="text" icon={<MoreOutlined />} size="small" />
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {msgs.map(msg => (
          <MessageBubble key={msg.id} msg={msg} accentColor={accentColor} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
        }}
      >
        <Button type="text" icon={<PaperClipOutlined />} size="small" />
        <Button type="text" icon={<SmileOutlined />} size="small" />
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onPressEnter={send}
          placeholder="Type a message..."
          style={{ borderRadius: 20, flex: 1 }}
          suffix={
            <SendOutlined
              onClick={send}
              style={{
                color: input.trim() ? accentColor : token.colorTextQuaternary,
                cursor: input.trim() ? "pointer" : "default",
                transition: "color 0.15s",
              }}
            />
          }
        />
      </div>
    </div>
  );
}

// ─── Chat Panel ───────────────────────────────────────────────────────────────

function ChatPanel({
  conversations,
  messages,
  accentColor,
}: {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  accentColor: string;
}) {
  const [activeId, setActiveId] = useState(conversations[0]?.id ?? "");
  const activeConv = conversations.find(c => c.id === activeId);
  const activeMessages = messages[activeId] ?? [];

  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>
      <ConversationList
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        accentColor={accentColor}
      />
      <ChatWindow
        conversation={activeConv}
        messages={activeMessages}
        accentColor={accentColor}
      />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Chat() {
  const { token } = antTheme.useToken();
  const accentColor = token.colorPrimary;

  const teamMessages: Record<string, Message[]> = {
    "1": TEAM_MESSAGES,
    "2": [],
    "3": [],
    "4": [],
    "5": [],
  };

  const supportMessages: Record<string, Message[]> = {
    s1: SUPPORT_MESSAGES,
    s2: [],
  };

  const teamUnread = TEAM_CONVERSATIONS.reduce((s, c) => s + c.unread, 0);
  const supportUnread = SUPPORT_CONVERSATIONS.reduce((s, c) => s + c.unread, 0);

  return (
    <DashboardLayout
      currentPage="Chat"
      breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Chat" }]}
    >
      <div
        style={{
          height: "calc(100vh - 130px)",
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: token.borderRadiusLG,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          background: token.colorBgContainer,
        }}
      >
        {/* Tab bar */}
        <div
          style={{
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            flexShrink: 0,
          }}
        >
          <Tabs
            defaultActiveKey="team"
            style={{ padding: "0 16px" }}
            items={[
              {
                key: "team",
                label: (
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <TeamOutlined />
                    Team Chat
                    {teamUnread > 0 && (
                      <span
                        style={{
                          background: accentColor,
                          color: "#fff",
                          borderRadius: 10,
                          padding: "0 6px",
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        {teamUnread}
                      </span>
                    )}
                  </span>
                ),
                children: (
                  <ChatPanel
                    conversations={TEAM_CONVERSATIONS}
                    messages={teamMessages}
                    accentColor={accentColor}
                  />
                ),
              },
              {
                key: "support",
                label: (
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <CustomerServiceOutlined />
                    Support
                    {supportUnread > 0 && (
                      <span
                        style={{
                          background: "#f97316",
                          color: "#fff",
                          borderRadius: 10,
                          padding: "0 6px",
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        {supportUnread}
                      </span>
                    )}
                  </span>
                ),
                children: (
                  <ChatPanel
                    conversations={SUPPORT_CONVERSATIONS}
                    messages={supportMessages}
                    accentColor="#f97316"
                  />
                ),
              },
            ]}
            tabBarStyle={{ margin: 0 }}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
