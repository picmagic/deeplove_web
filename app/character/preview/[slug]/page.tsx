"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

// Supported languages configuration
const LANGUAGES = [
    { code: "zh-TW", label: "繁體中文" },
    { code: "en", label: "English" },
    { code: "ja", label: "日本語" },
    { code: "ko", label: "한국어" },
    { code: "fr", label: "Français" },
    { code: "de", label: "Deutsch" },
    { code: "es", label: "Español" },
    { code: "pt", label: "Português" },
];

// Layout types
type LayoutType = "large" | "small";

// API configuration
const accesskey = "6svHCeo8VX";
const buildVersion = "1.0.0";

const getDeviceId = () => {
    if (typeof window === "undefined") return "";
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
        deviceId = uuidv4();
        localStorage.setItem("deviceId", deviceId);
    }
    return deviceId;
};

const getDeviceName = () =>
    typeof window !== "undefined" ? encodeURIComponent(navigator.userAgent) : "";

const getBaseUrl = () => process.env.NEXT_PUBLIC_API_BASE_URL;

// Load locale translations
const loadLocale = async (lang: string): Promise<Record<string, string>> => {
    try {
        const res = await fetch(`/locales/${lang}.json`);
        if (!res.ok) throw new Error("not found");
        return await res.json();
    } catch {
        const res = await fetch(`/locales/en.json`);
        return await res.json();
    }
};

