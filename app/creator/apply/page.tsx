"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { apiClient } from "@/lib/utils";

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

declare global {
    interface Window {
        setUserInfo?: (data: { userId?: string | number; characterId?: string | number; token?: string }) => void;
    }
}

const STATUS_PENDING = 0;
const STATUS_APPROVED = 1;
const STATUS_REJECTED = 2;

const normalizeStatus = (status: unknown): number | null => {
    if (status === null || status === undefined) return null;
    const num = Number(status);
    return Number.isNaN(num) ? null : num;
};

const CreatorApplyPage = () => {
    const t = useI18n();
    const [checking, setChecking] = useState(true);
    const [applyStatus, setApplyStatus] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const checkApplyStatus = async () => {
        setChecking(true);
        try {
            const res = await apiClient.post("/user/creator/apply/list", {
                pageNum: 1,
                pageSize: 1,
            });
            const first = res.data?.data?.list?.[0];
            const status = normalizeStatus(first?.status);
            setApplyStatus(status);
            if (status === STATUS_REJECTED) {
                toast(t("apply_not_eligible"));
            }
        } catch {
            // 查詢失敗時不阻擋申請
        } finally {
            setChecking(false);
        }
    };

    useEffect(() => {
        window.setUserInfo = (data) => {
            if (!data) return;
            if (data.token) {
                localStorage.setItem("dl_token", data.token);
                checkApplyStatus();
            }
        };
        checkApplyStatus();
        return () => {
            delete window.setUserInfo;
        };
    }, []);

    const isPending = applyStatus === STATUS_PENDING;
    const isApproved = applyStatus === STATUS_APPROVED;

    const handleApply = async () => {
        if (loading || checking || isPending || isApproved) return;
        setLoading(true);
        setErrorMsg("");
        try {
            await apiClient.get("/user/creator/apply");
            setApplyStatus(STATUS_PENDING);
        } catch (e: any) {
            setErrorMsg(e?.message || "請求失敗，請稍後再試");
            setTimeout(() => setErrorMsg(""), 3000);
        } finally {
            setLoading(false);
        }
    };

    const buttonDisabled = loading || checking || isPending || isApproved;
    const buttonText = isApproved
        ? "審核通過"
        : isPending
            ? "正在審核"
            : loading
                ? "提交中..."
                : "立即申請";

    return (
        <div className="min-h-screen bg-white flex flex-col px-4 pt-6 pb-28">
            <Toaster position="top-center" />
            <h1 className="text-2xl font-bold leading-snug mb-2">
                讓你的創作，被更多人看見
            </h1>
            <div className="text-xs text-gray-400 mb-6">
                Deeplove AI 官方活動　2024.10.29
            </div>

            <div className="text-sm text-gray-700 leading-relaxed space-y-4">
                <p>每一個精彩角色、每一段動人的故事，都值得被更多人看見。</p>
                <p>
                    加入創作者活動，分享你的原創內容，與更多用戶建立連結。無論是細膩的人物設定、沉浸式劇情，還是獨特的互動體驗，都能成為你的創作舞台。持續發布優質內容、吸引更多用戶關注，你將有機會獲得專屬激勵與成長支持。
                </p>
                <p>創作不只是表達，也是讓熱愛產生價值的開始。</p>
                <p>現在就開啟你的創作者之旅，把腦海中的世界帶給更多人。</p>
            </div>

            <div className="fixed bottom-0 left-0 w-full bg-white border-t flex flex-col items-center gap-2 py-4 z-10">
                {errorMsg && <div className="text-xs text-red-500">{errorMsg}</div>}
                <button
                    type="button"
                    onClick={handleApply}
                    disabled={buttonDisabled}
                    className={`w-11/12 max-w-md h-12 text-base font-bold text-white rounded-full shadow-lg flex items-center justify-center ${isPending || isApproved
                        ? "bg-gray-300"
                        : "bg-purple-600 hover:bg-purple-700 disabled:opacity-70"
                        }`}
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
};

export default CreatorApplyPage;
