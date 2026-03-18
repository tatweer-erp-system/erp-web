import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Empty,
  Input,
  List,
  Tooltip,
  Typography,
  Grid,
  theme as antTheme,
} from "antd";
import {
  SendOutlined,
  SearchOutlined,
  PlusOutlined,
  PaperClipOutlined,
  ArrowLeftOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";

const { Text } = Typography;
const { TextArea } = Input;
const { useBreakpoint } = Grid;

// ─── Types ───────────────────────────────────────────────────────────────────

interface Conversation {
  id: string;
  name: string;
  initials: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderInitials: string;
  content: string;
  timestamp: string;
  isSelf: boolean;
}

// ─── Conversation List ───────────────────────────────────────────────────────

function ConversationList({
  conversations,
  activeId,
  onSelect,
  search,
  onSearchChange,
  lang,
}: {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  lang: string;
}) {
  const { token } = antTheme.useToken();

  const filtered = useMemo(
    () =>
      conversations.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
      ),
    [conversations, search]
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Search + New */}
      <div
        style={{
          padding: 12,
          display: "flex",
          gap: 8,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          flexShrink: 0,
        }}
      >
        <Input
          prefix={
            <SearchOutlined style={{ color: token.colorTextQuaternary }} />
          }
          placeholder={t("chat.searchConversations", lang)}
          size="small"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          style={{ borderRadius: 8, flex: 1 }}
          allowClear
        />
        <Tooltip title={t("chat.newConversation", lang)}>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            style={{ borderRadius: 8 }}
          />
        </Tooltip>
      </div>

      {/* Conversation items */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center" }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Text type="secondary">{t("chat.noConversations", lang)}</Text>
              }
            />
          </div>
        ) : (
          <List
            dataSource={filtered}
            split={false}
            renderItem={conv => {
              const isActive = conv.id === activeId;
              return (
                <List.Item
                  onClick={() => onSelect(conv.id)}
                  style={{
                    padding: "10px 14px",
                    cursor: "pointer",
                    background: isActive
                      ? `${token.colorPrimary}12`
                      : "transparent",
                    borderInlineStart: isActive
                      ? `3px solid ${token.colorPrimary}`
                      : "3px solid transparent",
                    transition: "all 0.15s",
                    margin: 0,
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge
                        dot
                        status={conv.online ? "success" : "default"}
                        offset={[-2, 30]}
                      >
                        <Avatar
                          size={40}
                          style={{
                            background: isActive
                              ? token.colorPrimary
                              : token.colorFillSecondary,
                            color: isActive ? "#fff" : token.colorTextSecondary,
                            fontWeight: 700,
                            fontSize: 13,
                          }}
                        >
                          {conv.initials}
                        </Avatar>
                      </Badge>
                    }
                    title={
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
                            color: isActive
                              ? token.colorPrimary
                              : token.colorText,
                          }}
                        >
                          {conv.name}
                        </Text>
                        <Text
                          style={{
                            fontSize: 10,
                            color: token.colorTextTertiary,
                          }}
                        >
                          {conv.timestamp}
                        </Text>
                      </div>
                    }
                    description={
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            color: token.colorTextSecondary,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: 170,
                          }}
                        >
                          {conv.lastMessage}
                        </Text>
                        {conv.unread > 0 && (
                          <Badge
                            count={conv.unread}
                            size="small"
                            style={{ backgroundColor: token.colorPrimary }}
                          />
                        )}
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </div>
    </div>
  );
}

// ─── Message Bubble ──────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Message }) {
  const { token } = antTheme.useToken();

  if (msg.isSelf) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 14,
        }}
      >
        <div style={{ maxWidth: "65%" }}>
          <div
            style={{
              background: token.colorPrimary,
              color: "#fff",
              borderRadius: "16px 16px 4px 16px",
              padding: "10px 14px",
              fontSize: 13,
              lineHeight: 1.6,
              wordBreak: "break-word",
            }}
          >
            {msg.content}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 3,
            }}
          >
            <Text style={{ fontSize: 10, color: token.colorTextTertiary }}>
              {msg.timestamp}
            </Text>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
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
        {msg.senderInitials}
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
          {msg.senderName}
        </Text>
        <div
          style={{
            background: token.colorFillAlter,
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: "4px 16px 16px 16px",
            padding: "10px 14px",
            fontSize: 13,
            lineHeight: 1.6,
            color: token.colorText,
            wordBreak: "break-word",
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
          {msg.timestamp}
        </Text>
      </div>
    </div>
  );
}

// ─── Chat Window ─────────────────────────────────────────────────────────────

