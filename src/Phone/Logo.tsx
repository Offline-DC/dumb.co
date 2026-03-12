
function Logo() {

    const logoStyle = {
        maxHeight: "40px" as const,
        textAlign: "center" as const,
        paddingBottom: "0px" as const,
    }
    return (
        <div style={logoStyle}>
            <img src="/img/dumbco.png" alt="Dumb & Co. Logo" style={{ margin: "auto", marginTop: "-20px", width: "auto", height: "200%", boxShadow: "none", border: "none"
             }} />
        </div>
    );
}
export default Logo;