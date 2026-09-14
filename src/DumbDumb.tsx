import * as React from "react";

export default function DumbDumb(): React.ReactElement {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				height: "100%",
				width: "100%",
				padding: "1rem",
				boxSizing: "border-box",
				color: "#ffffffff",
				textAlign: "center",
			}}
		>
			<div style={{fontSize: "1.4rem", lineHeight: 1.4 }}>
				<strong style={{ color: "#3ae050ff" }}>Dumb Down App</strong>
				<div>Check back again very soon!</div>
                <br />
			</div>
		</div>
	);
}

