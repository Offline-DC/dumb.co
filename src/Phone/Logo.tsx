
function Logo() {

    const logoStyle = {
        maxHeight: "40px" as const,
        textAlign: "center" as const,
        paddingBottom: "10px" as const
    }
    return (
        <div style={logoStyle}>
            <img src="/img/offlineLogo.png" alt="Offline Logo" style={{ margin: "auto", width: "auto", height: "100%", boxShadow: "none", border: "none"
             }} />
        </div>
    );
}
export default Logo;