function ChatWindow({
  conversation,
  messages,
  onSendMessage,
  onBack,
  showBackButton,
  lang,
}: {
  conversation: Conversation | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onBack: () => void;
  showBackButton: boolean;
  lang: string;
}) {
  const { token } = antTheme.useToken();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInput("");
  }, [input, onSendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // Empty state — no conversation selected
  if (!conversation) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
          padding: 24,
        }}
      >
        <MessageOutlined
          style={{ fontSize: 56, color: token.colorTextQuaternary }}
        />
        <Text type="secondary" style={{ fontSize: 14 }}>
          {t("chat.selectConversation", lang)}
        </Text>
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
          gap: 10,
          flexShrink: 0,
        }}
      >
        {showBackButton && (
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            size="small"
            onClick={onBack}
          />
        )}
        <Badge
          dot
          status={conversation.online ? "success" : "default"}
          offset={[-2, 30]}
        >
          <Avatar
            size={36}
            style={{
              background: token.colorPrimary,
              color: "#fff",
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            {conversation.initials}
          </Avatar>
        </Badge>
        <div>
          <Text strong style={{ fontSize: 14, display: "block" }}>
            {conversation.name}
          </Text>
          <Text
            style={{
              fontSize: 11,
              color: conversation.online ? "#10B981" : token.colorTextTertiary,
            }}
          >
            {conversation.online
              ? t("chat.online", lang)
              : t("chat.offline", lang)}
          </Text>
        </div>
      </div>

      {/* Messages area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Text type="secondary">{t("chat.noMessages", lang)}</Text>
              }
            />
          </div>
        ) : (
          messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          display: "flex",
          alignItems: "flex-end",
          gap: 8,
          flexShrink: 0,
        }}
      >
        <Tooltip title={t("chat.comingSoon", lang)}>
          <Button
            type="text"
            icon={<PaperClipOutlined />}
            size="small"
            disabled
          />
        </Tooltip>
        <TextArea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("chat.typeMessage", lang)}
          autoSize={{ minRows: 1, maxRows: 4 }}
          style={{ borderRadius: 12, flex: 1 }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          size="small"
          onClick={handleSend}
          disabled={!input.trim()}
          style={{ borderRadius: 8 }}
        />
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Chat() {
  const { token } = antTheme.useToken();
  const { lang, direction } = useLangStore();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // ─── Local state ─────────────────────────────────────────────────────────
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showMessages, setShowMessages] = useState(false);

  const activeConversation = useMemo(
    () => conversations.find(c => c.id === activeId) ?? null,
    [conversations, activeId]
  );
  const activeMessages = useMemo(
    () => (activeId ? (messagesMap[activeId] ?? []) : []),
    [messagesMap, activeId]
  );

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleSelectConversation = useCallback(
    (id: string) => {
      setActiveId(id);
      if (isMobile) setShowMessages(true);
    },
    [isMobile]
  );

  const handleBack = useCallback(() => {
    setShowMessages(false);
  }, []);

  const handleSendMessage = useCallback(
    (content: string) => {
      if (!activeId) return;
      const now = new Date();
      const timestamp = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const newMsg: Message = {
        id: `msg-${Date.now()}`,
        senderId: "self",
        senderName: t("chat.you", lang),
        senderInitials: "ME",
        content,
        timestamp,
        isSelf: true,
      };

      setMessagesMap(prev => ({
        ...prev,
        [activeId]: [...(prev[activeId] ?? []), newMsg],
      }));

      // Update last message in conversation list
      setConversations(prev =>
        prev.map(c =>
          c.id === activeId
            ? { ...c, lastMessage: content, timestamp: t("chat.justNow", lang) }
            : c
        )
      );
    },
    [activeId, lang]
  );

  // ─── Layout: mobile vs desktop ───────────────────────────────────────────
  const showLeftPanel = !isMobile || !showMessages;
  const showRightPanel = !isMobile || showMessages;

  return (
    <DashboardLayout
      currentPage={t("chat.title", lang)}
      breadcrumbs={[
        { label: t("Dashboard", lang), href: "/" },
        { label: t("chat.title", lang) },
      ]}
    >
      {/* Connection notice */}
      <Alert
        message={t("chat.connectionNotice", lang)}
        type="info"
        showIcon
        closable
        style={{ marginBottom: 16, borderRadius: token.borderRadiusLG }}
      />

      {/* Chat container */}
      <div
        dir={direction}
        style={{
          height: "calc(100vh - 210px)",
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: token.borderRadiusLG,
          overflow: "hidden",
          display: "flex",
          background: token.colorBgContainer,
        }}
      >
        {/* Left panel — Conversations */}
        {showLeftPanel && (
          <div
            style={{
              width: isMobile ? "100%" : 300,
              flexShrink: 0,
              borderInlineEnd: isMobile
                ? "none"
                : `1px solid ${token.colorBorderSecondary}`,
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <ConversationList
              conversations={conversations}
              activeId={activeId}
              onSelect={handleSelectConversation}
              search={search}
              onSearchChange={setSearch}
              lang={lang}
            />
          </div>
        )}

        {/* Right panel — Messages */}
        {showRightPanel && (
          <ChatWindow
            conversation={activeConversation}
            messages={activeMessages}
            onSendMessage={handleSendMessage}
            onBack={handleBack}
            showBackButton={isMobile}
            lang={lang}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
