"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/utils";

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

const CONTENT = {
    en: {
        notEligible: "Account not eligible",
        title: "Let your creations be seen by more people",
        subtitle: "Deeplove AI Official Event　2024.10.29",
        intro: [
            "Every compelling character and every moving story deserves to be seen by more people.",
            "Join the creator program and share your original content to connect with more users. Whether it's intricate character settings, immersive storylines, or unique interactive experiences — this is your creative stage. Keep publishing quality content, grow your audience, and you'll have the chance to receive exclusive incentives and growth support.",
            "Creation is not just expression — it's the beginning of turning passion into value.",
            "Start your creator journey now and bring the world in your imagination to more people.",
        ],
        benefitsTitle: "What you get as a creator:",
        benefits: [
            "An exclusive creator badge so more users can discover your characters and works",
            "Priority exposure opportunities — popular content may be featured on the recommendation page",
            "Exclusive platform incentives and growth support for consistently publishing quality content",
            "A direct channel to communicate with the official team and get first-hand updates on events and features",
        ],
        requirementsTitle: "Requirements",
        requirementsBody: "Whether you're a seasoned creator or just starting out with character design and storytelling, you're welcome to apply as long as you're passionate about content creation. We encourage originality, diverse styles, and deeply value the care and dedication behind every creator's work.",
        reviewTitle: "Review Process",
        reviewBody: "After submitting your application, the official team will complete the review within a few business days. The result will be sent via an in-app notification — please be patient and keep an eye on your account notifications.",
        btn: { checking: "Loading...", submitting: "Submitting...", approved: "Approved", pending: "Under Review", apply: "Apply Now" },
    },
    "zh-TW": {
        notEligible: "帳號資格不符",
        title: "讓你的創作，被更多人看見",
        subtitle: "Deeplove AI 官方活動　2024.10.29",
        intro: [
            "每一個精彩角色、每一段動人的故事，都值得被更多人看見。",
            "加入創作者活動，分享你的原創內容，與更多用戶建立連結。無論是細膩的人物設定、沉浸式劇情，還是獨特的互動體驗，都能成為你的創作舞台。持續發布優質內容、吸引更多用戶關注，你將有機會獲得專屬激勵與成長支持。",
            "創作不只是表達，也是讓熱愛產生價值的開始。",
            "現在就開啟你的創作者之旅，把腦海中的世界帶給更多人。",
        ],
        benefitsTitle: "加入創作者，你可以獲得：",
        benefits: [
            "專屬創作者標識，讓更多用戶認識你的角色與作品",
            "優先曝光機會，熱門內容有機會登上推薦頁",
            "持續發布優質內容，即可獲得平台專屬激勵與成長支持",
            "與官方團隊直接溝通的管道，第一時間獲得活動與功能更新資訊",
        ],
        requirementsTitle: "申請條件",
        requirementsBody: "無論你是資深創作者，還是剛開始嘗試角色設計與劇情創作，只要你對內容創作充滿熱情，都歡迎申請加入。我們鼓勵原創、鼓勵多元風格，也重視每一位創作者背後的用心與堅持。",
        reviewTitle: "審核流程",
        reviewBody: "提交申請後，官方團隊將於數個工作日內完成審核，審核結果將透過站內通知告知你，請耐心等候，並持續關注你的帳號通知。",
        btn: { checking: "載入中...", submitting: "提交中...", approved: "審核通過", pending: "正在審核", apply: "立即申請" },
    },
} as const;

type Lang = keyof typeof CONTENT;

const CreatorApplyPage = () => {
    const params = useParams();
    const rawLang = typeof params.lang === "string" ? params.lang : "zh-TW";
    const lang: Lang = rawLang in CONTENT ? (rawLang as Lang) : "zh-TW";
    const c = CONTENT[lang];

    const [checking, setChecking] = useState(true);
    const [applyStatus, setApplyStatus] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [notifVisible, setNotifVisible] = useState(false);

    const checkApplyStatus = async () => {
        setChecking(true);
        try {
            const res = await apiClient.post("/user/creator/apply/list", {
                pageNum: 1,
                pageSize: 1,
            });
            const first = res.data?.data?.list?.[0];
            setApplyStatus(normalizeStatus(first?.status));
        } catch {
            // don't block the apply action on error
        } finally {
            setChecking(false);
        }
    };

    useEffect(() => {
        if (applyStatus === STATUS_REJECTED) {
            setNotifVisible(true);
            setTimeout(() => setNotifVisible(false), 4000);
        }
    }, [applyStatus]);

    useEffect(() => {
        window.setUserInfo = (data) => {
            if (!data) return;
            if (data.token) {
                localStorage.setItem("dl_token", data.token);
                checkApplyStatus();
            }
        };
        checkApplyStatus();
        return () => { delete window.setUserInfo; };
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
            setErrorMsg(e?.message || c.notEligible);
            setTimeout(() => setErrorMsg(""), 3000);
        } finally {
            setLoading(false);
        }
    };

    const buttonDisabled = loading || checking || isPending || isApproved;
    const buttonText = checking
        ? c.btn.checking
        : loading
            ? c.btn.submitting
            : isApproved
            ? c.btn.approved
            : isPending
                ? c.btn.pending
                : c.btn.apply;

    return (
        <div className="min-h-screen bg-white flex flex-col px-4 pt-6 pb-28">
            {notifVisible && (
                <div className="fixed top-4 left-0 w-full flex justify-center z-50 pointer-events-none">
                    <div className="bg-white border border-gray-200 shadow-lg rounded-lg px-4 py-3 text-sm text-gray-800 whitespace-nowrap">
                        {c.notEligible}
                    </div>
                </div>
            )}
            <h1 className="text-2xl font-bold leading-snug mb-2">{c.title}</h1>
            <div className="text-xs text-gray-400 mb-6">{c.subtitle}</div>

            <div className="text-sm text-gray-700 leading-relaxed space-y-4">
                {c.intro.map((p, i) => <p key={i}>{p}</p>)}

                <div className="font-bold text-gray-900 mt-2">{c.benefitsTitle}</div>
                <ul className="list-disc pl-5 space-y-1">
                    {c.benefits.map((b, i) => <li key={i}>{b}</li>)}
                </ul>

                <div className="font-bold text-gray-900 mt-2">{c.requirementsTitle}</div>
                <p>{c.requirementsBody}</p>

                <div className="font-bold text-gray-900 mt-2">{c.reviewTitle}</div>
                <p>{c.reviewBody}</p>
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
