'use client'

import Image from 'next/image'

const ActivityPage = () => {
    const handleDownloadClick = () => {
        let timer: NodeJS.Timeout;
        window.location.href = `https://deeplove.onelink.me/prQF?af_xp=social&pid=creator&af_dp=${encodeURIComponent(`deeplove://`)}&deep_link_value=${encodeURIComponent(`deeplove://activity?source=h5`)}`;
        timer = setTimeout(() => {
            if (!document.hidden) {
                window.location.href = "https://apps.apple.com/app/id6741785278";
            }
        }, 3000);

        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                // 用户切走了（可能打开了 App）
                clearTimeout(timer);
            }
        });
    };

    return (
        <div className="min-h-screen bg-white relative">
            <div className="w-full pb-24">
                <Image
                    src="https://d355fm4icfleo1.cloudfront.net/public/6svHCeo8VX/image/e1329cdc1a224b7e907593adc8d92398.jpeg"
                    alt="活动图片"
                    width={1200}
                    height={2400}
                    className="w-full h-auto object-cover"
                    priority
                />
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/20 to-transparent">
                <button
                    onClick={handleDownloadClick}
                    className="w-full bg-black text-white py-4 px-6 rounded-3xl font-medium text-lg hover:bg-gray-800 transition-colors duration-200 shadow-lg"
                    aria-label="打開應用"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleDownloadClick();
                        }
                    }}
                >
                    打開應用
                </button>
            </div>
        </div>
    );
};

export default ActivityPage;

