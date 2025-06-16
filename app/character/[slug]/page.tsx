"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/utils";


// 简单 i18n hook
const getLang = () => {
    if (typeof window === "undefined") return "zh-TW";
    const lang = navigator.language || "zh-TW";
    if (lang.startsWith("zh")) {
        if (lang.includes("Hant") || lang.includes("TW")) return "zh-TW";
        return "zh-CN";
    }
    return lang.split("-")[0];
};

const loadLocale = async (lang: string) => {
    try {
        const res = await fetch(`/locales/${lang}.json`);
        if (!res.ok) throw new Error("not found");
        return await res.json();
    } catch {
        // fallback
        const res = await fetch(`/locales/zh-TW.json`);
        return await res.json();
    }
};

const useI18n = () => {
    const [dict, setDict] = useState<Record<string, string>>({});
    useEffect(() => {
        loadLocale(getLang()).then(setDict);
    }, []);
    return (key: string) => dict[key] || key;
};

const parseTags = (tags: string) => {
    if (!tags) return [];
    try {
        // customTags 可能是 json 字符串
        const arr = JSON.parse(tags);
        if (Array.isArray(arr)) return arr;
    } catch { }
    // 普通逗号分隔
    return tags.split(/[,#]/).map(t => t.trim()).filter(Boolean);
};

const CharacterDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const t = useI18n();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError("");
            try {
                const roleId = params?.slug;
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
    }, [params?.slug]);

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }
    if (error || !data) {
        return <div className="flex flex-col items-center justify-center h-screen text-red-500">{error || "No Data"}</div>;
    }

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
                    onClick={() => router.back()}
                    onKeyDown={e => (e.key === "Enter" || e.key === " ") && router.back()}
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
                    <div className="flex gap-4 text-xs text-gray-400">
                        <span>{t("chat_user_count")} {data.totalChatUserCount}</span>
                        <span>{t("chat_count")} {data.totalChatMessageCount}</span>
                    </div>
                </div>
                <div className="text-sm text-gray-500 mt-1">{data.age} | {data.occupation}</div>
                {/* 标签 */}
                <div className="flex flex-wrap gap-2 justify-center mt-3">
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
                <a
                    href={typeof window !== 'undefined' ? window.location.href : '#'}
                    className="w-11/12 max-w-md h-12 text-base font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center no-underline"
                >
                    {t("open_app_chat")}
                </a>
            </div>
        </div>
    );
};

export default CharacterDetailPage;
