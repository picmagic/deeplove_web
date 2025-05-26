import styles from './terms.module.css'

export default function TermsOfUse() {
	return (
		<div className={styles.container}>
			<h1 className={styles.title}>TERMS OF USE</h1>
			<p className={styles.date}>Effective date: May 14, 2025</p>

			<section className={styles.section}>
				<h2>I. INTRODUCTION</h2>
				<p>
					Please read this Agreement carefully before downloading, installing, or using the App.
				</p>
				<p>
					By downloading, installing, or using the App, you acknowledge that you have read, understood, and agreed to this Agreement, which becomes effective on the date of your first use. Your continued use of the App indicates your acceptance of and compliance with this Agreement.
				</p>
				<p>
					If you do not agree with any provision of this Agreement, you are not authorized to access, download, install, or use the App. In such case, you must immediately cease any download or installation process and remove the App from any devices under your control.
				</p>
			</section>

			<section className={styles.section}>
				<h2>II. CHANGES TO THIS AGREEMENT</h2>
				<p>
					We reserve the right to modify this Agreement at any time at our sole discretion. Changes will be reflected in an updated version of this Agreement. By continuing to use the App after such updates, you accept the modified terms. It is your responsibility to review this Agreement periodically for any changes.
				</p>
			</section>

			<section className={styles.section}>
				<h2>III. USE OF THE SERVICE</h2>
				<p>
					The Service is available only to users who can form legally binding contracts and comply with all applicable laws. Users under 18 years of age are prohibited from creating accounts, except when invited by parents or legal guardians. The Service is not available to previously removed users.
				</p>
				<p>
					You confirm that you are either over 18 years old, an emancipated minor, or have parental/guardian consent, and are fully capable of understanding and complying with this Agreement.
				</p>
			</section>

			<section className={styles.section}>
				<h2>IV. GENERAL TERMS</h2>
				<p>
					The App is designed for personal, non-commercial use only. You agree to use the App solely for its intended purposes.
				</p>
			</section>

			<section className={styles.section}>
				<h2>V. PRIVACY POLICY</h2>
				<p>
					We value your privacy. Our Privacy Policy explains how we handle your personal data. By using the App, you accept our Privacy Policy. We may update the Privacy Policy periodically. Continued use of the App after such updates constitutes acceptance of the changes. If you disagree with any part of the Privacy Policy, you must stop using the App immediately.
				</p>
			</section>

			<section className={styles.section}>
				<h2>VI. SERVICE AVAILABILITY AND TERMINATION</h2>
				<p>
					We may modify, suspend, or terminate the Service at any time without notice. We reserve the right to terminate your access for any reason, including violation of this Agreement. Upon termination, you remain bound by this Agreement.
				</p>
				<p>
					You are responsible for all data usage and costs associated with using the Service. We are not liable for your interactions with other users or their actions.
				</p>
			</section>

			<section className={styles.section}>
				<h2>VII. PROHIBITED BEHAVIOR</h2>
				<p>You agree not to use the App for:</p>
				<ul>
					<li>Unlawful or unauthorized purposes</li>
					<li>Defamatory content</li>
					<li>Obscene or offensive material</li>
					<li>Copyright or trademark infringement</li>
					<li>Promotion of illegal activities</li>
				</ul>
				<p>
					You may not share, modify, reverse engineer, or create derivative works from the App. Unauthorized distribution or commercial use is prohibited.
				</p>
			</section>

			<section className={styles.section}>
				<h2>VIII. SERVICE FUNCTION</h2>
				<p>
					Deeplove AI is for entertainment purposes only. You are responsible for all content created and shared through the App. The App requires a compatible device and internet connection. We do not guarantee uninterrupted or error-free service.
				</p>
			</section>

			<section className={styles.section}>
				<h2>IX. CHARGES</h2>
				<p>
					The App is free to download with basic features. Premium features are available through subscription. Subscriptions can be managed through your Google Account settings. Cancellation does not entitle you to a refund for the current billing period.
				</p>
			</section>

			<section className={styles.section}>
				<h2>X. DISCLAIMER OF WARRANTIES</h2>
				<p>
					The App and its services are provided "as is" without any warranties. We do not guarantee uninterrupted, error-free service or virus-free operation. You are responsible for obtaining necessary consents for voice tracking.
				</p>
				<h3>Technical Limitations</h3>
				<p>
					Voice cloning technology may not perfectly replicate original voices. Users assume all risks associated with technical limitations. Users must ensure legal authorization for voice samples and comply with all applicable laws. The service is not intended for high-risk applications.
				</p>
			</section>

			<section className={styles.section}>
				<h2>XI. LIMITATION OF LIABILITY</h2>
				<p>
					We are not liable for any damages arising from the use of the App or its services. This includes direct, indirect, special, or consequential damages. We are not responsible for third-party content or legal actions related to your use of the App.
				</p>
			</section>

			<section className={styles.section}>
				<h2>XII. LEGAL COMPLIANCE</h2>
				<p>
					You must not be located in a country under U.S. Government embargo or designated as a terrorist-supporting country, and must not be listed on any U.S. Government prohibited parties list.
				</p>
			</section>

			<section className={styles.section}>
				<h2>XIII. THIRD PARTY BENEFICIARY</h2>
				<p>
					Apple and its subsidiaries are third-party beneficiaries of this Agreement and may enforce its terms.
				</p>
			</section>

			<section className={styles.section}>
				<h2>XIV. GOVERNING LAW</h2>
				<p>
					This Agreement is governed by the laws of the State of New York, U.S.A., without regard to conflicts of law principles.
				</p>
			</section>

			<section className={styles.section}>
				<h2>XV. TERMINATION</h2>
				<p>
					We may terminate this Agreement at any time. Upon termination, your rights and licenses end, and you must cease using the App.
				</p>
			</section>

			<section className={styles.section}>
				<h2>XVI. SEVERABILITY</h2>
				<p>
					If any provision of this Agreement becomes invalid, it shall be modified or removed while maintaining the validity of the remaining terms. You may not transfer your rights under this Agreement to any third party.
				</p>
			</section>

			<section className={styles.section}>
				<h2>XVII. CONTACT INFORMATION</h2>
				<p>
					For support or questions about this Agreement, please contact us at:{' '}
					<a href='mailto:deridderkoehn@gmail.com'>deridderkoehn@gmail.com</a>
				</p>
			</section>
		</div>
	)
}
