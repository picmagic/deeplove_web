import type { Metadata } from 'next'
import Image from 'next/image'
import { headers } from 'next/headers'

export const metadata: Metadata = {
    title: '',
}

const getIsChineseLocale = (acceptLanguageHeader: string): boolean => {
    const header = acceptLanguageHeader.toLowerCase()
    if (!header) {
        return false
    }

    // Treat any zh locales (Simplified/Traditional) as Chinese
    const chineseIndicators = [
        'zh-cn', 'zh-sg', 'zh-hans',
        'zh-tw', 'zh-hk', 'zh-mo', 'zh-hant',
        ' zh', 'zh;', 'zh,'
    ]

    return chineseIndicators.some((indicator) => header.includes(indicator)) || header.startsWith('zh')
}

const EventImageOnlyPage = async () => {
    const headersList = await headers()
    const acceptLanguage = headersList.get('accept-language') || ''

    const isChinese = getIsChineseLocale(acceptLanguage)

    const imageUrl = isChinese
        ? 'https://d355fm4icfleo1.cloudfront.net/public/6svHCeo8VX/image/089cb3f32d8d48cc869bc0127ed9a54a.png'
        : 'https://d355fm4icfleo1.cloudfront.net/public/6svHCeo8VX/image/66fbc5341eec4b01afa71630b829995d.png'

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