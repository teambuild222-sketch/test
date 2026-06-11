import React from 'react';
import { EventCard, CommunityCard, UserCard, BadgeCard } from './RichCards';

interface MarkdownParserProps {
  text: string;
  username: string;
}

// Extract attributes from XML-like tags (e.g. key="value")
const parseAttributes = (tagString: string): Record<string, string> => {
  const attrs: Record<string, string> = {};
  const regex = /(\w+)="([^"]*?)"/gi;
  let match;
  while ((match = regex.exec(tagString)) !== null) {
    attrs[match[1]] = match[2];
  }
  return attrs;
};

// Simple tokenizer for bold, code, and link markdown within lines
const parseInlineMarkdown = (text: string): React.ReactNode[] => {
  // Regex to split on bold (**bold**), inline code (`code`), and link ([label](url)) tokens
  const tokenRegex = /(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="ai-inline-code">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('[') && part.includes('](')) {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        const [, label, url] = match;
        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="ai-message-link"
          >
            {label}
          </a>
        );
      }
    }
    return part;
  });
};

export const MarkdownParser: React.FC<MarkdownParserProps> = ({ text, username }) => {
  if (!text) return null;

  // Split content by XML-like card tags
  const blockRegex = /(<(?:event|community|user|badge)-card\s+[^>]*?\s*\/>)/gi;
  const blocks = text.split(blockRegex);

  return (
    <div className="ai-markdown-container">
      {blocks.map((block, blockIndex) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Check if it's a card tag
        if (trimmed.startsWith('<') && trimmed.endsWith('/>')) {
          const attrs = parseAttributes(trimmed);
          const lowerTag = trimmed.toLowerCase();

          if (lowerTag.startsWith('<event-card')) {
            return (
              <EventCard
                key={blockIndex}
                id={parseInt(attrs.id || '0', 10)}
                title={attrs.title || 'Event'}
                category={attrs.category || 'Sports'}
                date={attrs.date || 'Soon'}
                time={attrs.time || ''}
                location={attrs.location || 'Hyderabad'}
                image={attrs.image || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400'}
                attendees={parseInt(attrs.attendees || '0', 10)}
                distance={attrs.distance || '0.0 km'}
                attending={attrs.attending === 'true'}
                username={username}
              />
            );
          }

          if (lowerTag.startsWith('<community-card')) {
            return (
              <CommunityCard
                key={blockIndex}
                title={attrs.title || 'Community'}
                category={attrs.category || 'Sports'}
                description={attrs.description || ''}
                members={parseInt(attrs.members || '0', 10)}
              />
            );
          }

          if (lowerTag.startsWith('<user-card')) {
            return (
              <UserCard
                key={blockIndex}
                id={parseInt(attrs.id || '0', 10)}
                name={attrs.name || 'User'}
                username={attrs.username || 'user'}
                avatar={attrs.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'}
                bio={attrs.bio || ''}
                distance={attrs.distance || '0.0 km'}
                status={attrs.status || 'not_connected'}
                points={parseInt(attrs.points || '0', 10)}
                level={attrs.level || 'Bronze'}
                currentUser={username}
              />
            );
          }

          if (lowerTag.startsWith('<badge-card')) {
            return (
              <BadgeCard
                key={blockIndex}
                name={attrs.name || 'Badge'}
                description={attrs.description || ''}
                color={attrs.color || 'blue'}
                image={attrs.image || '🏅'}
                unlocked={attrs.unlocked === 'true'}
              />
            );
          }
        }

        // Otherwise, it's regular text with potential markdown. Let's parse blocks.
        const lines = block.split('\n');
        const renderedElements: React.ReactNode[] = [];
        let currentListItems: React.ReactNode[] = [];
        let listType: 'ul' | 'ol' | null = null;

        const flushList = (key: string) => {
          if (listType === 'ul' && currentListItems.length > 0) {
            renderedElements.push(
              <ul key={`ul-${key}`} className="ai-markdown-ul">
                {currentListItems}
              </ul>
            );
          } else if (listType === 'ol' && currentListItems.length > 0) {
            renderedElements.push(
              <ol key={`ol-${key}`} className="ai-markdown-ol">
                {currentListItems}
              </ol>
            );
          }
          currentListItems = [];
          listType = null;
        };

        lines.forEach((line, lineIdx) => {
          const trimmedLine = line.trim();

          // 1. Unordered lists
          if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
            if (listType !== 'ul') {
              flushList(`${blockIndex}-${lineIdx}`);
              listType = 'ul';
            }
            const cleanContent = trimmedLine.slice(2);
            currentListItems.push(
              <li key={`li-${blockIndex}-${lineIdx}`} className="ai-markdown-li">
                {parseInlineMarkdown(cleanContent)}
              </li>
            );
            return;
          }

          // 2. Ordered lists
          const olMatch = trimmedLine.match(/^(\d+)\.\s(.*)/);
          if (olMatch) {
            if (listType !== 'ol') {
              flushList(`${blockIndex}-${lineIdx}`);
              listType = 'ol';
            }
            const cleanContent = olMatch[2];
            currentListItems.push(
              <li key={`li-${blockIndex}-${lineIdx}`} className="ai-markdown-li">
                {parseInlineMarkdown(cleanContent)}
              </li>
            );
            return;
          }

          // Not a list item, flush any existing list
          flushList(`${blockIndex}-${lineIdx}`);

          // 3. Headers
          if (trimmedLine.startsWith('### ')) {
            renderedElements.push(
              <h4 key={`h4-${blockIndex}-${lineIdx}`} className="ai-markdown-h4">
                {parseInlineMarkdown(trimmedLine.slice(4))}
              </h4>
            );
            return;
          }
          if (trimmedLine.startsWith('## ') || trimmedLine.startsWith('# ')) {
            const headingContent = trimmedLine.startsWith('## ') ? trimmedLine.slice(3) : trimmedLine.slice(2);
            renderedElements.push(
              <h3 key={`h3-${blockIndex}-${lineIdx}`} className="ai-markdown-h3">
                {parseInlineMarkdown(headingContent)}
              </h3>
            );
            return;
          }

          // 4. Regular Paragraphs
          if (trimmedLine) {
            renderedElements.push(
              <p key={`p-${blockIndex}-${lineIdx}`} className="ai-markdown-p">
                {parseInlineMarkdown(line)}
              </p>
            );
          }
        });

        // Flush list at the end of text block
        flushList(`${blockIndex}-end`);

        return <React.Fragment key={blockIndex}>{renderedElements}</React.Fragment>;
      })}
    </div>
  );
};

export default MarkdownParser;
