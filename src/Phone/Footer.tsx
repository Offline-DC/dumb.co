function Footer() {

    const footerStyle = {
        textAlign: "center" as const,
        paddingTop: "1.1em" as const,
        color: "white" as const,
        fontSize: "0.8em" as const
    }
    const currentYear = new Date().getFullYear();
    return (
        <div style={footerStyle}>
            © {currentYear} Offline Inc.
        </div>
    );
}

export default Footer;