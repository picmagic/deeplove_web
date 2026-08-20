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
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        loadLocale(getLang()).then((d) => {
            setDict(d);
            setLoaded(true);
        });
    }, []);
    const t = (key: string) => (loaded ? dict[key] || key : "");
    return { t, loaded };
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
    const { t, loaded: i18nLoaded } = useI18n();
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
            // toast 在下方 useEffect 里等 i18n 加载后触发
        } catch {
            // 查詢失敗時不阻擋申請
        } finally {
            setChecking(false);
        }
    };

    useEffect(() => {
        if (i18nLoaded && applyStatus === STATUS_REJECTED) {
            toast(t("apply_not_eligible"), { id: "apply-not-eligible" });
        }
    }, [i18nLoaded, applyStatus]);

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
    const buttonText = checking
        ? t("apply_checking")
        : loading
            ? t("apply_submitting")
            : isApproved
            ? t("apply_approved")
            : isPending
                ? t("apply_pending")
                : t("apply_now");

    return (
        <div className="min-h-screen bg-white flex flex-col px-4 pt-6 pb-28">
            <Toaster position="top-center" style={{ "--width": "max-content" } as React.CSSProperties} />
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

                <div className="font-bold text-gray-900 mt-2">加入創作者，你可以獲得：</div>
                <ul className="list-disc pl-5 space-y-1">
                    <li>專屬創作者標識，讓更多用戶認識你的角色與作品</li>
                    <li>優先曝光機會，熱門內容有機會登上推薦頁</li>
                    <li>持續發布優質內容，即可獲得平台專屬激勵與成長支持</li>
                    <li>與官方團隊直接溝通的管道，第一時間獲得活動與功能更新資訊</li>
                </ul>

                <div className="font-bold text-gray-900 mt-2">申請條件</div>
                <p>
                    無論你是資深創作者，還是剛開始嘗試角色設計與劇情創作，只要你對內容創作充滿熱情，都歡迎申請加入。我們鼓勵原創、鼓勵多元風格，也重視每一位創作者背後的用心與堅持。
                </p>

                <div className="font-bold text-gray-900 mt-2">審核流程</div>
                <p>
                    提交申請後，官方團隊將於數個工作日內完成審核，審核結果將透過站內通知告知你，請耐心等候，並持續關注你的帳號通知。
                </p>
            </div>

            <div className="mt-6 -mx-4">
                <img
                    src="https://d355fm4icfleo1.cloudfront.net/public/6svHCeo8VX/image/5b48434cab6049cd8d81c9c643b58f39.jpeg"
                    alt="creator apply"
                    className="w-full h-auto object-cover"
                />
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
