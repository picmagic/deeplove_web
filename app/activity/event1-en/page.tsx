import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
    title: 'Event',
}

const EventImageOnlyPage = () => {
    const imageUrl = 'https://d355fm4icfleo1.cloudfront.net/public/6svHCeo8VX/image/66fbc5341eec4b01afa71630b829995d.png'

    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <Image
                src={imageUrl}
                alt="event"
                width={1200}
                height={2400}
                className="w-full h-auto object-cover"
                priority
            />
        </div>
    )
}

export default EventImageOnlyPage