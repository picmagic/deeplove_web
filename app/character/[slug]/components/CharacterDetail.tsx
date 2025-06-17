"use client";
import React from "react";
import { useRouter } from "next/navigation";

// 工具函数
const parseTags = (tags: string) => {
    if (!tags) return [];
    try {
        const arr = JSON.parse(tags);
        if (Array.isArray(arr)) return arr;
    } catch { }
    return tags.split(/[,#]/).map(t => t.trim()).filter(Boolean);
};

interface CharacterDetailProps {
    data: any;
    translations: Record<string, string>;
    roleId: string;
}

const CharacterDetail: React.FC<CharacterDetailProps> = ({ data, translations, roleId }) => {
    const router = useRouter();

    const t = (key: string) => translations[key] || key;

    const handleBackClick = () => {
        router.back();
    };

    const handleBackKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
            router.back();
        }
    };

    const handleOpenApp = () => {
        let timer: NodeJS.Timeout;
        window.location.href = `deeplove://role?role=${roleId}`;
        timer = setTimeout(() => {
            if (!document.hidden) {
                window.location.href = "https://apps.apple.com/app/id6741785278";
            }
        }, 3000);

        const handleVisibilityChange = () => {
            if (document.hidden) {
                clearTimeout(timer);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // 清理函数
        return () => {
            clearTimeout(timer);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    };

    const tags = parseTags(data.tags) || [];
    const customTags = parseTags(data.customTags) || [];
    const allTags = [...tags, ...customTags];

    return (
        <div className="min-h-screen bg-white flex flex-col pb-24">
            {/* 头像区域 - 包含返回按钮 */}
            <div className="relative w-full">
                <div className="w-full aspect-[4/3]">
                    <img
                        src={data.avatarUrl}
                        alt={data.name}
                        className="w-full h-full object-cover"
                        style={{ aspectRatio: '4 / 3' }}
                    />
                </div>
                {/* 返回按钮 - 绝对定位在左上角 */}
                <button
                    aria-label={t("back")}
                    tabIndex={0}
                    onClick={handleBackClick}
                    onKeyDown={handleBackKeyDown}
                    className="absolute top-4 left-4 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center"
                >
                    <img
                        src="/arrow_left.png"
                        alt="back"
                        className="w-4 h-4"
                    />
                </button>
            </div>

            {/* 基本信息 */}
            <div className="flex flex-col items-start mt-4 px-4">
                <div className="flex items-center justify-between w-full">
                    <div className="text-xl font-semibold">{data.name}</div>
                    <div className="flex gap-4 text-xs">
                        <span className="text-gray-400">{t("chat_user_count")}</span>
                        <span className="text-black">{data.totalChatUserCount}</span>
                        <span className="text-gray-400">{t("chat_count")}</span>
                        <span className="text-black">{data.totalChatMessageCount}</span>
                    </div>
                </div>
                <div className="text-sm text-gray-500 mt-1">{data.age} | {data.occupation}</div>
                {/* 标签 */}
                <div className="flex flex-wrap gap-2 justify-start mt-3">
                    {allTags.map((tag, i) => (
                        <span key={i} className="text-xs text-purple-600 bg-purple-100 rounded px-2 py-0.5">#{tag}</span>
                    ))}
                </div>
                {/* 作者 */}
                <div className="flex justify-center mt-2 text-xs text-gray-400">
                    {t("author")} @{data.userNickname}
                </div>
            </div>

            {/* 开场白 */}
            <div className="px-4 mt-6">
                <div className="font-bold mb-1">{t("opening")}</div>
                <div className="text-sm text-gray-700 whitespace-pre-line">{data.prefAnswer}</div>
            </div>

            {/* 角色描述 */}
            <div className="px-4 mt-6">
                <div className="font-bold mb-1">{t("character_desc")}</div>
                <div className="text-sm text-gray-700 whitespace-pre-line">{data.character}</div>
            </div>

            {/* 行为习惯 */}
            <div className="px-4 mt-6">
                <div className="font-bold mb-1">{t("behavior_habit")}</div>
                <div className="text-sm text-gray-700 whitespace-pre-line">{data.personalDesc}</div>
            </div>

            {/* 底部按钮 */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t flex justify-center py-4 z-10">
                <button
                    onClick={handleOpenApp}
                    className="w-11/12 max-w-md h-12 text-base font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center"
                >
                    {t("open_app_chat")}
                </button>
            </div>
        </div>
    );
};

export default CharacterDetail; 