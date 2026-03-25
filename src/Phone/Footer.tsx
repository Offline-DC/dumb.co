function Footer() {

    const footerStyle = {
        textAlign: "center" as const,
        paddingTop: "0.5em" as const,
        color: "white" as const,
        fontSize: "0.7em" as const
    }

    const iconsContainerStyle = {
        display: "flex" as const,
        justifyContent: "center" as const,
        gap: "0.75rem" as const,
        marginTop: "0.4rem" as const
    }

    const iconStyle = {
        width: "18px" as const,
        height: "18px" as const
    }

    const currentYear = new Date().getFullYear();
    return (
        <div style={footerStyle}>
            © {currentYear} Dumb Co.
            <div style={iconsContainerStyle}>
                <img src="/img/anti-socials/anti-social-instagram.svg" alt="Anti-Social Instagram" style={iconStyle} />
                <img src="/img/anti-socials/anti-social-x.svg" alt="Anti-Social X" style={iconStyle} />
                <img src="/img/anti-socials/anti-social-facebook.svg" alt="Anti-Social Facebook" style={iconStyle} />
            </div>
        </div>
    );
}

export default Footer;