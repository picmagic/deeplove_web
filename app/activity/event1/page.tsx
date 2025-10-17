import type { Metadata } from 'next'
import Image from 'next/image'

// export const metadata: Metadata = {
//     title: '活动',
// }

const EventImageOnlyPage = () => {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <Image
                src="https://d355fm4icfleo1.cloudfront.net/public/6svHCeo8VX/image/089cb3f32d8d48cc869bc0127ed9a54a.png"
                alt="event"
                width={1200}
                height={2400}
                className="w-full h-auto object-cover"
                priority
            />
        </div>
    );
};

export default EventImageOnlyPage;