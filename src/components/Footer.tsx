import type React from "react";
import { memo } from "react";

const Footer: React.FC = memo(() => {
    return (
        <div id="footer" style={{ display: "block", visibility: "visible" }}>
            Powered by <a href="https://scp-jp.org/">SCP-JP.org</a>
        </div>
    );
});

Footer.displayName = "Footer";

export default Footer;
