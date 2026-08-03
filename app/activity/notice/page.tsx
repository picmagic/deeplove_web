import type { Metadata } from 'next'
import styles from './notice.module.css'

export const metadata: Metadata = {
    title: 'Scheduled Maintenance Notice',
}

export default function ScheduledMaintenanceNotice() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Scheduled Maintenance Notice</h1>

            <section className={styles.section}>
                <p>
                    To improve service stability, Deeplove will perform a database migration on{' '}
                    <span className={styles.highlight}>August 4, from 06:00 to 11:00 UTC</span>.
                </p>
                <p>
                    During this time, the service may be temporarily unavailable or experience intermittent issues. Please complete any important actions in advance.
                </p>
                <p>
                    We&apos;ll notify you as soon as the service has been fully restored. If you have any questions, please contact us through our Discord community.
                </p>
                <p>Thank you for your understanding and support.</p>
                <p className={styles.signature}>The Deeplove Team</p>
            </section>
        </div>
    )
}
