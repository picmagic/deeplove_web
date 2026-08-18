"use client";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/utils";

declare global {
    interface Window {
        setUserInfo?: (data: { userId?: string | number; characterId?: string | number; token?: string }) => void;
    }
}

const CreatorApplyPage = () => {
    const [checking, setChecking] = useState(true);
    const [underReview, setUnderReview] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const checkApplyStatus = async () => {
        setChecking(true);
        try {
            const res = await apiClient.get("/user/creaor/apply/check");
            setUnderReview(res.data?.data === true);
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

    const handleApply = async () => {
        if (loading || checking || underReview) return;
        setLoading(true);
        setErrorMsg("");
        try {
            await apiClient.get("/user/creaor/apply");
            setUnderReview(true);
        } catch (e: any) {
            setErrorMsg(e?.message || "請求失敗，請稍後再試");
            setTimeout(() => setErrorMsg(""), 3000);
        } finally {
            setLoading(false);
        }
    };

    const buttonDisabled = loading || checking || underReview;
    const buttonText = underReview ? "正在審核" : loading ? "提交中..." : "立即申請";

    return (
        <div className="min-h-screen bg-white flex flex-col px-4 pt-6 pb-28">
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
                    className={`w-11/12 max-w-md h-12 text-base font-bold text-white rounded-full shadow-lg flex items-center justify-center ${underReview
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
