import type { Metadata } from 'next'
import styles from '../notice/notice.module.css'

export const metadata: Metadata = {
    title: '維護通知',
}

export default function ScheduledMaintenanceNoticeZhTw() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>維護通知</h1>

            <section className={styles.section}>
                <p>
                    為了提升服務穩定性,Deeplove 將於
                    <span className={styles.highlight}> 8 月 4 日 06:00 至 11:00(UTC)</span>
                    進行排定的服務升級。
                </p>
                <p>
                    在此期間,服務可能暫時無法使用或出現間歇性問題,請提前完成重要操作。
                </p>
                <p>
                    服務恢復後我們將立即通知您。如有任何問題,歡迎透過我們的 Discord 社群與我們聯繫。
                </p>
                <p>感謝您的理解與支持。</p>
                <p className={styles.signature}>Deeplove 團隊</p>
            </section>
        </div>
    )
}
