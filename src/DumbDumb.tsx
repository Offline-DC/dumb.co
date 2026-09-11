import * as React from "react";
import { useState, useEffect } from "react";
import type { CSSProperties, ReactNode } from "react";
import ReactGA from 'react-ga4'; 
import "./FAQs.css";

const ios_url = "https://apps.apple.com/us/app/dumb-down/id6754464163"; 
const android_url = "https://play.google.com/store/apps/details?id=com.offlineinc.dumbdown&hl=en_US"; 

const qr_svg = "/dumbdown-qr.svg";

type Platform = "ios" | "android" | "other";

function detectPlatform(): Platform {
	if (typeof navigator === "undefined" ) return 'other'; 
	const ua = navigator.userAgent || ""; 
	if (/android/i.test(ua)) return "android"; 
	if (/iPad|iPhone|iPod/.test(ua)) return "ios";
	if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return "ios"; 
	return "other";
}

export default function DumbDumb(): React.ReactElement {

	const [platform] = useState<Platform>(detectPlatform); 

	const store_url = platform === 'android' ? android_url : ios_url; 
	const store_name = platform === 'android' ? 'Google Play' : 'App Store'; 

	useEffect(() => {
	if (platform === 'other') return; 
	ReactGA.event({
		category: 'dumbdown',
		action: 'store_redirect', 
		label: platform,
	});


	window.location.replace(store_url); 
	}, [platform, store_url]);

	if (platform !== 'other'){
		return (
			<Shell>
				<h1 style={styles.h1}>Dumb Down</h1>
				<p style={styles.body}>Opening {store_name}...</p>
				<a href= {store_url} className="faq-tab" style={styles.button}>
					Tap here if nothing happens
				</a>
			</Shell>
		);
	}

	return (
		<Shell>
			<h1 style={styles.h1}>get the dumb down App to begin ur dumb journey</h1>
			<p style={styles.body}> scan with ur smart phone</p>

			<div style={styles.qrCard}>
				<img
				src={qr_svg}
				alt="QR code linking to dumb.co/dumbdown"
				width={200}
				height={200}
				style={{display: "block", width: 200, height: 200}}
				/>
			</div>

			<p style={{ ...styles.body, fontSize: '0.95rem', opacity: 0.7}}>
				or pick your platform
			</p>

			<div style={styles.buttonRow}>
				<StoreLink href={ios_url} platform='ios'>
					App Store
				</StoreLink>
				<StoreLink href={android_url} platform='android'>
					Google Play Store
				</StoreLink>
			</div>
		</Shell>
	);
}

function StoreLink({
  href,
  platform,
  children,
}: {
  href: string;
  platform: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className="faq-tab" style={styles.button}
      onClick={() =>
        ReactGA.event({
          category: "dumbdown",
          action: "store_click",
          label: platform,
        })
      }
    >
      {children}
    </a>
  );
}

function Shell({children} : {children: ReactNode}) {
	return(
		<div style={styles.page}>
			<div style={styles.stack}>{children}</div>
		</div>
	);
}

const styles: Record<string, CSSProperties> = {
	page: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		height: "100%",
		width: "100%",
		padding: "1.5rem",
		boxSizing: "border-box",
		color: "#1d1d1d",
		textAlign: "center",
		fontFamily: '"Rubik", "Helvetica Neue", Arial, sans-serif',
	},
	stack: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		gap: "1rem",
	},
	h1: {
		margin: 0,
		fontFamily: '"Cheltenham", Georgia, "Times New Roman", serif',
		fontWeight: 700,
		fontSize: "clamp(2rem, 4.5vw, 3.5rem)",
		lineHeight: 1,
		letterSpacing: "-0.5px",
		textTransform: "lowercase",
		color: "#1d1d1d",
	},
  body: {
    margin: 0,
    fontFamily: '"Rubik", "Helvetica Neue", Arial, sans-serif',
    fontSize: "1.1rem",
    lineHeight: 1.4,
    color: "#1d1d1d",
  },
  qrCard: {
    background: "#ffffff",
    padding: "1rem",
    borderRadius: 12,
    boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
  },
  buttonRow: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  button: {
    display: "inline-block",
    textDecoration: "none",
  },
};

