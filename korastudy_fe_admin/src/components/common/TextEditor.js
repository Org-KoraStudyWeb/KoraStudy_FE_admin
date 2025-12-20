// src/components/common/TextEditor.js
import React, { useState, useRef, useEffect } from "react";
import { Input, Button, Space, Tooltip, message } from "antd";
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  FontSizeOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  EnterOutlined,
  RedoOutlined,
  UndoOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;

const TextEditor = ({
  value,
  onChange,
  placeholder,
  rows = 3,
  showPreview = true,
  ...props
}) => {
  const [text, setText] = useState(value || "");
  const textareaRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const addToHistory = (newText) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newText);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Đồng bộ giá trị từ prop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (value !== undefined && value !== text) {
      setText(value);
      addToHistory(value);
    }
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setText(newValue);
    addToHistory(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const insertFormat = (startTag, endTag) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current.resizableTextArea?.textArea;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end);

    // Nếu không có text được chọn, chỉ chèn tags
    if (selectedText.length === 0) {
      const newText =
        text.substring(0, start) + startTag + endTag + text.substring(end);
      setText(newText);
      if (onChange) onChange(newText);

      // Di chuyển cursor vào giữa tags
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(
            start + startTag.length,
            start + startTag.length
          );
        }
      }, 0);
      return;
    }

    // Nếu có text được chọn, bao quanh text bằng tags
    const newText =
      text.substring(0, start) +
      startTag +
      selectedText +
      endTag +
      text.substring(end);

    setText(newText);
    if (onChange) onChange(newText);

    // Di chuyển cursor
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(
          start + startTag.length,
          end + startTag.length
        );
      }
    }, 0);
  };

  const formatButtons = [
    {
      tooltip: "In đậm",
      icon: <BoldOutlined />,
      startTag: "**",
      endTag: "**",
    },
    {
      tooltip: "In nghiêng",
      icon: <ItalicOutlined />,
      startTag: "*",
      endTag: "*",
    },
    {
      tooltip: "Gạch chân",
      icon: <UnderlineOutlined />,
      startTag: "<u>",
      endTag: "</u>",
    },
    {
      tooltip: "Chữ hoa",
      icon: <FontSizeOutlined />,
      onClick: () => {
        if (!textareaRef.current) return;

        const textarea = textareaRef.current.resizableTextArea?.textArea;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = text.substring(start, end);

        if (selectedText.length === 0) {
          message.info("Vui lòng chọn văn bản để chuyển thành chữ hoa");
          return;
        }

        const newText =
          text.substring(0, start) +
          selectedText.toUpperCase() +
          text.substring(end);

        setText(newText);
        if (onChange) onChange(newText);
      },
    },
    {
      tooltip: "Xuống dòng",
      icon: <EnterOutlined />,
      onClick: () => {
        if (!textareaRef.current) return;

        const textarea = textareaRef.current.resizableTextArea?.textArea;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const newText = text.substring(0, start) + "\n" + text.substring(start);

        setText(newText);
        if (onChange) onChange(newText);

        // Di chuyển cursor sau khi xuống dòng
        setTimeout(() => {
          if (textarea) {
            textarea.focus();
            textarea.setSelectionRange(start + 1, start + 1);
          }
        }, 0);
      },
    },
    {
      tooltip: "Danh sách có số",
      icon: <OrderedListOutlined />,
      onClick: () => {
        const newText = text + (text.endsWith("\n") ? "" : "\n") + "1. ";
        setText(newText);
        if (onChange) onChange(newText);

        // Focus vào cuối
        setTimeout(() => {
          if (textareaRef.current) {
            const textarea = textareaRef.current.resizableTextArea?.textArea;
            if (textarea) {
              textarea.focus();
              textarea.setSelectionRange(newText.length, newText.length);
            }
          }
        }, 0);
      },
    },
    {
      tooltip: "Danh sách không số",
      icon: <UnorderedListOutlined />,
      onClick: () => {
        const newText = text + (text.endsWith("\n") ? "" : "\n") + "• ";
        setText(newText);
        if (onChange) onChange(newText);

        // Focus vào cuối
        setTimeout(() => {
          if (textareaRef.current) {
            const textarea = textareaRef.current.resizableTextArea?.textArea;
            if (textarea) {
              textarea.focus();
              textarea.setSelectionRange(newText.length, newText.length);
            }
          }
        }, 0);
      },
    },
  ];

  const renderPreview = () => {
    if (!text || !showPreview) return null;

    // Convert Markdown/HTML đơn giản
    let html = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/<u>(.*?)<\/u>/g, "<u>$1</u>")
      .replace(/\n/g, "<br />");

    return (
      <div style={{ marginTop: 12 }}>
        <div
          style={{
            padding: 12,
            backgroundColor: "#f8f9fa",
            border: "1px solid #e9ecef",
            borderRadius: 6,
            fontSize: 14,
            lineHeight: 1.6,
            minHeight: 60,
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    );
  };

  return (
    <div>
      <div
        style={{
          marginBottom: 8,
          padding: 8,
          backgroundColor: "#fafafa",
          borderRadius: 6,
          border: "1px solid #f0f0f0",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Space wrap>
            {formatButtons.map((btn, index) => (
              <Tooltip key={index} title={btn.tooltip}>
                <Button
                  type="text"
                  size="small"
                  icon={btn.icon}
                  onClick={() =>
                    btn.onClick
                      ? btn.onClick()
                      : insertFormat(btn.startTag, btn.endTag)
                  }
                  style={{
                    padding: "4px 8px",
                    border: "1px solid #d9d9d9",
                  }}
                />
              </Tooltip>
            ))}
          </Space>

          <Space>
            <Tooltip title="Hoàn tác">
              <Button
                type="text"
                size="small"
                icon={<UndoOutlined />}
                disabled={historyIndex <= 0}
                onClick={() => {
                  if (historyIndex > 0) {
                    const prevText = history[historyIndex - 1];
                    setText(prevText);
                    setHistoryIndex(historyIndex - 1);
                    if (onChange) onChange(prevText);
                  }
                }}
              />
            </Tooltip>
            <Tooltip title="Làm lại">
              <Button
                type="text"
                size="small"
                icon={<RedoOutlined />}
                disabled={historyIndex >= history.length - 1}
                onClick={() => {
                  if (historyIndex < history.length - 1) {
                    const nextText = history[historyIndex + 1];
                    setText(nextText);
                    setHistoryIndex(historyIndex + 1);
                    if (onChange) onChange(nextText);
                  }
                }}
              />
            </Tooltip>
          </Space>
        </div>

        <div style={{ fontSize: 12, color: "#666" }}>
          <strong>Hướng dẫn: </strong>
          <code>**in đậm**</code>
          <span style={{ margin: "0 8px" }}>|</span>
          <code>*in nghiêng*</code>
          <span style={{ margin: "0 8px" }}>|</span>
          <code>&lt;u&gt;gạch chân&lt;/u&gt;</code>
          <span style={{ margin: "0 8px" }}>|</span>
          <span>Chọn văn bản rồi nhấn nút để định dạng</span>
        </div>
      </div>

      <TextArea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        style={{
          fontFamily:
            "'Segoe UI', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: 14,
          lineHeight: 1.6,
        }}
        {...props}
      />

      {showPreview && renderPreview()}
    </div>
  );
};

export default TextEditor;
