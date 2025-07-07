import styles from './privacy.module.css'

export default function PrivacyPolicy() {
	return (
		<div className={styles.container}>
			<h1 className={styles.title}>PRIVACY POLICY</h1>
			<p className={styles.date}>Effective date: May 14, 2025</p>

			<section className={styles.section}>
				<h2>Overview</h2>
				<p>
					Welcome to DeepLove AI. We are committed to protecting and respecting
					your privacy.
				</p>
				<p>
					This Policy outlines our practices regarding the collection, use,
					disclosure, and protection of information collected through our
					Service, as well as your choices regarding information collection and
					usage.
				</p>
				<p>
					This Privacy Policy applies to all users and others who access our App
					(&quot;Users&quot;).
				</p>
				<p>
					Please carefully review this privacy policy to understand how your
					personal information may be processed. By using our app, you
					acknowledge that you have read, understood, and agree to be bound by
					these terms.
				</p>
			</section>

			<section className={styles.section}>
				<h2>I. Information We Collect</h2>
				<h3>Information You Provide:</h3>
				<ul>
					<li>
						Personal identification data that directly or indirectly identifies
						you. When using our device, we automatically collect certain
						information including device data, device ID, and technical
						information.
					</li>
					<li>
						Account Information: When creating an account, we require
						information such as user ID, email address, or other login
						credentials based on App settings.
					</li>
					<li>
						Content Information: Photos, videos, audio files, documents, and
						other data you upload through the App.
					</li>
				</ul>

				<h3>Automatically Collected Information</h3>
				<p>
					We automatically collect certain information when you visit, use, or
					navigate our Apps. This includes:
				</p>
				<ul>
					<li>IP address and device characteristics</li>
					<li>Browser type and operating system</li>
					<li>Language preferences and location data</li>
					<li>Usage patterns and technical information</li>
				</ul>
				<p>
					This information is essential for maintaining app security, operation,
					and internal analytics.
				</p>

				<h3>Voice Data Collection & Usage</h3>
				<p>
					With your explicit authorization, we collect voice samples and related
					biometric data (vocal characteristics, pitch) exclusively for voice
					cloning technology. This data is used solely for specified service
					scenarios (voice synthesis, custom voice assistants) and requires
					additional consent for any secondary use.
				</p>

				<h3>Data Security & Storage</h3>
				<p>
					All voice data is encrypted and stored on secure servers with strict
					access controls. We retain data only as long as necessary for service
					provision, unless legally required otherwise. Users can request
					permanent data deletion at any time.
				</p>

				<h3>Data Sharing & Third Parties</h3>
				<p>
					We do not share or sell voice data to third parties without explicit
					consent. Third-party technical partners are contractually bound to
					maintain equivalent security and confidentiality standards.
				</p>

				<h3>Analytics & Tracking</h3>
				<p>
					We use various tracking technologies (cookies, web beacons, log files)
					to collect usage and device information. This helps us improve our
					services and user experience.
				</p>
				<p>
					We utilize third-party analytics tools (Google, Facebook) to analyze
					device and app usage data. We are not responsible for how these third
					parties process your personal data. Please direct any privacy-related
					questions to these third parties.
				</p>

				<h3>Device Information</h3>
				<p>We collect the following device information:</p>
				<ul>
					<li>Mobile device type and operating system version</li>
					<li>Device region and SIM card information</li>
					<li>IP address</li>
					<li>Advertising ID (unique identifier for your device)</li>
				</ul>
			</section>

			<section className={styles.section}>
				<h2>II. How We Use Your Information</h2>
				<p>We use your information to:</p>
				<ul>
					<li>
						Provide and maintain our services using submitted and automatically
						processed information
					</li>
					<li>
						Improve and optimize our App by analyzing user behavior, detecting
						issues, and enhancing performance
					</li>
					<li>
						Communicate with you about updates, marketing notifications, and
						respond to your inquiries
					</li>
					<li>
						Enhance user experience by remembering your preferences and login
						information
					</li>
				</ul>
				<p>
					We will notify you of any new purposes for processing your personal
					data by updating this Privacy Policy.
				</p>
			</section>

			<section className={styles.section}>
				<h2>III. Information Sharing</h2>
				<p>
					DeepLove AI shares personally identifiable information with third
					parties only when:
				</p>
				<ul>
					<li>You have given permission</li>
					<li>It's necessary to complete a service action</li>
					<li>Required by law</li>
				</ul>

				<h3>Service Improvement</h3>
				<p>
					We may share aggregated usage data with third parties to improve our
					services, ensuring no individual user can be identified.
				</p>

				<h3>Data Retention</h3>
				<p>
					We retain your personal information as long as necessary for service
					provision and legal compliance. You can request account deletion and
					data erasure at any time. Some data may be retained longer if required
					for legal, accounting, or security purposes.
				</p>
			</section>

			<section className={styles.section}>
				<h2>IV. Security Measures</h2>
				<p>
					We implement various security technologies and procedures to protect
					your information from loss, misuse, and unauthorized access. While we
					strive for 100% security, no system is completely immune to breaches.
					We maintain a secure environment using the latest technologies for
					data collection, storage, and tracking.
				</p>
			</section>

			<section className={styles.section}>
				<h2>V. User Content & Copyright</h2>
				<p>
					You retain copyright over your original contributions (chat roles,
					dialogues). By using our features, you grant us a non-exclusive,
					worldwide, royalty-free license to use your content for service
					provision and improvement. We respect your intellectual property
					rights while maintaining control over AI-generated modifications for
					operational compliance.
				</p>
			</section>

			<section className={styles.section}>
				<h2>VI. Minor Protection</h2>
				<p>
					Our application is restricted to users 18 and older. We will
					immediately delete any personal information collected from minors
					without parental consent. We encourage parents to monitor their
					children's app usage and educate them about online safety.
				</p>
			</section>

			<section className={styles.section}>
				<h2>VII. Policy Updates</h2>
				<p>
					We may update this privacy policy without prior notice. Please check
					this section regularly for changes.
				</p>
			</section>

			<section className={styles.section}>
				<h2>VIII. Consent</h2>
				<p>By using our site, you consent to this privacy policy.</p>
			</section>

			<section className={styles.section}>
				<h2>IX. Contact Us</h2>
				<p>
					For privacy policy questions, please contact us at:{' '}
					<a href='mailto:support@deeploveai.net'>support@deeploveai.net</a>
				</p>
			</section>
		</div>
	)
}