// Parse tags helper
const parseTags = (tags: any): string[] => {
    if (!tags) return [];

    // 如果是对象数组 [{id, name}, ...]，提取 name
    if (Array.isArray(tags)) {
        return tags
            .map(tag => (typeof tag === 'object' && tag?.name) ? tag.name : tag)
            .filter(Boolean);
    }

    // 如果不是字符串，返回空数组
    if (typeof tags !== 'string') return [];

    try {
        // 可能是 json 字符串
        const arr = JSON.parse(tags);
        if (Array.isArray(arr)) {
            return arr
                .map(tag => (typeof tag === 'object' && tag?.name) ? tag.name : tag)
                .filter(Boolean);
        }
    } catch { }

    // 普通逗号分隔
    return tags.split(/[,#]/).map(t => t.trim()).filter(Boolean);
};

// Strip content between * * or （ ） from text
const stripActionText = (text: string): string => {
    if (!text) return "";
    // Remove content between *...* and （...）
    return text
        .replace(/\*[^*]+\*/g, "")
        .replace(/（[^）]+）/g, "")
        .trim();
};

// iPhone Frame Component
const IPhoneFrame: React.FC<{ children: React.ReactNode; immersive?: boolean }> = ({ children, immersive = false }) => {
    return (
        <div className="relative h-full">
            {/* iPhone outer frame */}
            <div
                className="relative bg-[#1a1a1a] rounded-[3rem] p-2 shadow-2xl h-full"
                style={{
                    width: "340px",
                    maxHeight: "calc(100vh - 4rem)",
                    aspectRatio: "9/19.5",
                }}
            >
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150px] h-[30px] bg-[#1a1a1a] rounded-b-3xl z-20 flex items-center justify-center">
                    <div className="w-[60px] h-[6px] bg-[#333] rounded-full mt-1" />
                </div>

                {/* Screen */}
                <div className={`relative w-full h-full rounded-[2.5rem] overflow-hidden ${immersive ? 'bg-black' : 'bg-white'}`}>
                    {/* Status bar */}
                    <div className={`absolute top-0 left-0 right-0 h-11 z-10 flex items-center justify-between px-6 pt-2 ${immersive ? 'bg-transparent' : 'bg-white'}`}>
                        <span className={`text-xs font-semibold ${immersive ? 'text-white' : 'text-black'}`}>9:41</span>
                        <div className="flex items-center gap-1">
                            <svg className={`w-4 h-4 ${immersive ? 'text-white' : 'text-black'}`} fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 3C7.46 3 3.34 4.78.29 7.67c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l10.79 10.79c.39.39 1.02.39 1.41 0l10.79-10.79c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71C20.66 4.78 16.54 3 12 3z" />
                            </svg>
                            <svg className={`w-4 h-4 ${immersive ? 'text-white' : 'text-black'}`} fill="currentColor" viewBox="0 0 24 24">
                                <path d="M2 22h20V2z" />
                            </svg>
                            <div className="flex items-center">
                                <div className={`w-6 h-3 border rounded-sm relative ${immersive ? 'border-white' : 'border-black'}`}>
                                    <div className={`absolute inset-0.5 rounded-sm ${immersive ? 'bg-white' : 'bg-black'}`} style={{ width: "80%" }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content area */}
                    <div className={`absolute top-0 left-0 right-0 bottom-0 overflow-y-auto ${immersive ? '' : 'pt-11'}`}>
                        {children}
                    </div>

                    {/* Home indicator */}
                    <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full ${immersive ? 'bg-white' : 'bg-black'}`} />
                </div>
            </div>
        </div>
    );
};

// Small Waterfall Card Component (小瀑布流布局)
const SmallWaterfallCard: React.FC<{
    data: any;
    dict: Record<string, string>;
}> = ({ data, dict }) => {
    const tags = parseTags(data.tags);
    const customTags = parseTags(data.customTags);
    const allTags = [...tags, ...customTags].slice(0, 3);

    // Card component for consistent styling
    const CharacterCard = ({ index }: { index: number }) => (
        <div className="relative rounded-xl overflow-hidden bg-white shadow-sm">
            {/* Image */}
            <div className="aspect-[2/3] relative">
                <img
                    src={data.avatarUrl}
                    alt={data.name}
                    className="w-full h-full object-cover"
                />
                {/* Bottom badges - gradient background with left and right badges */}
                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2 py-0.5 pointer-events-none z-10">
                    {/* Gradient background */}
                    <div className="absolute inset-0 h-full w-full" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0.28), transparent)' }} aria-hidden="true"></div>
                    {/* Left badge - @user */}
                    <div className="relative flex items-center gap-1 pointer-events-auto">
                        <span className="text-white text-[10px]">@{data.userNickname}</span>
                    </div>
                    {/* Right badge - user count */}
                    <div className="relative flex items-center gap-1 pointer-events-auto">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                        <span className="text-white text-[10px]">{data.totalChatUserCount}</span>
                    </div>
                </div>
            </div>

            {/* Info section */}
            <div className="p-2.5 bg-white">
                {/* Character info line */}
                <div className="text-[10px] text-gray-500 mb-1.5 truncate whitespace-nowrap">
                    {data.name} | {data.age || 27} | {(data.occupation || "").slice(0, 12)}...
                </div>
                {/* Quote */}
                <p className="text-xs text-black-500 line-clamp-2 mb-2">
                    {stripActionText(data.prefAnswer || "").slice(0, 50) || ""}
                </p>
                {/* Tags - Single Line (no wrap, truncate, no scroll even if overflow) */}
                <div className="flex gap-1.5 whitespace-nowrap overflow-hidden w-full max-w-full">
                    {(() => {
                        // Show as many tags as fit, with priority to the first
                        // We'll use a ref per tag to measure, and only display if fits within parent
                        // But since we must not use refs in render, let's use a simplified approach:
                        // estimate max chars (monospaced) and stop if overflow
                        // In practice, allow all tags but use flex-shrink-0 and overflow-x: hidden on parent
                        // And remove truncate on tags so each can show fully or not at all; if out of room, it simply will disappear off right, but always show as much of leftmost as possible.
                        // But to totally cut off, let's use 'flex-nowrap overflow-x-hidden' and 'flex-shrink-0 max-w-max' for tags, removing the truncate.

                        const visibleTags =
                            (allTags.length > 0 ? allTags : [""]).slice(0, 3);

                        return visibleTags.map((tag, i) => (
                            <span
                                key={i}
                                className="text-[9px] bg-[#D9A2FF] text-white px-2 py-0.5 rounded-full font-medium flex-shrink-0 max-w-max"
                            >
                                #{tag}
                            </span>
                        ));
                    })()}
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full h-full p-2" style={{ backgroundColor: '#F3F3F3' }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-2 px-1">
                <div className="text-lg font-bold text-gray-800">{dict["explore"] || "探索"}</div>
                <div className="flex items-center gap-2">
                    <button className="p-1.5 rounded-full bg-white shadow-sm">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </button>
                    <button className="flex items-center gap-1 px-2 py-1 rounded-full bg-white shadow-sm text-xs">
                        <span>👋</span>
                        <span className="text-gray-600">Join us</span>
                    </button>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100">
                        <span>✨</span>
                        <span className="text-xs font-medium text-purple-600">257</span>
                        <span className="text-purple-500">+</span>
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="flex items-center gap-3 mb-2 px-1 overflow-x-auto">
                <div className="flex items-center gap-1 text-purple-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="text-sm font-medium">推荐</span>
                </div>
                {["群聊", "浪漫", "甜美", "同人", "校园"].map((cat) => (
                    <span key={cat} className="text-sm text-gray-500 whitespace-nowrap">
                        {cat}
                    </span>
                ))}
            </div>

            {/* Waterfall Grid - Consistent Card Style */}
            <div className="grid grid-cols-2 gap-2">
                {[0, 1, 2, 3].map((idx) => (
                    <CharacterCard key={idx} index={idx} />
                ))}
            </div>
        </div>
    );
};

// Helper function to render prefAnswer text with gray color for text between * or （）
const renderPrefAnswerText = (text: string): React.ReactNode => {
    if (!text) return null;

    // Split by patterns: *text* or （text）
    // Match content between * * or （ ）
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Regex to match *...* or （...）
    const regex = /(\*[^*]+\*|（[^）]+）)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
        // Add text before the match (normal black text)
        if (match.index > lastIndex) {
            parts.push(
                <span key={`normal-${lastIndex}`} className="text-gray-800">
                    {text.slice(lastIndex, match.index)}
                </span>
            );
        }

        // Add the matched text (gray color for actions/descriptions)
        const matchedText = match[0];
        parts.push(
            <span key={`gray-${match.index}`} className="text-gray-500">
                {matchedText}
            </span>
        );

        lastIndex = match.index + matchedText.length;
    }

    // Add remaining text after last match
    if (lastIndex < text.length) {
        parts.push(
            <span key={`normal-${lastIndex}`} className="text-gray-800">
                {text.slice(lastIndex)}
            </span>
        );
    }

    return parts.length > 0 ? parts : text;
};

// Large Waterfall Card Component (大瀑布流布局 - 全屏沉浸式)
const LargeWaterfallCard: React.FC<{
    data: any;
    dict: Record<string, string>;
}> = ({ data, dict }) => {
    const audioRef = React.useRef<HTMLAudioElement>(null);
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [isVideoEnded, setIsVideoEnded] = useState(false);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);

    // 优先查找 greetMedias 中的 video，其次查找 data.avatarVideo
    const videoMedia =
        data.greetMedias?.find(
            (media: { mediaType: number; mediaUrl: string }) => media.mediaType === 2 && !!media.mediaUrl
        ) || (data.avatarVideo ? { mediaType: 2, mediaUrl: data.avatarVideo } : undefined);

    const hasVideo = !!videoMedia && !!videoMedia.mediaUrl;
    const videoUrl = videoMedia?.mediaUrl;

    // Check if there's audio
    const hasAudio = !!data.prefAnswerVoiceUrl;
    const [hasAutoPlayed, setHasAutoPlayed] = useState(false);

    // Handle audio can play - auto-play once when ready
    const handleAudioCanPlay = useCallback(() => {
        if (hasAudio && audioRef.current && !hasAutoPlayed) {
            audioRef.current.play().then(() => {
                setIsAudioPlaying(true);
                setHasAutoPlayed(true);
            }).catch((err) => {
                console.log("Audio autoplay failed:", err);
                setHasAutoPlayed(true);
            });
        }
    }, [hasAudio, hasAutoPlayed]);

    // Auto-play video when component mounts
    useEffect(() => {
        if (hasVideo && videoRef.current && !isVideoEnded) {
            videoRef.current.play().then(() => {
                setIsVideoPlaying(true);
            }).catch((err) => {
                console.log("Video autoplay failed:", err);
                setIsVideoEnded(true);
            });
        }
    }, [hasVideo, isVideoEnded]);

    // Handle audio play/pause toggle
    const handleAudioToggle = useCallback(() => {
        if (!audioRef.current) return;

        if (isAudioPlaying) {
            audioRef.current.pause();
            setIsAudioPlaying(false);
        } else {
            audioRef.current.play().then(() => {
                setIsAudioPlaying(true);
            }).catch((err) => {
                console.log("Audio play failed:", err);
            });
        }
    }, [isAudioPlaying]);

    // Handle video ended
    const handleVideoEnded = useCallback(() => {
        setIsVideoEnded(true);
        setIsVideoPlaying(false);
    }, []);

    // Handle audio ended
    const handleAudioEnded = useCallback(() => {
        setIsAudioPlaying(false);
    }, []);

    // Handle audio play event - sync state when audio starts playing
    const handleAudioPlay = useCallback(() => {
        setIsAudioPlaying(true);
        setHasAutoPlayed(true);
    }, []);

    // Handle audio pause event
    const handleAudioPause = useCallback(() => {
        setIsAudioPlaying(false);
    }, []);

    return (
        <div className="relative w-full h-full">
            {/* Hidden audio element - autoPlay once when entering page */}
            {hasAudio && (
                <audio
                    ref={audioRef}
                    src={data.prefAnswerVoiceUrl}
                    onEnded={handleAudioEnded}
                    onCanPlayThrough={handleAudioCanPlay}
                    onPlay={handleAudioPlay}
                    onPause={handleAudioPause}
                    preload="auto"
                    autoPlay
                />
            )}

            {/* Full screen background - Video or Image */}
            <div className="absolute inset-0">
                {hasVideo && !isVideoEnded ? (
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        onEnded={handleVideoEnded}
                        preload="auto"
                    />
                ) : (
                    <img
                        src={data.avatarUrl}
                        alt={data.name}
                        className="w-full h-full object-cover"
                    />
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            </div>

            {/* Top Navigation */}
            <div className="absolute top-10 left-0 right-0 z-10 flex items-center justify-between px-4 pt-2">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{data.name || ""}</span>
                        <svg className="w-4 h-4 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Bottom Content Area */}
            <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-4">
                {/* Personal Description Card - black semi-transparent background */}
                {data.personalDesc && (
                    <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-3 mb-3">
                        <div className="flex items-start gap-2">
                            <p className="text-white text-sm leading-relaxed line-clamp-3">
                                介绍:{data.personalDesc}
                            </p>
                        </div>
                    </div>
                )}

                {/* Story/Dialogue Card - white semi-transparent background */}
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-4 mb-3">
                    {/* Audio play button - top left corner */}
                    {hasAudio && (
                        <button
                            onClick={handleAudioToggle}
                            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleAudioToggle()}
                            className="absolute -top-2 -left-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center shadow-lg hover:bg-purple-600 transition-colors"
                            aria-label={isAudioPlaying ? "Pause audio" : "Play audio"}
                            tabIndex={0}
                        >
                            {isAudioPlaying ? (
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            )}
                        </button>
                    )}
                    <p className="text-gray-800 text-sm leading-relaxed line-clamp-6">
                        {renderPrefAnswerText(data.prefAnswer || "")}
                    </p>
                </div>

                {/* Input Area */}
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-3">
                    <input
                        type="text"
                        placeholder={dict["freeInput"] || "输入...."}
                        className="flex-1 bg-transparent text-white placeholder-white/50 text-sm outline-none"
                        aria-label="Message input"
                    />
                    <button
                        className="w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center"
                        aria-label="Send message"
                        tabIndex={0}
                    >
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main Preview Page Component
const CharacterPreviewPage = () => {
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [data, setData] = useState<any>(null);
    const [layout, setLayout] = useState<LayoutType>("large");
    const [currentLang, setCurrentLang] = useState("zh-CN");
    const [dict, setDict] = useState<Record<string, string>>({});

    // Fetch character data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError("");
            try {
                const roleId = params?.slug;
                const commonParams = {
                    accesskey,
                    buildVersion,
                    deviceId: getDeviceId(),
                    lang: currentLang,
                    deviceName: getDeviceName(),
                };

                const apiClient = axios.create({
                    baseURL: `${getBaseUrl()}/${accesskey}`,
                    headers: {
                        "Content-Type": "application/json",
                        "YY-Basic-Params": JSON.stringify(commonParams),
                    },
                });

                const res = await apiClient.get("/user/virtualRole/detail", {
                    params: { roleId },
                });
                setData(res.data.data);
            } catch (e: any) {
                setError(e?.message || "Error");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [params?.slug, currentLang]);

    // Load locale
    useEffect(() => {
        loadLocale(currentLang).then(setDict);
    }, [currentLang]);

    const handleLayoutChange = useCallback((newLayout: LayoutType) => {
        setLayout(newLayout);
    }, []);

    const handleLangChange = useCallback((lang: string) => {
        setCurrentLang(lang);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-white text-lg">Loading...</span>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-red-400 text-xl mb-4">{error || "No Data"}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center py-4 px-4">
            {/* Main Preview Area */}
            <div className="flex items-center gap-8 h-full max-h-[calc(100vh-2rem)]">
                {/* Left Side - Controls */}
                <div className="flex flex-col gap-4">
                    {/* Layout Toggle Buttons */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <h3 className="text-white text-sm font-medium mb-3">布局切换</h3>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => handleLayoutChange("large")}
                                aria-label="Switch to large waterfall layout"
                                tabIndex={0}
                                onKeyDown={(e) =>
                                    (e.key === "Enter" || e.key === " ") && handleLayoutChange("large")
                                }
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${layout === "large"
                                    ? "bg-purple-600 text-white"
                                    : "bg-white/10 text-white/70 hover:bg-white/20"
                                    }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                <span className="text-sm font-medium">大瀑布流布局</span>
                            </button>
                            <button
                                onClick={() => handleLayoutChange("small")}
                                aria-label="Switch to small waterfall layout"
                                tabIndex={0}
                                onKeyDown={(e) =>
                                    (e.key === "Enter" || e.key === " ") && handleLayoutChange("small")
                                }
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${layout === "small"
                                    ? "bg-purple-600 text-white"
                                    : "bg-white/10 text-white/70 hover:bg-white/20"
                                    }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                                </svg>
                                <span className="text-sm font-medium">小瀑布流布局</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Center - iPhone Preview */}
                <IPhoneFrame immersive={layout === "large"}>
                    {layout === "large" ? (
                        <LargeWaterfallCard data={data} dict={dict} />
                    ) : (
                        <SmallWaterfallCard data={data} dict={dict} />
                    )}
                </IPhoneFrame>

                {/* Right Side - Language Selector */}
                <div className="flex flex-col gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <h3 className="text-white text-sm font-medium mb-3">语言切换</h3>
                        <div className="flex flex-col gap-1.5 max-h-80 overflow-y-auto">
                            {LANGUAGES.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLangChange(lang.code)}
                                    aria-label={`Switch to ${lang.label}`}
                                    tabIndex={0}
                                    onKeyDown={(e) =>
                                        (e.key === "Enter" || e.key === " ") && handleLangChange(lang.code)
                                    }
                                    className={`px-3 py-2 text-left text-sm rounded-lg transition-all ${currentLang === lang.code
                                        ? "bg-purple-600 text-white"
                                        : "bg-white/10 text-white/80 hover:bg-white/20"
                                        }`}
                                >
                                    {lang.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CharacterPreviewPage;

